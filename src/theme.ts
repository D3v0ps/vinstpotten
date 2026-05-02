// Säker — Editorial Scandinavian. Plommon på off-white.
// This is the primary theme. Other directions live as static reference at /design-explorer.html.

export const theme = {
  bg: '#F4EFE6',
  fg: '#1A1410',
  primary: '#3F2742',
  primaryFg: '#F4EFE6',
  accent: '#A85C3F',
  rule: '#1A1410',
  muted: '#7A6A5A',
  display: '"Instrument Serif", "Times New Roman", serif',
  ui: '"Inter Tight", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

export type Theme = typeof theme;
