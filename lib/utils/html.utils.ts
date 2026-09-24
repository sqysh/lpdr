// Anything not written by us goes through this before it reaches email HTML, so text containing
// markup renders as text rather than as part of the email
export const escapeHtml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
