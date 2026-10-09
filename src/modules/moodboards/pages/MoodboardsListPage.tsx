import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Image, Plus, Search, Archive, FolderOpen, Loader2 } from 'lucide-react';
import { projectsApi } from '../../projects/api/projects-api';
import type { Project } from '../../projects/types/project.types';
import { moodboardsApi, errorMessage } from '../api/moodboards-api';
import type { Moodboard } from '../types/moodboard.types';
import { dateLabel } from '../types/moodboard.types';
import { Busy, Dialog, IntroSteps, Notice, Pill } from '../components/WorkspaceUi';

function BoardCover({ project, board }: {project: string; board: Moodboard}) {
  const [image, setImage] = useState<string | null>(null);
  useEffect(() => { let alive = true;
    moodboardsApi.get(project, board.id).then(detail => {
      const source = detail.sources?.find(source => source.included);
      if (alive && source) setImage(source.id);
    }).catch(() => {});
    return () => {alive = false;};
  }, [project, board.id]);
  return <div className="flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-stone-100 bg-[#eef1ec]">
    {image ? <CoverImage project={project} board={board.id} source={image}/> : <div className="relative flex h-20 w-24 items-center justify-center rounded-lg border border-stone-300/70 bg-white/80 text-stone-400"><div className="absolute -left-3 -top-3 h-full w-full rounded-lg border border-stone-300/70"/><Image size={25} strokeWidth={1.2}/></div>}
  </div>;
}
import { sourceUrl } from '../api/moodboards-api';
function CoverImage({project, board, source}: {project:string; board:string; source:string}) {
  const [failed, setFailed] = useState(false);
  return failed ? <Image className="text-stone-400" size={28}/> : <img src={sourceUrl(project, board, source)} alt="Preview moodboard" onError={() => setFailed(true)} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"/>;
}

