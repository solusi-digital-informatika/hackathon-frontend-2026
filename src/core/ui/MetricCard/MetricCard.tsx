import { Icon, type IconName } from '../Icon/Icon';
import type { ReactNode } from 'react';

export function MetricCard({ label, value, detail, icon }: { label: string; value: ReactNode; detail: string; icon: IconName }) {
  return <article className="workspace-metric"><div className="workspace-metric-label">{label}<Icon name={icon} /></div><strong>{value}</strong><p>{detail}</p></article>;
}
