// Apply saved theme before paint (no flash). Light is the default.
// Kept as a file so the CSP can block inline scripts.
try { document.documentElement.dataset.theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'; } catch (e) {}
