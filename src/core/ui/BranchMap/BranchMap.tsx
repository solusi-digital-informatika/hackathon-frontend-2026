import type { ReactNode } from 'react';
import './branch-map.css';

export interface BranchMapNode { id: string; title: string; label: string; summary: string; badges?: ReactNode }

export function BranchMap({ title, nodes, selectedId, onSelect }: { title: string; nodes: BranchMapNode[]; selectedId?: string; onSelect: (id: string) => void }) {
  return <div className="branch-map" role="group" aria-label={title}>
    <div className="branch-map-root"><small>STORYBOARD</small><strong>{title}</strong><span>{nodes.length} shots</span></div>
    <div className="branch-map-nodes">{nodes.map(node => <div className="branch-map-row" key={node.id}>
      <button type="button" className="branch-map-node" aria-pressed={node.id === selectedId} onClick={() => onSelect(node.id)}>
        <small>{node.label}</small><strong>{node.title}</strong><span className="branch-map-summary">{node.summary}</span>
        <span className="branch-map-badges">{node.badges}</span>
      </button>
    </div>)}</div>
  </div>;
}
