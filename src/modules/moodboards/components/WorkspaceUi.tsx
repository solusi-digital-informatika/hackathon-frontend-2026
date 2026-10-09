import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, Check, CheckCircle2, Image, Loader2, Sparkles, X } from 'lucide-react';

export function Notice({ children, kind = 'error', onRetry }: {children: ReactNode; kind?: 'error' | 'info' | 'success'; onRetry?: () => void}) {
  return <div role={kind === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${kind === 'error' ? 'border-red-200 bg-red-50 text-red-800' : kind === 'success' ? 'border-forest-200 bg-forest-50 text-forest-700' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
    {kind === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0"/> : <AlertCircle size={18} className="mt-0.5 shrink-0"/>}
    <div className="flex-1 leading-relaxed">{children}</div>{onRetry && <button className="shrink-0 font-semibold underline" onClick={onRetry}>Coba lagi</button>}
  </div>;
}
export function Busy({ label = 'Memuat workspace…' }: {label?: string}) {
  return <div role="status" className="flex items-center justify-center gap-3 py-20 text-sm text-stone-500"><Loader2 size={20} className="animate-spin"/>{label}</div>;
}
export function Pill({ status }: {status: string}) {
  const map: Record<string, [string, string]> = {
    approved: ['Disetujui', 'bg-forest-50 text-forest-700'], succeeded: ['Perlu review', 'bg-amber-50 text-amber-800'],
    in_review: ['Perlu review', 'bg-amber-50 text-amber-800'], running: ['Menganalisis', 'bg-sky-50 text-sky-700'],
    queued: ['Dalam antrean', 'bg-sky-50 text-sky-700'], partial: ['Hasil parsial', 'bg-amber-50 text-amber-800'],
    failed: ['Analisis gagal', 'bg-red-50 text-red-700'], cancelled: ['Dibatalkan', 'bg-stone-100 text-stone-600'],
    draft: ['Draft', 'bg-stone-100 text-stone-600'], accepted: ['Diterima', 'bg-forest-50 text-forest-700'],
    edited: ['Dikoreksi', 'bg-sky-50 text-sky-700'], rejected: ['Ditolak', 'bg-stone-100 text-stone-600'],
    pending: ['Belum direview', 'bg-amber-50 text-amber-800'],
  };
  const [text, color] = map[status] || map.draft;
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium ${color}`}>
    {['running', 'queued'].includes(status) ? <Loader2 size={12} className="animate-spin"/> : ['approved', 'accepted'].includes(status) ? <Check size={12}/> : <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current"/>}{text}
  </span>;
}
export function Dialog({ title, children, onClose, busy = false, wide = false }: {title: string; children: ReactNode; onClose: () => void; busy?: boolean; wide?: boolean}) {
  const ref = useRef<HTMLDialogElement>(null); const id = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal?.();
    return () => { ref.current?.close?.(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} aria-modal="true" aria-labelledby={id} onCancel={event => {event.preventDefault(); if (!busy) onClose();}}
    className={`fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-xl backdrop:bg-ink/40 ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
    <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5"><h2 id={id} className="text-lg font-semibold">{title}</h2><button aria-label="Tutup dialog" disabled={busy} onClick={onClose} className="mb-button-ghost p-1.5"><X size={19}/></button></div>
    <div className="p-6">{children}</div>
  </dialog>;
}
export function IntroSteps() {
  return <div className="mt-7 grid gap-5 sm:grid-cols-3">{[
    { icon: Image, title: 'Kumpulkan referensi', text: 'Satu kolase atau beberapa gambar, semuanya dalam satu tempat.' },
    { icon: Sparkles, title: 'Pahami arahnya', text: 'Warna, gaya, pencahayaan, dan nuansa dijelaskan dengan jelas.' },
    { icon: CheckCircle2, title: 'Bawa ke proses kreatif', text: 'Review hasilnya, lalu gunakan Markdown di AI pilihan Anda.' },
  ].map(({icon: Icon, title, text}, i) => <div key={title} className="flex gap-3 rounded-xl border border-stone-200/60 bg-white/60 p-5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-600"><Icon size={17}/></div><div><p className="mb-eyebrow mb-1">0{i+1}</p><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1.5 text-xs leading-5 text-stone-500">{text}</p></div></div>)}</div>;
}
