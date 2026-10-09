import { describe, expect, it } from 'vitest';
import { cleanStructuredText, plainText } from './plainText';

describe('structured AI plain text', () => {
  it('removes formatting while preserving facts and lines', () => {
    expect(plainText('## Overview\n- **Brand:** *FitLife*\n- Color: `#00E5FF`\n- Budget: Rp 65.000.000\n[App](https://fit.life)'))
      .toBe('Overview\n• Brand: FitLife\n• Color: #00E5FF\n• Budget: Rp 65.000.000\nApp (https://fit.life)');
    expect(plainText('camera_movement 16:9 60 fps #FitTanpaRibet')).toBe('camera_movement 16:9 60 fps #FitTanpaRibet');
  });
  it('turns tables and fenced content into readable text', () => {
    expect(plainText('```md\n| Stage | Owner | Deadline |\n| --- | :---: | ---: |\n| Launch | PM | 15 November |\n```'))
      .toBe('Stage — Owner — Deadline\nLaunch — PM — 15 November');
  });
  it('cleans nested fields while preserving source documents and identifiers', () => {
    const source = { content: '# Original **source**', name: '**Original**' };
    const value = cleanStructuredText({ source_document: source, brief: { id: 'brief_01', creative_sections: { timeline: '**Launch**' }, constraints: ['**No rain**'] }, items: [{ id: 'rev_01', details: { camera_movement: '**Pan**' } }] });
    expect(value.source_document).toEqual(source);
    expect(value.brief.creative_sections.timeline).toBe('Launch');
    expect(value.brief.constraints).toEqual(['No rain']);
    expect(value.items[0]).toEqual({ id: 'rev_01', details: { camera_movement: 'Pan' } });
  });
});
