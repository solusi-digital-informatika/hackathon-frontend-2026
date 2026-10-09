import { afterEach, describe, expect, it, vi } from 'vitest';
import { moodboardsApi, errorMessage } from '../moodboards-api';
import { ApiClientError } from '../../../../core/network/api-client';
afterEach(() => vi.unstubAllGlobals());
describe('Moodboard API contract', () => {
  it('uploads multipart files without overriding the browser boundary', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ok:true,status:201,json:async () => ({revision:2,items:[]})}); vi.stubGlobal('fetch',fetchMock);
    const file = new File(['image'],'reference.png',{type:'image/png'});
    await moodboardsApi.upload('project','board',1,[file]);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/projects/project/moodboards/board/sources');
    expect(options.body).toBeInstanceOf(FormData); expect(options.body.get('revision')).toBe('1'); expect(options.body.get('files').name).toBe('reference.png');
    expect(options.headers).not.toHaveProperty('Content-Type');
  });
  it('sends revision and idempotency key when creating an analysis', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ok:true,status:202,json:async () => ({id:'version'})}); vi.stubGlobal('fetch',fetchMock);
    await moodboardsApi.analyze('project','board',3,'request-1');
    expect(fetchMock).toHaveBeenCalledWith('/api/projects/project/moodboards/board/analyses',expect.objectContaining({method:'POST',body:'{"revision":3}',headers:expect.objectContaining({'Idempotency-Key':'request-1','Content-Type':'application/json'})}));
  });
  it('explains AI configuration errors without showing provider secrets', () => {
    const error = new ApiClientError({status:503,code:'ai_not_configured',message:'AI_API_KEY missing'});
    expect(errorMessage(error)).toContain('Layanan analisis belum aktif'); expect(errorMessage(error)).not.toContain('AI_API_KEY');
  });
});
