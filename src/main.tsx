import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './core/theme/base.css';
import './core/ui/ui.css';
import './modules/projects/styles/projects.css';
import './modules/shots/styles/shots.css';
import './modules/brief/styles/brief.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}
