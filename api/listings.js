import { createHash, randomUUID } from 'node:crypto';
import { Redis } from '@upstash/redis';
import {
  getClientIp,
  getProfileForUser,
  getSupabaseAdmin,
  LISTING_PHOTOS_BUCKET,
  LISTINGS_TABLE,
  readMultipartFormData,
  requireAuthenticatedUser,
  sendJson,
} from './_supabaseAdmin.js';

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MIN_IMAGES = 4;
const MAX_IMAGES = 10;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const FILE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_WINDOW_SECONDS = 24 * 60 * 60;
const RATE_LIMIT_MAX = 2;
const RATE_LIMIT_MESSAGE = 'Günlük ilan gönderme sınırına ulaştınız.';
const ACTIVE_SUBMISSION_MAX = 1;
const ACTIVE_SUBMISSION_TTL_MS = 3 * 60 * 1000;
const ACTIVE_SUBMISSION_MESSAGE = 'İlan gönderme işleminiz devam ediyor. Lütfen mevcut işlemin tamamlanmasını bekleyin.';
const INVALID_IMAGE_MESSAGE = 'Yüklenen dosyalardan biri geçerli bir görsel değil.';
const TURNSTILE_EXPECTED_ACTION = 'listing_submit';
const PRODUCTION_TURNSTILE_HOSTNAMES = new Set(['turcolive.com', 'www.turcolive.com']);

const ACTIVE_SUBMISSION_ACQUIRE_SCRIPT = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
if current >= tonumber(ARGV[1]) then
  local ttl = redis.call("PTTL", KEYS[1])
  return {0, current, ttl}
end
current = redis.call("INCR", KEYS[1])
redis.call("PEXPIRE", KEYS[1], ARGV[2])
local ttl = redis.call("PTTL", KEYS[1])
return {1, current, ttl}
`;

const ACTIVE_SUBMISSION_RELEASE_SCRIPT = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
if current <= 1 then
  redis.call("DEL", KEYS[1])
  return 0
end
current = redis.call("DECR", KEYS[1])
return current
`;

const RATE_LIMIT_CLAIM_SCRIPT = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
if current >= tonumber(ARGV[1]) then
  local ttl = redis.call("PTTL", KEYS[1])
  return {0, current, ttl}
