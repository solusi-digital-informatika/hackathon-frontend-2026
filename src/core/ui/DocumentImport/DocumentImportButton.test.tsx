import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentImportButton } from './DocumentImportButton';

vi.mock('mammoth/mammoth.browser', () => ({ extractRawText: vi.fn().mockResolvedValue({ value: 'A Word creative brief', messages: [] }) }));
describe('Document import', () => {
  it('imports Markdown without stripping its content', async () => {
    const onImport = vi.fn();
    render(<DocumentImportButton onImport={onImport} />);
    const file = new File(['# Brief\nWarm lighting'], 'brief.md');
    Object.defineProperty(file, 'text', { value: async () => '# Brief\nWarm lighting' });
    await userEvent.upload(screen.getByLabelText('Upload Markdown or Word document'), file);
    await waitFor(() => expect(onImport).toHaveBeenCalledWith({ name: 'brief.md', content: '# Brief\nWarm lighting' }));
  });
  it('imports extracted Word text', async () => {
    const onImport = vi.fn();
    render(<DocumentImportButton onImport={onImport} />);
    const file = new File(['docx'], 'brief.docx');
    Object.defineProperty(file, 'arrayBuffer', { value: async () => new ArrayBuffer(1) });
    await userEvent.upload(screen.getByLabelText('Upload Markdown or Word document'), file);
    await waitFor(() => expect(onImport).toHaveBeenCalledWith({ name: 'brief.docx', content: 'A Word creative brief' }));
  });
  it('rejects unsupported files and empty documents without replacing content', async () => {
    const onImport = vi.fn();
    render(<DocumentImportButton onImport={onImport} />);
    const user = userEvent.setup({ applyAccept: false });
    await user.upload(screen.getByLabelText('Upload Markdown or Word document'), new File(['binary'], 'old.doc'));
    expect(screen.getByRole('alert')).toHaveTextContent('Save older .doc files as .docx first');
    const empty = new File([''], 'empty.md');
    Object.defineProperty(empty, 'text', { value: async () => '' });
    await user.upload(screen.getByLabelText('Upload Markdown or Word document'), empty);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('No readable text'));
    expect(onImport).not.toHaveBeenCalled();
  });
});
