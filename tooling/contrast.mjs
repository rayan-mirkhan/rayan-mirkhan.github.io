// Local-only: WCAG contrast check for the design-token text/background pairs.
const hex = (h) => h.match(/\w\w/g).map((x) => parseInt(x, 16) / 255);
const lum = (h) => { const [r, g, b] = hex(h).map((c) => (c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)); return .2126 * r + .7152 * g + .0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };
const pairs = [
  ['light ink / paper', '14181F', 'F7F5F0'], ['light muted / paper', '5B6472', 'F7F5F0'], ['light muted / tint', '5B6472', 'EFECE4'],
  ['light muted / card', '5B6472', 'FFFFFF'], ['gold-700 / paper', '8F6B00', 'F7F5F0'], ['gold-700 / tint', '8F6B00', 'EFECE4'], ['gold-700 / card', '8F6B00', 'FFFFFF'],
  ['on-navy / navy-900', 'ECE8DF', '0B1A2E'], ['on-navy-muted / navy-900', 'A9B3C2', '0B1A2E'], ['on-navy / navy-700', 'ECE8DF', '1E3150'],
  ['white / navy-500 (lower-third)', 'FFFFFF', '2E3A4F'], ['gold-500 / navy-900', 'E8B931', '0B1A2E'], ['navy-900 / gold-500', '0B1A2E', 'E8B931'],
  ['navy-900 / gold-300', '0B1A2E', 'F5DC8A'], ['footer muted / #07111F', 'A9B3C2', '07111F'],
  ['dark ink / paper', 'ECE8DF', '0A111C'], ['dark muted / paper', '9EA8B6', '0A111C'], ['dark muted / tint', '9EA8B6', '0D1727'],
  ['dark muted / card navy-900', '9EA8B6', '0B1A2E'], ['dark gold / tint', 'E8B931', '0D1727'], ['gold-500 / navy-700 (role pill dark)', 'E8B931', '1E3150'],
  ['pass muted / pass paper', '5B6472', 'F7F5F0'], ['status chip text on navy', 'ECE8DF', '0F2A33'],
];
let fail = 0;
for (const [name, fg, bg] of pairs) { const r = ratio(fg, bg); if (r < 4.5) fail++; console.log((r >= 4.5 ? 'PASS' : 'FAIL'), r.toFixed(2), name); }
console.log(fail ? `${fail} below AA` : 'all AA');
