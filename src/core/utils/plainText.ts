/** Remove Markdown formatting while retaining text, links, tables and line breaks. */
export function plainText(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/^\s*(`{3,}|~{3,})[^\n]*$/gm, '')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+(?:\[[ xX]\]\s*)?/gm, '• ')
    .replace(/^\s*(?:[-*_]\s*){3,}$/gm, '')
    .replace(/^[ \t]*\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?[ \t]*(?:\n|$)/gm, '')
    .replace(/^[ \t]*\|(.+)\|[ \t]*$/gm, (_, cells: string) => cells.split('|').map(cell => cell.trim()).join(' — '))
    .replace(/!?\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, url: string) => `${label} (${url})`)
    .replace(/(`+)([^`]+)\1/g, '$2')
    .replace(/(\*\*|__)([^\n]+?)\1/g, '$2')
    .replace(/~~([^\n]+?)~~/g, '$1')
    .replace(/(^|[\s(])([*_])([^\s*_][^\n]*?)\2(?=$|[\s.,!?:;)])/gm, '$1$3')
    .replace(/\\([\\`*_{}\[\]()#+.!>|~-])/g, '$1')
    .replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n')
    .trim();
}

const textFields = new Set(['title', 'description', 'objective', 'visual_style', 'lighting_mood',
  'characters', 'key_props', 'constraints', 'unresolved_questions', 'name', 'details',
  'creative_sections', 'generation_details', 'storyboard', 'change_note', 'review_note']);

/** Clean structured output only; original source documents and identifiers stay intact. */
export function cleanStructuredText<T>(value: T): T {
  function visit(input: unknown, clean = false): unknown {
    if (typeof input === 'string') return clean ? plainText(input) : input;
    if (Array.isArray(input)) return input.map(item => visit(item, clean));
    if (input && typeof input === 'object') return Object.fromEntries(Object.entries(input).map(([key, item]) =>
      [key, key === 'source_document' ? item : visit(item, clean || textFields.has(key))]));
    return input;
  }
  return visit(value) as T;
}