export function MoodboardsListPage() {
  const { id = '' } = useParams(); const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [boards, setBoards] = useState<Moodboard[]>([]); const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [offset, setOffset] = useState(0); const [archived, setArchived] = useState(false);
  const [search, setSearch] = useState(''); const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState(''); const [context, setContext] = useState(''); const [use, setUse] = useState('general');
  const [creating, setCreating] = useState(false); const [createError, setCreateError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {const [p, result] = await Promise.all([projectsApi.getProject(id), moodboardsApi.list(id, archived, offset)]);
      setProject(p); setBoards(result.items); setTotal(result.total);
    } catch (e) {setError(errorMessage(e));} finally {setLoading(false);}
  }, [id, archived, offset]);
  useEffect(() => {void load();}, [load]);
  async function create(event: React.FormEvent) {
    event.preventDefault(); setCreating(true); setCreateError('');
    try { const board = await moodboardsApi.create(id, {title: title.trim(), context: context.trim(), intended_use: use});
      navigate(`/projects/${id}/moodboards/${board.id}`);
    } catch (e) {setCreateError(errorMessage(e));} finally {setCreating(false);}
  }
  const filtered = boards.filter(board => board.title.toLowerCase().includes(search.toLowerCase()));
  return <div className="mx-auto max-w-6xl px-4 py-7 sm:px-8">
    <Link to={`/projects/${id}`} className="mb-7 inline-flex items-center gap-2 text-xs text-stone-500 hover:text-forest-700"><ArrowLeft size={14}/>{project?.name || 'Kembali ke project'}</Link>
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-eyebrow mb-2">VISUAL WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Moodboards<span className="text-forest-500">.</span></h1><p className="mt-3 text-sm leading-6 text-stone-500">Dari referensi visual, jadi arahan yang dipahami bersama.</p></div>
      <button onClick={() => {setShowCreate(true); setCreateError('');}} disabled={project?.status === 'archived'} className="mb-button"><Plus size={17}/>Moodboard baru</button>
    </div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div className="flex rounded-lg border border-stone-200 bg-white p-1">
      {[false, true].map(value => <button key={String(value)} onClick={() => {setArchived(value); setOffset(0); setSearch('');}} className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium ${archived === value ? 'bg-forest-50 text-forest-700' : 'text-stone-500 hover:bg-stone-50'}`}>{value ? <Archive size={14}/> : <FolderOpen size={14}/>} {value ? 'Arsip' : 'Semua moodboard'}</button>)}</div>
      <label className="relative w-full sm:w-64"><Search size={16} className="absolute left-3 top-3 text-stone-400"/><input aria-label="Cari moodboard pada halaman ini" className="mb-input pl-9" placeholder="Cari di halaman ini…" value={search} onChange={e => setSearch(e.target.value)}/></label>
    </div>
    {loading ? <Busy/> : error ? <Notice onRetry={load}>{error}</Notice> : boards.length === 0 ? <>
      <section className="mb-panel flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center"><div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-forest-200 bg-forest-50 text-forest-600"><Image size={29} strokeWidth={1.3}/></div><h2 className="text-xl font-semibold">{archived ? 'Belum ada moodboard di arsip' : 'Ide visual Anda dimulai di sini'}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-stone-500">{archived ? 'Moodboard yang diarsipkan akan tetap menyimpan referensi dan seluruh riwayatnya.' : 'Kumpulkan gambar yang menginspirasi. Kami bantu merangkumnya menjadi panduan kreatif yang jelas.'}</p>
        {!archived && <button className="mb-button mt-6" disabled={project?.status === 'archived'} onClick={() => setShowCreate(true)}><Plus size={16}/>Buat moodboard pertama</button>}
      </section>{!archived && <IntroSteps/>}
    </> : <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(board => <Link key={board.id} to={`/projects/${id}/moodboards/${board.id}`} className="group mb-panel overflow-hidden text-ink transition hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-md hover:no-underline">
        <BoardCover project={id} board={board}/><div className="p-5"><div className="mb-3 flex items-center justify-between"><Pill status={board.latest_approved_version_id ? 'approved' : board.latest_job_status || 'draft'}/><ArrowUpRight size={16} className="text-stone-400 transition group-hover:text-forest-600"/></div><h2 className="truncate text-base font-semibold">{board.title}</h2><p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-stone-500">{board.context || 'Tambahkan referensi untuk mulai memahami arah visual.'}</p><div className="mt-4 flex justify-between border-t border-stone-100 pt-4 text-[11px] text-stone-400"><span>{board.source_count || 0} gambar referensi</span><span>{dateLabel(board.updated_at)}</span></div></div>
      </Link>)}</div>{filtered.length === 0 && <p className="py-16 text-center text-sm text-stone-500">Tidak ada hasil di halaman ini.</p>}
      {total > 20 && <div className="mt-6 flex items-center justify-between text-xs text-stone-500"><span>{offset+1}–{Math.min(offset+20,total)} dari {total}</span><div className="flex gap-2"><button className="mb-button-secondary" disabled={offset === 0} onClick={() => setOffset(offset-20)}>Sebelumnya</button><button className="mb-button-secondary" disabled={offset+20 >= total} onClick={() => setOffset(offset+20)}>Berikutnya</button></div></div>}
    </>}
    {showCreate && <Dialog title="Moodboard baru" onClose={() => setShowCreate(false)} busy={creating}><form onSubmit={create} className="space-y-5">
      <p className="text-sm leading-6 text-stone-500">Beri ruang untuk ide visual Anda. Referensi gambar bisa ditambahkan setelah ini.</p>
      {createError && <Notice>{createError}</Notice>}
      <div><label htmlFor="board-title" className="mb-label">Nama moodboard</label><input id="board-title" autoFocus required maxLength={100} className="mb-input" placeholder="Contoh: Botanical campaign" value={title} onChange={e => setTitle(e.target.value)} disabled={creating}/></div>
      <div><label htmlFor="board-purpose" className="mb-label">Digunakan untuk</label><select id="board-purpose" className="mb-input" value={use} onChange={e => setUse(e.target.value)} disabled={creating}><option value="general">Arahan visual umum</option><option value="image">Gambar</option><option value="video">Video</option><option value="animation">Animasi</option></select></div>
      <div><label htmlFor="board-context" className="mb-label">Konteks kreatif <span className="font-normal text-stone-400">(opsional)</span></label><textarea id="board-context" rows={3} maxLength={2000} className="mb-input resize-y" placeholder="Apa yang ingin Anda capai? Elemen mana yang penting?" value={context} onChange={e => setContext(e.target.value)} disabled={creating}/></div>
      <div className="flex justify-end gap-2 border-t border-stone-100 pt-5"><button type="button" className="mb-button-secondary" disabled={creating} onClick={() => setShowCreate(false)}>Batal</button><button className="mb-button" disabled={creating || !title.trim()}>{creating ? <Loader2 size={16} className="animate-spin"/> : <Plus size={16}/>}Buat moodboard</button></div>
    </form></Dialog>}
  </div>;
}
