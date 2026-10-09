// Frontend-only numbering; the API currently exposes the active brief only.
// IDs make revisiting and editing the same brief keep its assigned number.
const prefix = 'ai-office:brief-versions:';
const memory = new Map<string, Record<string, number>>();
function read(projectId: string): Record<string, number> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(prefix + projectId) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const valid = Object.fromEntries(Object.entries(parsed).filter(([, n]) => Number.isSafeInteger(n) && Number(n) > 0));
      return { ...valid, ...memory.get(projectId) };
    }
  } catch { /* Keep this session usable when browser storage is unavailable. */ }
  return memory.get(projectId) || {};
}
export function nextBriefVersion(projectId: string): number {
  return Math.max(0, ...Object.values(read(projectId))) + 1;
}
export function briefVersion(projectId: string, briefId: string): number {
  const versions = read(projectId);
  if (versions[briefId]) return versions[briefId];
  const version = Math.max(0, ...Object.values(versions)) + 1;
  const next = { ...versions, [briefId]: version };
  memory.set(projectId, next);
  try { localStorage.setItem(prefix + projectId, JSON.stringify(next)); } catch { /* Session fallback. */ }
  return version;
}
