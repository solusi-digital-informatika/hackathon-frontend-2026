import { describe, expect, it } from 'vitest';
import { briefVersion, nextBriefVersion } from './brief-versions';

describe('frontend brief numbering', () => {
  it('increments for new brief IDs but keeps a number when revisiting or editing', () => {
    expect(nextBriefVersion('version-sequence')).toBe(1);
    expect(briefVersion('version-sequence', 'brief_a')).toBe(1);
    expect(briefVersion('version-sequence', 'brief_a')).toBe(1);
    expect(nextBriefVersion('version-sequence')).toBe(2);
    expect(briefVersion('version-sequence', 'brief_b')).toBe(2);
    expect(briefVersion('version-sequence', 'brief_a')).toBe(1);
    expect(nextBriefVersion('another-project')).toBe(1);
  });
  it('loads numbering persisted from a previous visit', () => {
    localStorage.setItem('ai-office:brief-versions:saved-project', JSON.stringify({ old: 3 }));
    expect(briefVersion('saved-project', 'old')).toBe(3);
    expect(briefVersion('saved-project', 'new')).toBe(4);
  });
});
