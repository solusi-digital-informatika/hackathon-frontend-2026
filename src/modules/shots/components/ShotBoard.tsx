import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { Shot, ShotStatus, CreateShotPayload, UpdateShotPayload } from '../types/shot.types';
import { shotsApi } from '../api/shots-api';
import { ShotCard } from './ShotCard';
import { ShotModal } from './ShotModal';
import { DeleteShotModal } from './DeleteShotModal';
import { ShotStatusBadge } from './ShotStatusBadge';
import { Button } from '../../../core/ui/Button/Button';
import { LoadingIndicator } from '../../../core/ui/Loading/LoadingIndicator';
import { ErrorBanner } from '../../../core/ui/Banner/ErrorBanner';
import { ApiClientError } from '../../../core/network/api-client';
import { useStoredStringList } from '../../../core/hooks/useStoredStringList';
import { BranchMap } from '../../../core/ui/BranchMap/BranchMap';
import { ShotRevisionPanel } from './ShotRevisionPanel';
import { useShotImages, imageError } from '../hooks/useShotImages';
import { ShotImageUserManual } from './ShotImageUserManual';

export interface ShotBoardProps {
  projectId: string;
}

export const ShotBoard: React.FC<ShotBoardProps> = ({ projectId }) => {
  const { images, reload: reloadImages } = useShotImages(projectId);
  const [batchBusy, setBatchBusy] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [hiddenIds, setHidden] = useStoredStringList(`shot-board:hidden:${projectId}`);
  const hiddenShots = shots.filter(shot => hiddenIds.includes(shot.id));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [batchImageNotice, setBatchImageNotice] = useState<string | null>(null);
  const approvedImageShots = shots.filter(shot => shot.status === 'approved' && (!shot.revision_summary || shot.revision_summary.status === 'approved'));
  const generateAllImages = async () => {
    if (batchBusy) return;
    setBatchBusy(true); setBatchImageNotice(null);
    try {
      const result = await shotsApi.generateApprovedImages(projectId);
      setBatchImageNotice(`${result.queued} gambar masuk antrean. Shot yang sudah memiliki gambar atau sedang diproses dilewati. Termasuk shot approved yang tersembunyi.`);
      await reloadImages();
    } catch (err) { setBatchImageNotice(err instanceof Error ? err.message : 'Gagal memulai generate gambar.'); }
    finally { setBatchBusy(false); }
  };

  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'mindmap'>('cards');
  const [mapShotId, setMapShotId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | ShotStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeShot, setActiveShot] = useState<Shot | null>(null);

  const [deletingShot, setDeletingShot] = useState<Shot | null>(null);

  const fetchShots = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    setBatchImageNotice(null);
    try {
      const res = await shotsApi.getShots(projectId);
      const sorted = [...(res.items || [])].sort(
        (a, b) => a.sequence_order - b.sequence_order
      );
      setShots(sorted);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to load shots. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchShots();
  }, [fetchShots]);

  const handleOpenAddModal = () => {
    setModalMode('create');
    setActiveShot(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (shot: Shot) => {
    setModalMode('edit');
    setActiveShot(shot);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (payload: CreateShotPayload | UpdateShotPayload) => {
    if (modalMode === 'create') {
      await shotsApi.createShot(projectId, payload as CreateShotPayload);
    } else if (activeShot) {
      await shotsApi.updateShot(projectId, activeShot.id, payload as UpdateShotPayload);
    }
    await fetchShots();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingShot) return;
    await shotsApi.deleteShot(projectId, deletingShot.id);
    await fetchShots();
  };

  const handleMoveUp = async (shot: Shot) => {
    const currentIndex = shots.findIndex((s) => s.id === shot.id);
    if (currentIndex <= 0) return;
    const prevShot = shots[currentIndex - 1];

    try {
      await shotsApi.updateShot(projectId, shot.id, {
        sequence_order: prevShot.sequence_order,
      });
      await shotsApi.updateShot(projectId, prevShot.id, {
        sequence_order: shot.sequence_order,
      });
      await fetchShots();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      }
    }
  };

  const handleMoveDown = async (shot: Shot) => {
    const currentIndex = shots.findIndex((s) => s.id === shot.id);
    if (currentIndex === -1 || currentIndex >= shots.length - 1) return;
    const nextShot = shots[currentIndex + 1];

    try {
      await shotsApi.updateShot(projectId, shot.id, {
        sequence_order: nextShot.sequence_order,
      });
      await shotsApi.updateShot(projectId, nextShot.id, {
        sequence_order: shot.sequence_order,
      });
      await fetchShots();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      }
    }
  };

  const filteredShots = useMemo(() => {
    return shots.filter((shot) => {
      const matchesStatus =
        statusFilter === 'all' || shot.status === statusFilter;
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !normalizedQuery ||
        shot.title.toLowerCase().includes(normalizedQuery) ||
        shot.id.toLowerCase().includes(normalizedQuery) ||
        (shot.description && shot.description.toLowerCase().includes(normalizedQuery));
      return !hiddenIds.includes(shot.id) && matchesStatus && matchesSearch;
    });
  }, [shots, statusFilter, searchQuery, hiddenIds]);

  const nextSequenceOrder = useMemo(() => {
    if (shots.length === 0) return 1;
    const maxSeq = Math.max(...shots.map((s) => s.sequence_order || 0));
    return maxSeq + 1;
  }, [shots]);

  return (
    <div className="shot-board" data-testid="shot-board-container">
      {/* Board Toolbar */}
      <div className="shot-board-toolbar" data-testid="shot-board-toolbar">
        <div className="shot-board-toolbar-left">
          <div className="shot-view-switchers" role="group" aria-label="View mode">
            <button type="button" className={`btn-view-toggle ${viewMode === 'mindmap' ? 'active' : ''}`} aria-pressed={viewMode === 'mindmap'} onClick={() => setViewMode('mindmap')}>Mindmap</button>
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              data-testid="btn-view-cards"
              aria-pressed={viewMode === 'cards'}
              title="Storyboard Cards View"
            >
              Storyboard Cards
            </button>
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              data-testid="btn-view-list"
              aria-pressed={viewMode === 'list'}
              title="Table List View"
            >
              List View
            </button>
          </div>

          <div className="shot-filter-controls">
            <label htmlFor="shot-status-filter" className="sr-only">
              Filter by Status
            </label>
            <select
              id="shot-status-filter"
              className="shot-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ShotStatus)}
              aria-label="Filter shots by status"
            >
              <option value="all">All Statuses ({shots.length})</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
            </select>

            <label htmlFor="shot-search-input" className="sr-only">
              Search Shots
            </label>
            <input
              id="shot-search-input"
              type="search"
              className="shot-search-input"
              placeholder="Search by title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search shots by title or ID"
            />
          </div>
        </div>

        <div className="shot-board-toolbar-right">
          <Button
            variant="secondary"
            size="sm"
            disabled={loading || !!error || batchBusy || approvedImageShots.length === 0}
            onClick={generateAllImages}
            title="Semua shot approved dalam proyek, termasuk shot tersembunyi"
          >
            {batchBusy ? 'Queueing Images...' : `Generate All Approved Images (${approvedImageShots.length})`}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            data-testid="btn-add-shot"
          >
            + Add Shot
          </Button>
        </div>
      </div>

      {/* Loading State */}
      <ShotImageUserManual key={projectId} projectId={projectId} issues={images.filter(image => (image.status === 'failed' || image.status === 'stale') && shots.some(shot => shot.id === image.shot_id && shot.status === 'approved' && image.version_number === (shot.revision_summary?.version || 1)))} />
      {images.some(image => image.status === 'queued' || image.status === 'running') && <p role="status">Generate gambar: {images.filter(image => image.status === 'succeeded').length} selesai · {images.filter(image => image.status === 'queued' || image.status === 'running').length} dalam proses.</p>}
      {images.some(image => image.status === 'failed' || image.status === 'stale') && <details className="shot-hidden-list"><summary>Gambar gagal diproses ({images.filter(image => image.status === 'failed' || image.status === 'stale').length})</summary><ul>{images.filter(image => image.status === 'failed' || image.status === 'stale').map(image => <li key={image.revision_id}>{shots.find(shot => shot.id === image.shot_id)?.title || image.shot_id} · v{image.version_number}: {imageError(image.error_code)}</li>)}</ul></details>}
      {batchImageNotice && <div className="shot-batch-image-notice" role="status">
        <p>{batchImageNotice}</p>
        <Button variant="secondary" size="sm" onClick={() => setBatchImageNotice(null)}>Dismiss</Button>
      </div>}
      {!loading && hiddenShots.length > 0 && <details className="shot-hidden-list">
        <summary>Hidden shots ({hiddenShots.length})</summary>
        <p>Hidden only in this browser. Shot details and revision history are preserved.</p>
        <ul>{hiddenShots.map(shot => <li key={shot.id}>
          <span>#{shot.sequence_order} · {shot.title}</span>
          <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(shot)}>Details</Button>
          <Button variant="secondary" size="sm" aria-label={`Show shot ${shot.title}`} onClick={() => setHidden(shot.id, false)}>Show shot</Button>
        </li>)}</ul>
      </details>}
      {loading && (
        <LoadingIndicator message="Loading shots..." />
      )}

      {/* Error State */}
      {!loading && error && (
        <ErrorBanner
          title="Error Loading Shots"
          message={error}
          onRetry={fetchShots}
        />
      )}

      {/* Empty State */}
      {!loading && !error && shots.length === 0 && (
        <div className="shot-board-empty-state" data-testid="shot-board-empty">
          <div className="shot-board-empty-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <h3 className="empty-state-title">No shots yet</h3>
          <p className="empty-state-description">
            No shots yet. Add a shot to start planning.
          </p>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            data-testid="btn-add-shot"
          >
            + Add Shot
          </Button>
        </div>
      )}

      {/* Content State: Cards Grid */}
      {!loading && !error && shots.length > 0 && viewMode === 'mindmap' && <>
        <p>Pilih shot untuk melihat cabang revisinya. Badge menunjukkan versi aktif dan revisi yang menunggu approval.</p>
        {filteredShots.length === 0 ? <p>No visible shots match your filters. Check Hidden shots or clear your search.</p> : <BranchMap title="Shot Management" selectedId={mapShotId ?? undefined} onSelect={id => setMapShotId(id)} nodes={filteredShots.map(shot => ({
          id: shot.id, label: `SHOT ${String(shot.sequence_order).padStart(2, '0')} · ${shot.id}`, title: shot.title, summary: shot.description || 'No description',
          badges: <><ShotStatusBadge status={shot.status} shotId={shot.id} size="sm" /><span>Active v{shot.revision_summary?.version || 1}</span>{!!shot.revision_summary?.pending && <span className="branch-map-pending">{shot.revision_summary.pending} pending revisions</span>}</>,
        }))} />}
        {filteredShots.filter(shot => shot.id === mapShotId).map(shot => <section key={shot.id} className="shot-map-detail">
          <div className="shot-map-detail-header"><h3>Shot #{shot.sequence_order}: {shot.title}</h3><Button variant="secondary" size="sm" onClick={() => { setHidden(shot.id, true); setMapShotId(null); }}>Hide shot</Button><Button variant="secondary" size="sm" onClick={() => setMapShotId(null)}>Close details</Button></div>
          <ShotRevisionPanel shot={shot} onApplied={() => { void fetchShots(); }} />
        </section>)}
      </>}
      {!loading && !error && shots.length > 0 && viewMode === 'cards' && (
        <>
          {filteredShots.length === 0 ? (
            <div className="shot-board-no-results">
              <p>No shots match your current filter or search criteria.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="shot-cards-grid" data-testid="shot-cards-grid">
              {filteredShots.map((shot, index) => (
                <ShotCard
                  key={shot.id}
                  shot={shot}
                  image={images.find(image => image.shot_id === shot.id && image.version_number === (shot.revision_summary?.version || 1))}
                  isFirst={index === 0}
                  isLast={index === filteredShots.length - 1}
                  onEdit={handleOpenEditModal}
                  onDelete={setDeletingShot}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Content State: List Table */}
      {!loading && !error && shots.length > 0 && viewMode === 'list' && (
        <div className="shot-list-table-container">
          {filteredShots.length === 0 ? (
            <div className="shot-board-no-results">
              <p>No shots match your current filter or search criteria.</p>
            </div>
          ) : (
            <table className="shot-list-table" aria-label="Shots table">
              <thead>
                <tr>
                  <th scope="col">Seq</th>
                  <th scope="col">Shot ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">Description</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShots.map((shot, index) => (
                  <tr key={shot.id} data-testid={`shot-row-${shot.id}`}>
                    <td className="shot-table-seq">
                      #{String(shot.sequence_order).padStart(2, '0')}
                    </td>
                    <td className="shot-table-id">
                      <code>{shot.id}</code>
                    </td>
                    <td className="shot-table-title">{shot.title}</td>
                    <td className="shot-table-desc">
                      {shot.description || '—'}
                    </td>
                    <td className="shot-table-status">
                      <ShotStatusBadge status={shot.status} shotId={shot.id} size="sm" />
                    </td>
                    <td className="shot-table-actions">
                      <div className="shot-table-actions-group">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMoveUp(shot)}
                          disabled={index === 0}
                          aria-label={`Move shot ${shot.title} up`}
                        >
                          &uarr;
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMoveDown(shot)}
                          disabled={index === filteredShots.length - 1}
                          aria-label={`Move shot ${shot.title} down`}
                        >
                          &darr;
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEditModal(shot)}
                          aria-label={`Edit shot ${shot.title}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="btn-danger-text"
                          onClick={() => setDeletingShot(shot)}
                          aria-label={`Delete shot ${shot.title}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add / Edit Shot Modal */}
      <ShotModal
        isOpen={isModalOpen}
        mode={modalMode}
        shot={activeShot}
        nextSequenceOrder={nextSequenceOrder}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        onRevisionApplied={() => { void fetchShots(); }}
        isHidden={activeShot ? hiddenIds.includes(activeShot.id) : false}
        onToggleHidden={activeShot ? () => { setHidden(activeShot.id, !hiddenIds.includes(activeShot.id)); setIsModalOpen(false); } : undefined}
      />

      {/* Delete Confirmation Modal */}
      <DeleteShotModal
        isOpen={deletingShot !== null}
        shot={deletingShot}
        onClose={() => setDeletingShot(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
