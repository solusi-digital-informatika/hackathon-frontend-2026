import { useEffect, useRef, useState } from 'react';
import { Check, ImagePlus, Loader2, Pencil, Plus, UploadCloud, X } from 'lucide-react';
import type { Moodboard, Source } from '../types/moodboard.types';
import { roles } from '../types/moodboard.types';
import { errorMessage, moodboardsApi, sourceUrl } from '../api/moodboards-api';
import { Dialog, Notice } from './WorkspaceUi';

export function SourceEditor({ projectId, board, onRefresh, disabled, onPending }: {
  projectId: string; board: Moodboard; onRefresh: () => Promise<void>; disabled: boolean; onPending: (value: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]); const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState(''); const [messages, setMessages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false); const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState<Source | null>(null); const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState(''); const [notes, setNotes] = useState(''); const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [zoom, setZoom] = useState<Source | null>(null); const sources = board.sources || [];
  useEffect(() => () => onPending(false), [onPending]);
  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file)); setPreviews(urls);
    onPending(files.length > 0 || uploading || saving);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files, uploading, saving, onPending]);
  function stage(newFiles: File[]) {
    if (disabled || uploading) return;
    setError(''); setMessages([]);
    const invalid = newFiles.filter(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10*1024*1024);
    const valid = newFiles.filter(file => !invalid.includes(file));
    const combined = [...files, ...valid].filter((file, i, all) => all.findIndex(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified) === i);
    const included = sources.filter(s => s.included);
    if (combined.length + included.length > 10 || combined.reduce((sum,f) => sum+f.size, 0) + included.reduce((sum,s) => sum+s.size_bytes, 0) > 50*1024*1024) {
      setError('Maksimal 10 gambar dan 50 MB per moodboard. Pilih lebih sedikit gambar.'); return;
    }
    setFiles(combined);
    if (invalid.length) setError(`${invalid.map(f => f.name).join(', ')} tidak didukung atau lebih besar dari 10 MB. Gambar valid tetap dipilih.`);
  }
  async function upload() {
    setUploading(true); setError(''); setMessages([]);
    try {
      const result = await moodboardsApi.upload(projectId, board.id, board.revision, files);
      setMessages(result.items.filter(item => item.status !== 'created').map(item =>
        `${item.filename}: ${item.status === 'duplicate' ? 'sudah ada. Gunakan referensi yang tersimpan.' : item.message}`));
      const rejectedNames = new Set(result.items.filter(item => item.status === 'rejected').map(item => item.filename));
      setFiles(current => current.filter(file => rejectedNames.has(file.name)));
      await onRefresh();
    } catch(e) {setError(errorMessage(e));} finally {setUploading(false);}
  }
  async function toggle(source: Source) {
    setSaving(true); setError('');
    try {await moodboardsApi.updateSource(projectId, board.id, source.id, {revision: board.revision, included: !source.included}); await onRefresh();}
    catch(e) {setError(errorMessage(e));} finally {setSaving(false);}
  }
  function edit(source: Source) {setEditing(source); setLabel(source.label); setNotes(source.notes); setSelectedRoles(source.roles); setError('');}
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!editing) return;
    setSaving(true); setError('');
    try {await moodboardsApi.updateSource(projectId, board.id, editing.id, {revision: board.revision, label, notes, roles: selectedRoles});
      await onRefresh(); setEditing(null);
    } catch(e) {setError(errorMessage(e));} finally {setSaving(false);}
  }
  return <div className="space-y-5">
    <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">Referensi visual</h2><p className="mt-1 text-xs text-stone-500">Satu kolase atau beberapa gambar yang saling melengkapi.</p></div><span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs text-stone-500">{sources.filter(s => s.included).length}/10 gambar</span></div>
    {!editing && error && <Notice>{error}</Notice>}{messages.length > 0 && <Notice kind="info">{messages.map(message => <p key={message}>{message}</p>)}</Notice>}
    {!disabled && <div onDragOver={event => {event.preventDefault(); setDragging(true);}} onDragLeave={() => setDragging(false)} onDrop={event => {event.preventDefault(); setDragging(false); stage(Array.from(event.dataTransfer.files));}}
      className={`flex flex-col items-center rounded-xl border-2 border-dashed px-6 py-9 text-center transition ${dragging ? 'border-forest-500 bg-forest-50' : 'border-stone-200 bg-white hover:border-forest-200'}`}>
      <div className="mb-4 rounded-xl bg-forest-50 p-3 text-forest-600"><UploadCloud size={24} strokeWidth={1.5}/></div>
      <p className="text-sm font-medium">Tarik gambar ke sini, atau <button disabled={uploading} className="font-semibold text-forest-700 underline underline-offset-4" onClick={() => input.current?.click()}>pilih gambar</button></p>
      <p className="mt-2 text-xs text-stone-400">JPG, PNG, WebP · Maks. 10 MB per gambar</p>
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label="Upload gambar moodboard" data-testid="moodboard-upload-input" className="sr-only" onChange={event => {stage(Array.from(event.target.files || [])); event.target.value = '';}} disabled={uploading}/>
    </div>}
    {files.length > 0 && <div className="mb-panel overflow-hidden"><div className="flex items-center justify-between border-b border-stone-100 px-4 py-3"><span className="text-sm font-medium">{files.length} gambar siap diupload</span><button className="mb-button" onClick={upload} disabled={uploading || disabled}>{uploading ? <Loader2 size={15} className="animate-spin"/> : <Plus size={15}/>}Upload referensi</button></div><div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">{files.map((file,i) => <div key={`${file.name}-${i}`} className="relative rounded-lg border border-stone-200 p-2"><img src={previews[i]} alt={file.name} className="mb-2 aspect-video w-full rounded object-cover"/><p className="truncate text-xs text-stone-600">{file.name}</p><button className="absolute right-3 top-3 rounded-full bg-white p-1 shadow-sm" aria-label={`Hapus pilihan ${file.name}`} disabled={uploading} onClick={() => setFiles(files.filter((_,index) => i !== index))}><X size={13}/></button></div>)}</div></div>}
    <div className="grid gap-4 sm:grid-cols-2">{sources.map((source, i) => <article key={source.id} className={`mb-panel overflow-hidden ${source.included ? '' : 'opacity-60'}`}>
      <button onClick={() => setZoom(source)} className="relative block aspect-[4/3] w-full overflow-hidden bg-stone-100 text-left"><img src={sourceUrl(projectId, board.id, source.id)} alt={source.label || source.original_filename} className="h-full w-full object-contain" loading="lazy"/><span className="absolute left-3 top-3 rounded-md border border-white/70 bg-white/95 px-2 py-1 font-mono text-[10px] text-stone-600">REF {String(i+1).padStart(2,'0')}</span>{!source.included && <span className="absolute bottom-3 left-3 rounded bg-white px-2 py-1 text-[10px]">Tidak disertakan</span>}</button>
      <div className="p-4"><div className="flex justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{source.label || source.original_filename}</h3><p className="mt-1 text-[11px] text-stone-400">{source.width} × {source.height} · {(source.size_bytes/1024/1024).toFixed(1)} MB</p></div>{!disabled && <button className="mb-button-ghost p-1.5" aria-label={`Edit referensi ${source.original_filename}`} onClick={() => edit(source)} disabled={saving}><Pencil size={15}/></button>}</div>
        <div className="mt-3 flex flex-wrap gap-1.5">{source.roles.map(role => <span key={role} className="rounded bg-forest-50 px-2 py-1 text-[10px] text-forest-700">{roles[role]}</span>)}</div>{source.notes && <p className="mt-3 line-clamp-3 text-xs leading-5 text-stone-500">{source.notes}</p>}
        {source.warnings.map(warning => <p key={warning} className="mt-2 text-[11px] text-amber-700">{warning}</p>)}
        {!disabled && <button className="mt-3 text-[11px] font-medium text-stone-500 underline-offset-4 hover:underline" disabled={saving} onClick={() => toggle(source)}>{source.included ? 'Keluarkan dari analisis berikutnya' : 'Sertakan kembali'}</button>}
      </div>
    </article>)}</div>
    {sources.length === 0 && files.length === 0 && disabled && <div className="mb-panel py-12 text-center text-sm text-stone-500"><ImagePlus className="mx-auto mb-3"/>Belum ada gambar referensi.</div>}
    {editing && <Dialog title="Detail referensi" onClose={() => setEditing(null)} busy={saving}><form onSubmit={save} className="space-y-5">
      {error && <Notice>{error}</Notice>}<div><label htmlFor="source-label" className="mb-label">Label referensi</label><input id="source-label" className="mb-input" maxLength={200} value={label} onChange={e => setLabel(e.target.value)}/></div>
      <fieldset><legend className="mb-label">Bagian yang menjadi acuan</legend><div className="grid grid-cols-2 gap-2">{Object.entries(roles).map(([key,text]) => <label key={key} className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs ${selectedRoles.includes(key) ? 'border-forest-200 bg-forest-50 text-forest-700' : 'border-stone-200 text-stone-600'}`}><input type="checkbox" className="accent-forest-600" checked={selectedRoles.includes(key)} onChange={() => setSelectedRoles(current => current.includes(key) ? current.filter(role => role !== key) : [...current,key])}/>{text}</label>)}</div></fieldset>
      <div><label htmlFor="source-notes" className="mb-label">Catatan untuk referensi ini</label><textarea id="source-notes" rows={3} maxLength={2000} className="mb-input" placeholder="Contoh: ikuti warna dan cahaya, bukan kostumnya." value={notes} onChange={e => setNotes(e.target.value)}/></div><button className="mb-button w-full" disabled={saving || !selectedRoles.length}>{saving ? <Loader2 size={16} className="animate-spin"/> : <Check size={16}/>}Simpan referensi</button>
    </form></Dialog>}
    {zoom && <Dialog title={zoom.label || zoom.original_filename} wide onClose={() => setZoom(null)}><img src={sourceUrl(projectId,board.id,zoom.id,false)} alt={zoom.label || zoom.original_filename} className="max-h-[65vh] w-full rounded-lg object-contain"/></Dialog>}
  </div>;
}
