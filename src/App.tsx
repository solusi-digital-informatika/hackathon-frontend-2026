import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { ProjectsListPage } from './modules/projects/pages/ProjectsListPage';
import { CreateProjectPage } from './modules/projects/pages/CreateProjectPage';
import { ProjectOverviewPage } from './modules/projects/pages/ProjectOverviewPage';
import { BriefWorkspacePage } from './modules/brief/pages/BriefWorkspacePage';

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/projects" className="app-title" style={{ textDecoration: 'none' }}>
          AI Office
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:id/brief" element={<BriefWorkspacePage />} />
          <Route path="/projects/:id/overview" element={<ProjectOverviewPage />} />
          <Route path="/projects/:id" element={<ProjectOverviewPage />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </main>
    </div>
  );
};
export default App;
