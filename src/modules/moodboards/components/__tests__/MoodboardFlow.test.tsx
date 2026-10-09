import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FindingReview } from '../FindingReview';
import { MarkdownExport } from '../MarkdownExport';
import { moodboardsApi } from '../../api/moodboards-api';
import type { Version, ExportArtifact } from '../../types/moodboard.types';
vi.mock('../../api/moodboards-api', async importOriginal => ({...await importOriginal<typeof import('../../api/moodboards-api')>(), moodboardsApi: {review:vi.fn(), approve:vi.fn(), export:vi.fn(), confirmExport:vi.fn()}}));
const version: Version = {id:'v1',version_number:1,revision:4,based_on_version_id:null,review_status:'in_review',job_status:'succeeded',stage:'ready_for_review',snapshot:{title:'Botanical',context:'',intended_use:'image',sources:[]},per_source:{},original_result:null,human_summary:null,conflict_resolutions:{},instructions:[],error_code:null,created_at:'2026-10-09T12:00:00Z',approved_at:null,findings:[{id:'F1',path:['ringkasan_visual'],category:'ringkasan_visual',original_value:'Natural daylight',reviewed_value:'Natural daylight',referensi:[],dasar:'interpretasi',keyakinan:'tinggi',review_state:'pending',strength:'prefer',note:''}]};
const artifact: ExportArtifact = {id:'e1',language:'en',status:'pending_confirmation',filename:'botanical-v1-en.md',content:'# Visual direction',content_hash:'hash',created_at:version.created_at};
afterEach(cleanup); beforeEach(() => vi.clearAllMocks());
describe('Moodboard review and export', () => {
  it('requires saving reviewed findings before approval and sends the version revision', async () => {
    const onVersion = vi.fn(); vi.mocked(moodboardsApi.review).mockResolvedValue({...version,revision:5});
    render(<FindingReview projectId="p1" boardId="b1" version={version} onVersion={onVersion} onDirty={vi.fn()}/>);
    expect(screen.getByRole('button',{name:'Setujui versi'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button',{name:'Terima F1'}));
    expect(screen.getByRole('button',{name:'Setujui versi'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button',{name:'Simpan review'}));
    await waitFor(() => expect(onVersion).toHaveBeenCalled());
    expect(moodboardsApi.review).toHaveBeenCalledWith('p1','b1','v1',expect.objectContaining({revision:4,decisions:[expect.objectContaining({finding_id:'F1',decision:'accepted',strength:'prefer'})]}));
  });
  it('blocks approval of partial analysis even when all findings are reviewed', () => {
    render(<FindingReview projectId="p" boardId="b" version={{...version,job_status:'partial',findings:version.findings.map(f => ({...f,review_state:'accepted'}))}} onVersion={vi.fn()} onDirty={vi.fn()}/>);
    expect(screen.getByRole('button',{name:'Setujui versi'})).toBeDisabled();
  });
  it('preserves edited decisions when saving fails', async () => {
    vi.mocked(moodboardsApi.review).mockRejectedValue(new Error('Koneksi terputus'));
    render(<FindingReview projectId="p" boardId="b" version={version} onVersion={vi.fn()} onDirty={vi.fn()}/>);
    fireEvent.click(screen.getByRole('button',{name:'Koreksi F1'}));
    fireEvent.change(screen.getByLabelText('Koreksi isi temuan'),{target:{value:'Soft daylight'}});
    fireEvent.click(screen.getByRole('button',{name:'Simpan review'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('Koneksi terputus');
    expect(screen.getByLabelText('Koreksi isi temuan')).toHaveValue('Soft daylight');
  });
  it('only offers Markdown generation for approved versions', () => {
    render(<MarkdownExport projectId="p" boardId="b" version={version} onReview={vi.fn()}/>);
    expect(screen.queryByRole('button',{name:'Buat Markdown'})).not.toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Review temuan'})).toBeEnabled();
  });
  it('requires confirmation before downloading an English translation', async () => {
    vi.mocked(moodboardsApi.export).mockResolvedValue(artifact);
    vi.mocked(moodboardsApi.confirmExport).mockResolvedValue({...artifact,status:'ready'});
    render(<MarkdownExport projectId="p1" boardId="b1" version={{...version,review_status:'approved'}} onReview={vi.fn()}/>);
    fireEvent.change(screen.getByLabelText('Bahasa Markdown'),{target:{value:'en'}});
    fireEvent.click(screen.getByRole('button',{name:'Buat Markdown'}));
    const confirm = await screen.findByRole('button',{name:'Konfirmasi terjemahan'});
    expect(screen.queryByRole('link',{name:'Unduh .md'})).not.toBeInTheDocument();
    fireEvent.click(confirm);
    expect(await screen.findByRole('link',{name:'Unduh .md'})).toHaveAttribute('href','/api/projects/p1/moodboards/b1/exports/e1');
  });
});
