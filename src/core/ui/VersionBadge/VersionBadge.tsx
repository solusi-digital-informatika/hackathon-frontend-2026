export function VersionBadge({ version }: { version: number }) {
  return <span className="version-badge" title="Version numbering saved in this browser">Version {version}</span>;
}