end
current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[2])
end
local ttl = redis.call("PTTL", KEYS[1])
return {1, current, ttl}
`;

// Emergency fallback only. Vercel serverless instances do not share this Map,
// so Redis is the production limiter and this only softens failures if Redis is unavailable.
const fallbackRateLimitStore = new Map();
let redisClient;
let rateLimitClaimScript;
let activeSubmissionAcquireScript;
let activeSubmissionReleaseScript;
let redisConfigurationLogged = false;

function getRedisCredentials() {
  const redisUrl = process.env.UPSTASH_REDIS_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  return { redisUrl, redisToken };
}

function logRedisConfigurationStatus(isConfigured) {
  if (redisConfigurationLogged) return;
  redisConfigurationLogged = true;
  console.info(`Redis rate limiter configured: ${Boolean(isConfigured)}`);
}

function getRedisClient() {
  const { redisUrl, redisToken } = getRedisCredentials();
  const isConfigured = Boolean(redisUrl && redisToken);
  logRedisConfigurationStatus(isConfigured);

  if (!isConfigured) return null;

  if (!redisClient) {
    redisClient = new Redis({ url: redisUrl, token: redisToken });
  }

  return redisClient;
}

function getRateLimitClaimScript() {
  const redis = getRedisClient();
  if (!redis) return null;

  if (!rateLimitClaimScript) {
    rateLimitClaimScript = redis.createScript(RATE_LIMIT_CLAIM_SCRIPT);
  }

  return rateLimitClaimScript;
}

function getActiveSubmissionAcquireScript() {
  const redis = getRedisClient();
  if (!redis) return null;

  if (!activeSubmissionAcquireScript) {
    activeSubmissionAcquireScript = redis.createScript(ACTIVE_SUBMISSION_ACQUIRE_SCRIPT);
  }

  return activeSubmissionAcquireScript;
}

function getActiveSubmissionReleaseScript() {
  const redis = getRedisClient();
  if (!redis) return null;

  if (!activeSubmissionReleaseScript) {
    activeSubmissionReleaseScript = redis.createScript(ACTIVE_SUBMISSION_RELEASE_SCRIPT);
  }

  return activeSubmissionReleaseScript;
}

function hashIp(ip) {
  return createHash('sha256').update(String(ip || 'unknown')).digest('hex').slice(0, 32);
}

function getRateLimitKey(ip) {
  return `turcolive:listing-submit:${hashIp(ip)}`;
}

function getActiveSubmissionKey(ip) {
  return `turcolive:listing-active:${hashIp(ip)}`;
}

function retryAfterFromMs(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return RATE_LIMIT_WINDOW_SECONDS;
  return Math.max(1, Math.ceil(milliseconds / 1000));
}

function setRetryAfter(res, retryAfterSeconds) {
  res.setHeader('Retry-After', String(retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS));
}

function getFallbackRecord(ip) {
  const now = Date.now();
  const key = getRateLimitKey(ip);
  const current = fallbackRateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    fallbackRateLimitStore.set(key, next);
    return next;
  }

  return current;
}

function getFallbackActiveRecord(ip) {
  const now = Date.now();
  const key = getActiveSubmissionKey(ip);
  const current = fallbackRateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 0, resetAt: now + ACTIVE_SUBMISSION_TTL_MS };
    fallbackRateLimitStore.set(key, next);
    return next;
  }

  return current;
}

function getFallbackStatus(ip) {
  const record = getFallbackRecord(ip);
  return {
    limited: record.count >= RATE_LIMIT_MAX,
    retryAfterSeconds: retryAfterFromMs(record.resetAt - Date.now()),
    source: 'memory-fallback',
  };
}

function acquireFallbackActiveSubmission(ip) {
  const record = getFallbackActiveRecord(ip);

  if (record.count >= ACTIVE_SUBMISSION_MAX) {
    return {
      allowed: false,
      retryAfterSeconds: retryAfterFromMs(record.resetAt - Date.now()),
      source: 'memory-fallback',
    };
  }

  record.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: retryAfterFromMs(record.resetAt - Date.now()),
    source: 'memory-fallback',
  };
}

function releaseFallbackActiveSubmission(ip) {
  const key = getActiveSubmissionKey(ip);
  const record = fallbackRateLimitStore.get(key);
  if (!record) return;

  record.count = Math.max(0, record.count - 1);
  if (record.count === 0) fallbackRateLimitStore.delete(key);
}

function claimFallbackSuccessfulSubmission(ip) {
  const record = getFallbackRecord(ip);

  if (record.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterSeconds: retryAfterFromMs(record.resetAt - Date.now()),
      source: 'memory-fallback',
    };
  }

  record.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: retryAfterFromMs(record.resetAt - Date.now()),
    source: 'memory-fallback',
  };
}

async function getPersistentStatus(ip) {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const key = getRateLimitKey(ip);
    const [count, ttlMs] = await Promise.all([redis.get(key), redis.pttl(key)]);
    const numericCount = Number(count || 0);

    return {
      limited: numericCount >= RATE_LIMIT_MAX,
      retryAfterSeconds: retryAfterFromMs(Number(ttlMs)),
      source: 'redis',
    };
  } catch {
    return null;
  }
}

async function getRateLimitStatus(ip) {
  return (await getPersistentStatus(ip)) || getFallbackStatus(ip);
}

async function acquirePersistentActiveSubmission(ip) {
  const script = getActiveSubmissionAcquireScript();
  if (!script) return null;

  try {
    const key = getActiveSubmissionKey(ip);
    const result = await script.eval([key], [String(ACTIVE_SUBMISSION_MAX), String(ACTIVE_SUBMISSION_TTL_MS)]);
    const [allowed, , ttlMs] = Array.isArray(result) ? result.map(Number) : [0, 0, ACTIVE_SUBMISSION_TTL_MS];

    return {
      allowed: allowed === 1,
      retryAfterSeconds: retryAfterFromMs(ttlMs),
      source: 'redis',
    };
  } catch {
    return null;
  }
}

async function releasePersistentActiveSubmission(ip) {
  const script = getActiveSubmissionReleaseScript();
  if (!script) return false;

  try {
    await script.eval([getActiveSubmissionKey(ip)], []);
    return true;
  } catch {
    return false;
  }
}

async function acquireActiveSubmission(ip) {
  return (await acquirePersistentActiveSubmission(ip)) || acquireFallbackActiveSubmission(ip);
}

async function releaseActiveSubmission(ip, source) {
  if (source === 'redis') {
    await releasePersistentActiveSubmission(ip);
    return;
  }

  releaseFallbackActiveSubmission(ip);
}

async function claimPersistentSuccessfulSubmission(ip) {
  const script = getRateLimitClaimScript();
  if (!script) return null;

  try {
    const key = getRateLimitKey(ip);
    const result = await script.eval([key], [String(RATE_LIMIT_MAX), String(RATE_LIMIT_WINDOW_MS)]);
    const [allowed, , ttlMs] = Array.isArray(result) ? result.map(Number) : [0, 0, RATE_LIMIT_WINDOW_MS];

    return {
      allowed: allowed === 1,
      retryAfterSeconds: retryAfterFromMs(ttlMs),
      source: 'redis',
    };
  } catch {
    return null;
  }
}

async function claimSuccessfulSubmission(ip) {
  return (await claimPersistentSuccessfulSubmission(ip)) || claimFallbackSuccessfulSubmission(ip);
}

function requiredText(formData, key) {
  return String(formData.get(key) || '').trim();
}

function isProfileComplete(profile) {
  const fullName = String(profile?.full_name || '').trim();
  const phone = String(profile?.phone || '').trim();
  return Boolean(fullName && phone && phone.startsWith('+'));
}

function validateListingPayload(formData, user, profile) {
  const listing = {
    user_id: user.id,
    owner_email: user.email || profile?.email || '',
    full_name: requiredText(formData, 'fullName'),
    title: requiredText(formData, 'title'),
    city: requiredText(formData, 'city'),
    address: requiredText(formData, 'district'),
    monthly_rent: requiredText(formData, 'rent'),
    deposit: requiredText(formData, 'deposit'),
    room_type: requiredText(formData, 'roomType'),
    house_type: requiredText(formData, 'homeType'),
    target_group: requiredText(formData, 'targetAudience'),
    gender_preference: requiredText(formData, 'genderPreference'),
    people_count: requiredText(formData, 'peopleCount'),
    description: requiredText(formData, 'description'),
    contact_info: requiredText(formData, 'contact'),
    phone_number: requiredText(formData, 'phoneNumber'),
    image_urls: [],
    status: 'pending',
  };

  const missingField = Object.entries(listing).find(([key, value]) => {
    return key !== 'image_urls' && key !== 'status' && !value;
  });

  if (missingField) {
    throw new Error('Tüm zorunlu ilan alanları doldurulmalıdır.');
  }

  return listing;
}

function getImageFiles(formData) {
  return formData.getAll('images').filter((file) => {
    return file && typeof file === 'object' && typeof file.arrayBuffer === 'function';
  });
}

function detectImageType(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  return '';
}

async function validateActualImageContent(file) {
  const headerSource = typeof file.slice === 'function' ? file.slice(0, 16) : file;
  const headerBuffer = await headerSource.arrayBuffer();
  const detectedType = detectImageType(new Uint8Array(headerBuffer));

  if (!detectedType || detectedType !== file.type) {
    throw new Error(INVALID_IMAGE_MESSAGE);
  }
}

async function validateImageFiles(files) {
  if (files.length < MIN_IMAGES) {
    throw new Error('En az 4 fotoğraf yüklemelisiniz.');
  }

  if (files.length > MAX_IMAGES) {
    throw new Error('En fazla 10 fotoğraf yükleyebilirsiniz.');
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error('Sadece JPG, PNG veya WebP formatında fotoğraf yükleyebilirsiniz.');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Her fotoğraf en fazla 8 MB olabilir.');
    }

    await validateActualImageContent(file);
  }
}

function isAllowedTurnstileHostname(hostname) {
  const normalizedHostname = String(hostname || '').toLowerCase();
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  if (PRODUCTION_TURNSTILE_HOSTNAMES.has(normalizedHostname)) return true;
  if (!isProduction && (normalizedHostname === 'localhost' || normalizedHostname === '127.0.0.1')) return true;

  return false;
}

async function verifyCaptcha(token, ip) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('CAPTCHA doğrulaması yapılandırılmamış.');
  }

  if (!token) {
    throw new Error('CAPTCHA doğrulaması zorunludur.');
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
      remoteip: ip,
    }),
  });

  const result = await response.json();

  if (!result.success || !isAllowedTurnstileHostname(result.hostname) || String(result.action || '') !== TURNSTILE_EXPECTED_ACTION) {
    throw new Error('CAPTCHA doğrulaması başarısız oldu.');
  }
}

async function uploadImages(supabase, files) {
  const folderId = randomUUID();
  const uploaded = [];

  for (const [index, file] of files.entries()) {
    const extension = FILE_EXTENSIONS[file.type];
    const filePath = `${folderId}/${randomUUID()}-${index + 1}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(LISTING_PHOTOS_BUCKET).upload(filePath, fileBuffer, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw new Error(`Fotoğraf yüklenemedi: ${error.message}`);
    }

    const { data } = supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(filePath);
    uploaded.push({ path: filePath, url: data.publicUrl });
  }

  return uploaded;
}

