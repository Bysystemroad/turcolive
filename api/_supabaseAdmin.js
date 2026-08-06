import { createClient } from '@supabase/supabase-js';

const LISTING_PHOTOS_BUCKET = 'listing-photos';
const LISTINGS_TABLE = 'listings';

let adminClient;

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase server environment variables are missing.');
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

export { LISTING_PHOTOS_BUCKET, LISTINGS_TABLE };

export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export async function readMultipartFormData(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
    } else if (value) {
      headers.set(key, value);
    }
  });

  const request = new Request('http://localhost/api/listings', {
    method: req.method,
    headers,
    body: Buffer.concat(chunks),
    duplex: 'half',
  });

  return request.formData();
}

export function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  return String(ip || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

export async function requireAdminUser(req) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    throw new Error('Admin oturumu bulunamadı.');
  }

  const supabase = getSupabaseAdmin();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    throw new Error('Admin oturumu geçersiz.');
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    throw new Error('Bu işlem için admin yetkisi gerekli.');
  }

  return userData.user;
}

export function getStoragePathFromPublicUrl(publicUrl) {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${LISTING_PHOTOS_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return '';

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return '';
  }
}
