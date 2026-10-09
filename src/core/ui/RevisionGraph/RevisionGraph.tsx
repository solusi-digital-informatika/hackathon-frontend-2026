export interface RevisionGraphNode { id: string; parentId: string | null; label: string; status: string }
export function RevisionGraph({ nodes, activeId, selectedId, onSelect }: { nodes: RevisionGraphNode[]; activeId: string; selectedId: string; onSelect: (id: string) => void }) {
  const activeChain = new Set<string>();
  let cursor = nodes.find(n => n.id === activeId);
  while (cursor && !activeChain.has(cursor.id)) { activeChain.add(cursor.id); cursor = nodes.find(n => n.id === cursor?.parentId); }
  const positions = new Map(nodes.map((n, i) => [n.id, { x: activeChain.has(n.id) ? 28 : 95, y: i * 64 + 28 }]));
  return <div className="revision-graph"><svg role="group" aria-label="Revision branches. Select a version to inspect it." viewBox={`0 0 460 ${Math.max(80, nodes.length * 64)}`}>
    {nodes.map(n => { const p = positions.get(n.id)!; const parent = n.parentId ? positions.get(n.parentId) : null; return parent && <path key={n.id} d={`M${parent.x},${parent.y} C${p.x},${parent.y} ${p.x},${p.y - 24} ${p.x},${p.y}`} fill="none" stroke={activeChain.has(n.id) ? '#6b8760' : '#c7cdbc'} strokeWidth="2" />; })}
    {nodes.map(n => { const p = positions.get(n.id)!; return <g key={n.id} role="button" tabIndex={0} aria-label={`${n.label}, ${n.status}${n.id === activeId ? ', current' : ''}`} aria-pressed={n.id === selectedId} onClick={() => onSelect(n.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(n.id); } }}>
      <rect x={p.x - 13} y={p.y - 21} width={430 - p.x} height="44" rx="6" fill={n.id === selectedId ? '#edf3e6' : 'transparent'} />
      <circle cx={p.x} cy={p.y} r="6" fill={n.id === activeId ? '#4e7143' : '#fff'} stroke="#78916a" strokeWidth="2" />
      <text x={p.x + 20} y={p.y + 4} fontSize="12" fill="#46563c">{n.label} · {n.status.replaceAll('_', ' ')}{n.id === activeId ? ' · current' : ''}</text>
    </g>; })}
  </svg></div>;
}
