// Access Digital themed views - matching https://accessdigital.pyrohub.my/
const { FORM_DEFINITIONS } = require('../backend/db');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function siteHeader(user, clientId = null) {
  const roleLabels = { admin: 'Admin' };
  const displayLabel = user.role === 'client' && clientId ? clientId : roleLabels[user.role] || user.role;
  const roleBadge = `<span class="role-badge">${displayLabel}</span>`;

  let links = '';
  if (user.role === 'admin') {
    links = `<a href="/admin">Dashboard</a>`;
  }

  return `
    <header class="site-header">
      <div class="header-container">
        <a href="/" class="site-logo">
          <img src="/ACCESS-DIGITAL-LOGO-01-1024x524.png" alt="Access Digital">
          <span class="site-logo-text">CLIENT PORTAL</span>
        </a>
        <nav class="header-nav">
          ${links}
          ${roleBadge}
          <a href="/logout">Logout</a>
        </nav>
      </div>
    </header>
  `;
}

function htmlPage(title, content, user = null, clientId = null) {
  const header = user ? siteHeader(user, clientId) : '';
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Access Digital Portal</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      ${header}
      ${content}
    </body>
    </html>
  `;
}