async function cleanupUploadedImages(supabase, uploadedImages) {
  const paths = uploadedImages.map((image) => image.path).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove(paths);
  }
}

async function cleanupInsertedListing(supabase, listingId) {
  if (listingId) {
    await supabase.from(LISTINGS_TABLE).delete().eq('id', listingId);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const ip = getClientIp(req);
  const rateLimitStatus = await getRateLimitStatus(ip);

  if (rateLimitStatus.limited) {
    setRetryAfter(res, rateLimitStatus.retryAfterSeconds);
    sendJson(res, 429, { error: RATE_LIMIT_MESSAGE });
    return;
  }

  let uploadedImages = [];
  let insertedListingId = '';
  let activeSubmission = null;

  try {
    const supabase = getSupabaseAdmin();
    const user = await requireAuthenticatedUser(req);
    const userRateLimitStatus = await getRateLimitStatus(`user:${user.id}`);

    if (userRateLimitStatus.limited) {
      setRetryAfter(res, userRateLimitStatus.retryAfterSeconds);
      sendJson(res, 429, { error: RATE_LIMIT_MESSAGE });
      return;
    }

    if (!user.email_confirmed_at) {
      sendJson(res, 403, { error: 'İlan vermek için e-posta adresinizi doğrulamalısınız.' });
      return;
    }

    const profile = await getProfileForUser(user.id);
    if (profile?.is_blocked) {
      sendJson(res, 403, { error: 'Hesabınız ilan paylaşımına kapatılmıştır.' });
      return;
    }

    if (!isProfileComplete(profile)) {
      sendJson(res, 403, { error: 'İlan vermeden önce profil bilgilerinizi tamamlamalısınız.' });
      return;
    }

    const formData = await readMultipartFormData(req);
    await verifyCaptcha(requiredText(formData, 'captchaToken'), ip);

    const listing = validateListingPayload(formData, user, profile);
    const imageFiles = getImageFiles(formData);
    await validateImageFiles(imageFiles);

    activeSubmission = await acquireActiveSubmission(ip);
    if (!activeSubmission.allowed) {
      setRetryAfter(res, activeSubmission.retryAfterSeconds);
      sendJson(res, 429, { error: ACTIVE_SUBMISSION_MESSAGE });
      return;
    }

    uploadedImages = await uploadImages(supabase, imageFiles);
    listing.image_urls = uploadedImages.map((image) => image.url);

    const { data, error } = await supabase.from(LISTINGS_TABLE).insert(listing).select('*').single();

    if (error) {
      await cleanupUploadedImages(supabase, uploadedImages);
      throw new Error(`İlan kaydedilemedi: ${error.message}`);
    }

    insertedListingId = data.id;
    const claim = await claimSuccessfulSubmission(ip);
    const userClaim = claim.allowed ? await claimSuccessfulSubmission(`user:${user.id}`) : claim;

    if (!claim.allowed || !userClaim.allowed) {
      await cleanupInsertedListing(supabase, insertedListingId);
      await cleanupUploadedImages(supabase, uploadedImages);
      setRetryAfter(res, claim.allowed ? userClaim.retryAfterSeconds : claim.retryAfterSeconds);
      sendJson(res, 429, { error: RATE_LIMIT_MESSAGE });
      return;
    }

    sendJson(res, 201, { listing: data });
  } catch (error) {
    if (uploadedImages.length > 0) {
      try {
        await cleanupUploadedImages(getSupabaseAdmin(), uploadedImages);
      } catch {
        // Best-effort cleanup only.
      }
    }

    sendJson(res, error.statusCode || 400, { error: error.message || 'İlan gönderilemedi.' });
  } finally {
    if (activeSubmission?.allowed) {
      await releaseActiveSubmission(ip, activeSubmission.source);
    }
  }
}
