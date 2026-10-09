import { useCallback, useEffect, useState } from 'react';
import { RevisionGraph } from '../../../core/ui/RevisionGraph/RevisionGraph';
import { Button } from '../../../core/ui/Button/Button';
import { TextField } from '../../../core/ui/Form/TextField';
import { TextArea } from '../../../core/ui/Form/TextArea';
import { shotsApi } from '../api/shots-api';
import type { Shot, ShotRevision, ShotRevisionHistory } from '../types/shot.types';
import { useShotImages, shotImageUrl, imageError } from '../hooks/useShotImages';

export function ShotRevisionPanel({ shot, onApplied }: { shot: Shot; onApplied: () => void }) {
  const { images, reload: reloadImages } = useShotImages(shot.project_id);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [history, setHistory] = useState<ShotRevisionHistory | null>(null);
  const [selected, setSelected] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageNotice, setImageNotice] = useState<string | null>(null);
  const choose = (row: ShotRevision) => { setSelected(row.id); setTitle(row.title); setDescription(row.description); setDetails(row.details); setNote(''); setReviewNote(''); setImageNotice(null); };
  const load = useCallback(async () => {
    setError(null);
    try { const value = await shotsApi.getRevisions(shot.project_id, shot.id); setHistory(value); choose(value.items.find(r => r.id === value.active_revision_id)!); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load history'); }
  }, [shot.project_id, shot.id]);
  useEffect(() => { void load(); }, [load]);
  const perform = async (action: () => Promise<ShotRevisionHistory>, applied = false) => {
    setBusy(true); setError(null);
    try { const value = await action(); setHistory(value); choose(value.items[value.items.length - 1]); if (applied) onApplied(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Revision failed'); }
    finally { setBusy(false); }
  };
  const row = history?.items.find(r => r.id === selected);
  const parent = history?.items.find(r => r.id === row?.parent_id);
  const image = images.find(item => item.revision_id === row?.id);
  const imagePending = image?.status === 'queued' || image?.status === 'running';
  const generateImage = async () => {
    if (!row || generatingImage || imagePending) return;
    setGeneratingImage(true); setImageNotice(null);
    try { await shotsApi.generateImage(shot.project_id, shot.id, row.id); await reloadImages(); setImageNotice('Permintaan diterima. Gambar akan muncul setelah proses selesai.'); }
    catch (err) { setImageNotice(err instanceof Error ? err.message : 'Gagal memulai generate gambar.'); }
    finally { setGeneratingImage(false); }
  };
  return <section className="shot-revision-panel"><h3>Shot revisions</h3><p>Branch from any version. Review the proposal, then approve and merge. Original versions stay intact.</p>
    {error && <p className="revision-error" role="alert">{error} <Button type="button" size="sm" onClick={load} disabled={busy}>Refresh history</Button></p>}
    {!history && !error && <p role="status">Loading version history...</p>}
    {history && row && <>
      <RevisionGraph nodes={history.items.map(r => ({ id: r.id, parentId: r.parent_id, label: `v${r.version_number}${r.parent_id ? ` from v${history.items.find(p => p.id === r.parent_id)?.version_number}` : ''}`, status: r.status }))} activeId={history.active_revision_id} selectedId={selected} onSelect={id => { if (!busy) choose(history.items.find(r => r.id === id)!); }} />
      <div className="revision-inspect"><strong>Version {row.version_number} · {row.status.replaceAll('_', ' ')}</strong><p>{row.change_note}</p><p>{new Date(row.created_at).toLocaleString()}{row.reviewed_at ? ` · Reviewed ${new Date(row.reviewed_at).toLocaleString()}` : ''}</p>{row.review_note && <p>Review note: {row.review_note}</p>}
        {parent && <div className="revision-diff"><div><small>Base v{parent.version_number}</small><strong>{parent.title}</strong><p>{parent.description}</p></div><div><small>Proposed v{row.version_number}</small><strong>{row.title}</strong><p>{row.description}</p></div></div>}
        {Object.entries(row.details).map(([key, value]) => <p key={key}><b>{key.replaceAll('_', ' ')}:</b> {value}</p>)}
      </div>
      {row.status === 'approved' && row.id === history.active_revision_id && row.can_generate_image && <div className="revision-image-actions">
        <Button type="button" disabled={busy || generatingImage || imagePending || image?.status === 'succeeded'} onClick={generateImage}>{imagePending || generatingImage ? 'Generating Image...' : image?.status === 'succeeded' ? 'Image Generated' : 'Generate Image'}</Button>
        <p className="form-helper-text">Versi {row.version_number} sudah approved. Gambar dibuat dari detail shot dan moodboard approved yang tersedia.</p>
        {imageNotice && <p role="status">{imageNotice}</p>}
      </div>}
      {imagePending && <p role="status">{image?.status === 'queued' ? 'Gambar masuk antrean.' : 'AI sedang membuat gambar...'}</p>}
      {(image?.status === 'failed' || image?.status === 'stale') && <p role="alert">{imageError(image.error_code)}</p>}
      {image?.status === 'succeeded' && <figure className="shot-generated-image"><img src={shotImageUrl(image)} alt={`Storyboard ${row.title}, version ${row.version_number}`} /><figcaption>Gambar untuk shot v{row.version_number}</figcaption></figure>}
      <p>{row.can_generate_image ? 'Approved current version — eligible for image generation.' : 'Image generation blocked: this version must be approved and current.'}</p>
      {(row.status === 'pending_review' || row.status === 'baseline') && <div className="revision-review"><TextArea label="Approval note" value={reviewNote} onChange={e => setReviewNote(e.target.value)} disabled={busy} rows={2} />
        {row.status !== 'baseline' && row.parent_id !== history.active_revision_id && <p>This branch is based on an older version. Create a new branch from the current version to merge your changes.</p>}
        <div className="revision-actions"><Button type="button" disabled={busy || (row.status !== 'baseline' && row.parent_id !== history.active_revision_id)} onClick={() => perform(() => shotsApi.reviewRevision(shot.project_id, shot.id, row.id, { decision: 'approve', expected_active_id: history.active_revision_id, note: reviewNote }), true)}>Approve & Merge</Button><Button type="button" variant="secondary" disabled={busy} onClick={() => perform(() => shotsApi.reviewRevision(shot.project_id, shot.id, row.id, { decision: 'reject', expected_active_id: history.active_revision_id, note: reviewNote }))}>Reject revision</Button></div>
      </div>}
      <div className="revision-create"><h4>New branch from v{row.version_number}</h4><TextField label="Revised title" value={title} onChange={e => setTitle(e.target.value)} disabled={busy} maxLength={100} /><TextArea label="Revised description" value={description} onChange={e => setDescription(e.target.value)} disabled={busy} maxLength={1000} rows={3} />
        <details><summary>Edit shot details</summary>{Object.entries(details).map(([key, value]) => <TextArea key={key} id={`revision-${key}`} label={key.replaceAll('_', ' ')} value={value} onChange={e => setDetails({ ...details, [key]: e.target.value })} disabled={busy} rows={2} />)}</details>
        <TextArea label="Revision request / change note" value={note} onChange={e => setNote(e.target.value)} disabled={busy} maxLength={2000} rows={3} required />
        <div className="revision-actions"><Button type="button" disabled={busy || !note.trim() || !title.trim()} onClick={() => perform(() => shotsApi.createRevision(shot.project_id, shot.id, { parent_id: row.id, mode: 'manual', change_note: note, title, description, details }))}>{busy ? 'Working...' : 'Create revision branch'}</Button><Button type="button" variant="secondary" disabled={busy || !note.trim()} onClick={() => perform(() => shotsApi.createRevision(shot.project_id, shot.id, { parent_id: row.id, mode: 'ai', change_note: note }))}>Regenerate details with AI</Button></div><p>New branches require approval. AI generates text details only.</p>
      </div>
    </>}
  </section>;
}
