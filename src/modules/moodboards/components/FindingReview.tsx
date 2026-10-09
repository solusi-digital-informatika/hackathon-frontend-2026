import { useEffect, useState } from 'react';
import { Check, CheckCheck, CircleHelp, Loader2, Pencil, Plus, Save, ShieldCheck, X } from 'lucide-react';
import type { Decision, FindingValue, Instruction, Strength, Version } from '../types/moodboard.types';
import { categories, findingText, strengths } from '../types/moodboard.types';
import { errorMessage, moodboardsApi } from '../api/moodboards-api';
import { Notice, Pill } from './WorkspaceUi';

function ValueEditor({value, onChange, id}: {value: FindingValue; onChange: (value: FindingValue) => void; id: string}) {
  const labels: Record<string,string> = {deskripsi:'Deskripsi',ciri_utama:'Ciri utama (satu per baris)',nama:'Nama',penyebab_visual:'Alasan visual',dasar:'Dasar temuan',referensi:'Referensi (satu ID per baris)',keyakinan:'Keyakinan',warna:'Nama warna',hex_perkiraan:'HEX perkiraan',peran_visual:'Peran warna',arahan:'Arahan',alasan:'Alasan'};
  if (typeof value === 'string') return <textarea aria-label="Koreksi isi temuan" className="mb-input" rows={3} value={value} onChange={e => onChange(e.target.value)}/>;
  return <div className="grid gap-4 sm:grid-cols-2">{Object.entries(value).map(([key,item]) => <div key={key} className={['deskripsi','ciri_utama','arahan','alasan','penyebab_visual'].includes(key) ? 'sm:col-span-2' : ''}><label htmlFor={`${id}-${key}`} className="mb-label text-xs">{labels[key] || key}</label>
    {key === 'dasar' || key === 'keyakinan' ? <select id={`${id}-${key}`} className="mb-input" value={String(item)} onChange={e => onChange({...value,[key]:e.target.value})}>{(key === 'dasar' ? ['observasi','interpretasi','instruksi_pengguna'] : ['tinggi','sedang','rendah']).map(option => <option key={option}>{option}</option>)}</select> : Array.isArray(item) ? <textarea id={`${id}-${key}`} rows={3} className="mb-input" value={item.join('\n')} onChange={e => onChange({...value,[key]:e.target.value.split('\n')})}/> : <textarea id={`${id}-${key}`} rows={2} className="mb-input" value={item === null ? '' : String(item)} onChange={e => onChange({...value,[key]: key === 'hex_perkiraan' && !e.target.value ? null : e.target.value})}/>}
  </div>)}</div>;
}
export function FindingReview({projectId, boardId, version, onVersion, onDirty, readOnly = false}: {
  projectId: string; boardId: string; version: Version; onVersion: (version: Version) => void; onDirty: (value: boolean) => void; readOnly?: boolean;
}) {
  const [drafts, setDrafts] = useState<Partial<Record<string,Decision>>>({});
  const [resolutions, setResolutions] = useState({...version.conflict_resolutions});
  const [instructions, setInstructions] = useState<Instruction[]>(version.instructions.map(i => ({...i})));
  const [instructionText, setInstructionText] = useState(''); const [instructionStrength, setInstructionStrength] = useState<Strength>('must');
  const [editing, setEditing] = useState<string | null>(null); const [filter, setFilter] = useState('all');
  const [dirty, setDirty] = useState(false); const [saving, setSaving] = useState(false); const [approving, setApproving] = useState(false); const [error, setError] = useState('');
  const approved = version.review_status === 'approved'; const editable = !approved && !readOnly && ['succeeded','partial'].includes(version.job_status);
  useEffect(() => {onDirty(dirty || instructionText.trim().length > 0);}, [dirty,instructionText,onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  const stateOf = (id: string, fallback: string) => drafts[id]?.decision || fallback;
  const pending = version.findings.filter(f => stateOf(f.id, f.review_state) === 'pending').length;
  const conflicts = version.human_summary?.perbedaan_atau_konflik || [];
  const unresolved = conflicts.filter((_,i) => !resolutions[String(i)]?.trim()).length;
  function setDecision(findingId: string, decision: Decision['decision']) {
    const finding = version.findings.find(f => f.id === findingId)!;
    setDrafts(current => ({...current,[findingId]: {finding_id:findingId,decision,
      strength: decision === 'rejected' ? 'reference_only' : current[findingId]?.strength || finding.strength,
      note: current[findingId]?.note || finding.note,
      ...(decision === 'edited' ? {value: current[findingId]?.value || structuredClone(finding.reviewed_value)} : {}),
    }})); setDirty(true);
  }
  function editValue(id: string, value: FindingValue) {
    const finding = version.findings.find(f => f.id === id)!;
    setDrafts(current => ({...current,[id]: {finding_id:id,decision:'edited',value,
      strength: current[id]?.strength || finding.strength, note:current[id]?.note || finding.note}})); setDirty(true);
  }
  function changeStrength(id: string, strength: Strength) {
    const finding = version.findings.find(f => f.id === id)!;
    setDrafts(current => ({...current,[id]: {...(current[id] || {finding_id:id,decision:finding.review_state === 'edited' ? 'edited' as const : 'accepted' as const,
      ...(finding.review_state === 'edited' ? {value: finding.reviewed_value} : {}),note:finding.note}),strength}})); setDirty(true);
  }
  async function save() {
    setSaving(true); setError('');
    try {const result = await moodboardsApi.review(projectId,boardId,version.id,{revision:version.revision,
      decisions:Object.values(drafts).filter((d): d is Decision => !!d).map(d => ({...d, ...(d.decision === 'edited' && typeof d.value === 'object' && d.value ? {value:Object.fromEntries(Object.entries(d.value).map(([key,val]) => [key,Array.isArray(val) ? val.map(v => String(v).trim()).filter(Boolean) : val]))} : {})})),
      conflict_resolutions:Object.fromEntries(Object.entries(resolutions).filter(([,value]) => value.trim())),instructions});
      setDirty(false); setDrafts({}); onDirty(false); onVersion(result);
    } catch(e) {setError(errorMessage(e));} finally {setSaving(false);}
  }
  async function approve() {
    setApproving(true); setError('');
    try {const result = await moodboardsApi.approve(projectId,boardId,version.id,version.revision); onVersion(result);}
    catch(e) {setError(errorMessage(e));} finally {setApproving(false);}
  }
  return <div className="space-y-5">
    {error && <Notice>{error}</Notice>}
    {approved ? <Notice kind="success">Versi ini telah disetujui. Untuk mengubahnya, buat analisis versi baru dari tab referensi.</Notice> : <section className="mb-panel flex flex-wrap items-center justify-between gap-4 p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-forest-50 p-3 text-forest-600"><ShieldCheck size={21}/></div><div><h2 className="text-sm font-semibold">Keputusan kreatif tetap di tangan Anda</h2><p className="mt-1 text-xs text-stone-500">{version.findings.length-pending} dari {version.findings.length} temuan direview{unresolved ? ` · ${unresolved} konflik belum diputuskan` : ''}</p></div></div><button className="mb-button-secondary" disabled={!editable || saving} onClick={() => {
      setDrafts(current => {const next = {...current}; version.findings.filter(f => stateOf(f.id,f.review_state) === 'pending').forEach(f => {next[f.id] = {finding_id:f.id,decision:'accepted',strength:f.strength,note:f.note};}); return next;}); setDirty(true);
    }}><CheckCheck size={16}/>Terima temuan yang belum direview</button></section>}
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold">Temuan visual <span className="ml-1 text-sm font-normal text-stone-400">{version.findings.length}</span></h2><select aria-label="Filter review temuan" className="mb-input w-auto" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Semua temuan</option><option value="pending">Belum direview</option>{Object.entries(categories).filter(([key]) => version.findings.some(f => f.category === key)).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></div>
    <div className="space-y-3">{version.findings.filter(f => filter === 'all' || filter === 'pending' ? filter === 'all' || stateOf(f.id,f.review_state) === 'pending' : f.category === filter).map(finding => {
      const state = stateOf(finding.id,finding.review_state); const decision = drafts[finding.id]; const value = decision?.value || finding.reviewed_value;
      return <article key={finding.id} className="mb-panel p-5" data-testid={`finding-${finding.id}`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="mb-eyebrow">{finding.id} · {categories[finding.category] || finding.category}</span><Pill status={state}/></div>
        <p className={`text-sm leading-6 ${state === 'rejected' ? 'text-stone-400 line-through' : 'text-stone-700'}`}>{findingText(value)}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-stone-400"><span>{finding.dasar.replaceAll('_',' ')}</span><span>Keyakinan {finding.keyakinan}</span><span className="font-mono">{finding.referensi.join(' · ')}</span></div>
        {editing === finding.id && editable && <div className="mt-5 rounded-lg border border-stone-100 bg-stone-50 p-4"><ValueEditor id={finding.id} value={value} onChange={value => editValue(finding.id,value)}/><button className="mb-button-ghost mt-3" onClick={() => setEditing(null)}>Selesai mengedit</button></div>}
        {editable && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4"><div className="flex gap-1"><button aria-label={`Terima ${finding.id}`} className={`mb-button-ghost py-1.5 text-xs ${state === 'accepted' ? 'bg-forest-50 text-forest-700' : ''}`} disabled={saving} onClick={() => setDecision(finding.id,'accepted')}><Check size={14}/>Terima</button><button aria-label={`Koreksi ${finding.id}`} className="mb-button-ghost py-1.5 text-xs" disabled={saving} onClick={() => {setEditing(finding.id); setDecision(finding.id,'edited');}}><Pencil size={13}/>Koreksi</button><button aria-label={`Tolak ${finding.id}`} className="mb-button-ghost py-1.5 text-xs" disabled={saving} onClick={() => {setDecision(finding.id,'rejected'); setEditing(null);}}><X size={14}/>Tolak</button></div><select aria-label={`Kekuatan arahan ${finding.id}`} className="mb-input w-auto py-1.5 text-xs" value={decision?.strength || finding.strength} disabled={saving || state === 'rejected'} onChange={e => changeStrength(finding.id,e.target.value as Strength)}>{Object.entries(strengths).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></div>}
      </article>;
    })}</div>
    {conflicts.length > 0 && <section className="mb-panel p-6"><h2 className="mb-5 flex items-center gap-2 text-sm font-semibold"><CircleHelp size={17} className="text-amber-600"/>Keputusan untuk referensi yang berbeda</h2><div className="space-y-5">{conflicts.map((conflict,i) => <div key={i}><label htmlFor={`conflict-${i}`} className="mb-label">{conflict.deskripsi}</label><textarea id={`conflict-${i}`} className="mb-input" rows={2} placeholder="Tentukan acuan yang dipakai, atau nyatakan belum diketahui dan bukan constraint." disabled={!editable || saving} value={resolutions[String(i)] || ''} onChange={e => {setResolutions({...resolutions,[String(i)]:e.target.value}); setDirty(true);}}/></div>)}</div></section>}
    <section className="mb-panel p-6"><h2 className="text-sm font-semibold">Arahan tambahan dari Anda</h2><p className="mb-5 mt-1 text-xs text-stone-500">Tuliskan keputusan yang tidak dapat disimpulkan dari gambar.</p><div className="space-y-2">{instructions.map((instruction,i) => <div key={i} className="flex items-start justify-between gap-3 rounded-lg bg-stone-50 p-3 text-xs"><div><span className="mr-2 font-semibold text-forest-700">{strengths[instruction.strength]}</span>{instruction.text}</div>{editable && <button aria-label={`Hapus arahan ${i+1}`} onClick={() => {setInstructions(instructions.filter((_,index) => i !== index)); setDirty(true);}}><X size={14}/></button>}</div>)}</div>{editable && <div className="mt-4 flex flex-wrap gap-2"><input className="mb-input min-w-48 flex-1" aria-label="Arahan tambahan" placeholder="Contoh: pertahankan identitas karakter." maxLength={2000} value={instructionText} onChange={e => setInstructionText(e.target.value)}/><select className="mb-input w-auto" aria-label="Kekuatan arahan tambahan" value={instructionStrength} onChange={e => setInstructionStrength(e.target.value as Strength)}>{Object.entries(strengths).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select><button className="mb-button-secondary" disabled={!instructionText.trim() || saving} onClick={() => {setInstructions([...instructions,{text:instructionText.trim(),strength:instructionStrength}]); setInstructionText(''); setDirty(true);}}><Plus size={16}/>Tambah</button></div>}</section>
    {!approved && <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm"><div><p className="text-xs font-medium">{dirty ? 'Ada perubahan yang belum disimpan' : 'Semua perubahan tersimpan'}</p><p className="mt-1 text-[11px] text-stone-400">{version.job_status === 'partial' ? 'Lengkapi analisis sebelum menyetujui versi.' : 'Simpan review sebelum menyetujui arahan visual.'}</p></div><div className="flex gap-2"><button className="mb-button-secondary" disabled={!editable || !dirty || saving || !!instructionText.trim()} onClick={save}>{saving ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}Simpan review</button><button className="mb-button" disabled={!editable || dirty || pending > 0 || unresolved > 0 || version.job_status !== 'succeeded' || saving || approving || !!instructionText.trim()} onClick={approve}>{approving ? <Loader2 size={15} className="animate-spin"/> : <ShieldCheck size={15}/>}Setujui versi</button></div></div>}
  </div>;
}
