import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceLayout } from './core/layout/WorkspaceLayout';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { ProjectsListPage } from './modules/projects/pages/ProjectsListPage';
import { CreateProjectPage } from './modules/projects/pages/CreateProjectPage';
import { ProjectOverviewPage } from './modules/projects/pages/ProjectOverviewPage';
import { BriefWorkspacePage } from './modules/brief/pages/BriefWorkspacePage';

export const App: React.FC = () => {
  return (
    <WorkspaceLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:id/brief" element={<BriefWorkspacePage />} />
          <Route path="/projects/:id/overview" element={<ProjectOverviewPage />} />
          <Route path="/projects/:id" element={<ProjectOverviewPage />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
    </WorkspaceLayout>
  );
};
export default App;
