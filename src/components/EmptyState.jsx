import { PlusCircle } from 'lucide-react';

export default function EmptyState({ onNavigate }) {
  return (
    <div className="rounded-[2.25rem] border border-dashed border-navy/20 bg-white p-8 text-center shadow-card sm:p-14">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blush text-turco ring-1 ring-turco/10">
        <PlusCircle size={30} />
      </span>
      <h2 className="mt-6 text-3xl font-black text-navy">Henüz aktif ilan bulunmuyor.</h2>
      <p className="mx-auto mt-3 max-w-xl text-navy/65">
        İlk ilanı sen paylaşarak TurcoLive topluluğunu başlatabilirsin.
      </p>
      <button
        type="button"
        onClick={() => onNavigate('ilan-ver')}
        className="mt-8 rounded-full bg-turco px-7 py-3.5 text-sm font-black text-white shadow-card transition hover:bg-coral"
      >
        İlk ilanı paylaş
      </button>
    </div>
  );
}
