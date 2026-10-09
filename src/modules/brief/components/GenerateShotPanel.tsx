import { useState } from 'react';
import { briefApi } from '../api/brief-api';
import type { ProjectBrief } from '../types/brief.types';
import { TextField } from '../../../core/ui/Form/TextField';
import { Button } from '../../../core/ui/Button/Button';

export function GenerateShotPanel({ projectId, brief, onGenerated }: { projectId: string; brief: ProjectBrief; onGenerated: (brief: ProjectBrief) => void }) {
  const [count, setCount] = useState('7');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generated = !!brief.generated_shot_ids?.length;
  const generate = async () => {
    const value = Number(count);
    if (!Number.isInteger(value) || value < 1 || value > 30) { setError('Choose between 1 and 30 shots.'); return; }
    setBusy(true); setError(null);
    try { onGenerated(await briefApi.generateShots(projectId, brief.id, value)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not generate shot details.'); }
    finally { setBusy(false); }
  };
  return <div className="generate-shot-panel">
    <div><h3>Plan your storyboard</h3><p>{generated ? 'Shot details are ready in the Shot Board. No images have been generated.' : 'Generate the shot details first: action, framing, camera, lighting, and image prompt. Uses your saved brief; save edits first. No images are generated in this step.'}</p></div>
    {!generated && <div className="generate-shot-controls"><TextField id={`generate-count-${brief.id}`} label="Jumlah Shot" type="number" min={1} max={30} value={count} onChange={e => setCount(e.target.value)} disabled={busy} /><Button type="button" onClick={generate} disabled={busy || !brief.creative_sections}>{busy ? 'Generating shot details...' : 'Generate Shot'}</Button></div>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
