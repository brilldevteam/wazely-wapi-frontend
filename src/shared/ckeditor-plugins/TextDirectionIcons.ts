// Minimal CKEditor-style icons (viewBox 0 0 20 20, matching the bundled icon set's conventions).
// CKEditor toolbar icons are raw SVG markup strings, not React components.

export const textDirectionIcon = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 4h11v1.5H2zM2 8h16v1.5H2zM2 12h11v1.5H2z" />
  <path d="M15.5 10.5 18 13l-2.5 2.5v-2H12v-1h3.5z" />
</svg>`;

export const rtlIcon = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 4h13v1.5H4zM7 8h10v1.5H7zM4 12h13v1.5H4z" />
  <path d="M4.5 7 2 9.25 4.5 11.5v-1.75H7v-1H4.5z" />
</svg>`;

export const ltrIcon = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 4h13v1.5H3zM3 8h10v1.5H3zM3 12h13v1.5H3z" />
  <path d="M15.5 7 18 9.25 15.5 11.5v-1.75H13v-1h2.5z" />
</svg>`;
