import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../../projects/api/projects-api';
import type { ProjectsListResponse } from '../../projects/types/project.types';
import { Icon } from '../../../core/ui/Icon/Icon';
import { MetricCard } from '../../../core/ui/MetricCard/MetricCard';
import { LoadingIndicator } from '../../../core/ui/Loading/LoadingIndicator';
import { ErrorBanner } from '../../../core/ui/Banner/ErrorBanner';
import './dashboard.css';

export function DashboardPage() {
  const [data, setData] = useState<ProjectsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await projectsApi.getProjects({ limit: 6, offset: 0 })); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load your workspace.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return (
    <div className="dashboard-page">
      <div className="dashboard-heading"><div><p className="workspace-eyebrow">YOUR STUDIO, AT A GLANCE</p><h1>Dashboard<span>.</span></h1><p>A little clarity before the next creative move.</p></div><Link className="workspace-primary-action" to="/projects/new"><Icon name="plus" />Create Project</Link></div>
      {loading && <LoadingIndicator message="Loading dashboard..." />}
      {!loading && error && <ErrorBanner title="Unable to load dashboard" message={error} onRetry={load} />}
      {!loading && !error && data && <>
        <div className="dashboard-metrics">
          <MetricCard label="Total projects" value={data.total} detail="Across your workspace" icon="folder" />
          <MetricCard label="Latest projects" value={data.items.length} detail="Shown in the list below" icon="layers" />
          <article className="dashboard-create-card"><span className="workspace-eyebrow">A NEW START</span><h2>Make room for your next idea.</h2><Link to="/projects/new">Start a project <Icon name="arrow" /></Link></article>
        </div>
        <div className="dashboard-columns">
          <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><h2>Recent projects</h2><p>Your latest additions to the workspace.</p></div><Link to="/projects">View all <Icon name="arrow" /></Link></div>
            {data.items.length === 0 ? <div className="dashboard-empty"><Icon name="folder" width="32" height="32" /><h3>Your workspace starts here.</h3><p>Create your first project, then bring in its brief.</p><Link to="/projects/new">Create a project <Icon name="arrow" /></Link></div> : <ul className="dashboard-project-list">{data.items.map(project => <li key={project.id}><Link to={`/projects/${project.id}`} className="dashboard-project-link"><span className="dashboard-project-letter">{project.name.slice(0, 1).toUpperCase()}</span><div className="dashboard-project-copy"><strong>{project.name}</strong><p>{project.description || 'No description yet'}</p></div><span className={`dashboard-status dashboard-status-${project.status}`}>{project.status}</span><Icon name="arrow" /></Link></li>)}</ul>}
            <div className="dashboard-panel-footer">A shared starting point for every production.</div>
          </section>
          <aside className="dashboard-guide"><p className="workspace-eyebrow">THE PRODUCTION FLOW</p><h2>Good work starts with a clear brief.</h2><p>Build the context first. Keep it close as your project takes shape.</p><ol><li><span>01</span><div><h3>Set up your project</h3><p>Give your production a name and a home.</p></div></li><li><span>02</span><div><h3>Bring in the brief</h3><p>Capture the direction, references, and requirements.</p></div></li><li><span>03</span><div><h3>Plan your shots</h3><p>Turn the brief into an ordered storyboard.</p></div></li></ol><Link to="/projects">Open your projects <Icon name="arrow" /></Link><div className="dashboard-guide-note">Keep the useful work.<br />Leave room for a new direction.</div></aside>
        </div>
      </>}
    </div>
  );
}
