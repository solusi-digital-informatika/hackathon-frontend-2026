import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './core/layout/AppShell';
import { MoodboardsListPage } from './modules/moodboards/pages/MoodboardsListPage';
import { MoodboardWorkspacePage } from './modules/moodboards/pages/MoodboardWorkspacePage';
import { ProjectsListPage } from './modules/projects/pages/ProjectsListPage';
import { CreateProjectPage } from './modules/projects/pages/CreateProjectPage';
import { ProjectOverviewPage } from './modules/projects/pages/ProjectOverviewPage';
import { BriefWorkspacePage } from './modules/brief/pages/BriefWorkspacePage';

export const App: React.FC = () => {
  return (
    <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:id/brief" element={<BriefWorkspacePage />} />
          <Route path="/projects/:id/moodboards" element={<MoodboardsListPage />} />
          <Route path="/projects/:id/moodboards/:boardId" element={<MoodboardWorkspacePage />} />
          <Route path="/projects/:id/overview" element={<ProjectOverviewPage />} />
          <Route path="/projects/:id" element={<ProjectOverviewPage />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
    </AppShell>
  );
};
export default App;
