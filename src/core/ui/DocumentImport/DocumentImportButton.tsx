import { useRef, useState } from 'react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';

export function DocumentImportButton({ onImport, disabled = false, onBusyChange }: {
  onImport: (document: { name: string; content: string }) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const handleFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    if (!/\.(md|docx)$/i.test(file.name)) {
      setError('Choose a Markdown (.md) or Word (.docx) file. Save older .doc files as .docx first.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { setError('Choose a document smaller than 10 MB.'); return; }
    setBusy(true);
    onBusyChange?.(true);
    try {
      let content: string;
      if (/\.md$/i.test(file.name)) {
        content = await file.text();
      } else {
        const mammoth = await import('mammoth/mammoth.browser');
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        content = result.value;
      }
      if (!content.trim()) throw new Error('No readable text was found in this document.');
      onImport({ name: file.name, content });
      setFilename(file.name);
    } catch (err) {
      setError(err instanceof Error && err.message === 'No readable text was found in this document.' ? err.message : 'This document could not be read. Try another file or paste its text.');
    } finally { setBusy(false); onBusyChange?.(false); }
  };
  return <div className="document-import">
    <input ref={input} type="file" accept=".md,.docx" aria-label="Upload Markdown or Word document" className="sr-only" disabled={disabled || busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void handleFile(file); }} />
    <Button type="button" variant="secondary" size="sm" disabled={disabled || busy} onClick={() => input.current?.click()}><Icon name="document" width="14" height="14" />{busy ? 'Reading document...' : 'Upload MD / Word'}</Button>
    {filename && <span className="document-import-filename" role="status">Imported: {filename}</span>}
    {error && <span className="document-import-error" role="alert">{error}</span>}
  </div>;
}
