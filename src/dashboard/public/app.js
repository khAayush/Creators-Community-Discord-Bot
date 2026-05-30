/* ── State ─────────────────────────────────────────────────────────────── */
let channels = [];

/* ── Boot ──────────────────────────────────────────────────────────────── */
(async function init() {
  const params = new URLSearchParams(location.search);

  try {
    const [me, guild, cfg, rrData] = await Promise.all([
      api('/me'),
      api('/guild'),
      api('/config'),
      api('/reaction-roles'),
    ]);

    channels = guild.channels;

    showPage('dashboard');
    renderUser(me);
    renderGuild(guild);
    renderStats(guild, rrData);
    populateAllSelects();
    prefillWelcome(cfg);
    renderRolesConfigured(rrData.configured);
    renderRolesActive(rrData.active, guild.channels);
  } catch {
    showPage('login');
    if (params.get('error')) showLoginError(params.get('error'));
  }
})();

/* ── Navigation ────────────────────────────────────────────────────────── */
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    item.classList.add('active');
    document.getElementById(`section-${item.dataset.section}`).classList.add('active');
  });
});

/* ── Form: Welcome ─────────────────────────────────────────────────────── */
document.getElementById('form-welcome').addEventListener('submit', async e => {
  e.preventDefault();
  const btn  = document.getElementById('btn-welcome');
  const data = Object.fromEntries(new FormData(e.target));
  setLoading(btn, true);
  try {
    await api('/config/welcome', { method: 'POST', body: JSON.stringify(data) });
    toast('Welcome settings saved!');
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    setLoading(btn, false);
  }
});

/* ── Form: Announce ────────────────────────────────────────────────────── */
document.getElementById('form-announce').addEventListener('submit', async e => {
  e.preventDefault();
  const btn  = document.getElementById('btn-announce');
  const data = Object.fromEntries(new FormData(e.target));
  setLoading(btn, true);
  try {
    await api('/announce', { method: 'POST', body: JSON.stringify(data) });
    toast('Announcement sent!');
    e.target.reset();
    populateAllSelects(); // re-select first channel after reset
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    setLoading(btn, false);
  }
});

/* ── Form: Reaction Roles ──────────────────────────────────────────────── */
document.getElementById('form-roles').addEventListener('submit', async e => {
  e.preventDefault();
  const btn  = document.getElementById('btn-roles');
  const data = Object.fromEntries(new FormData(e.target));
  setLoading(btn, true);
  try {
    const res = await api('/reaction-roles/setup', { method: 'POST', body: JSON.stringify(data) });
    toast(`Role picker posted! Message ID: ${res.messageId}`);
    // Refresh active list
    const rrData = await api('/reaction-roles');
    const guild  = await api('/guild');
    renderRolesActive(rrData.active, guild.channels);
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    setLoading(btn, false);
  }
});

/* ── Render helpers ────────────────────────────────────────────────────── */
function showPage(name) {
  document.getElementById('page-login').classList.toggle('hidden', name !== 'login');
  document.getElementById('page-dashboard').classList.toggle('hidden', name !== 'dashboard');
}

function renderUser(me) {
  document.getElementById('user-avatar').src = me.avatar;
  document.getElementById('user-name').textContent = me.globalName || me.username;
}

function renderGuild(guild) {
  const icon = document.getElementById('guild-icon');
  if (guild.icon) {
    icon.src = guild.icon;
    icon.alt = guild.name;
  } else {
    icon.style.display = 'none';
  }
  document.getElementById('guild-name').textContent = guild.name;
}

function renderStats(guild, rrData) {
  document.getElementById('stat-members').textContent  = guild.memberCount.toLocaleString();
  document.getElementById('stat-channels').textContent = guild.channels.length;
  document.getElementById('stat-roles').textContent    = Object.keys(rrData.active || {}).length;
}

function populateAllSelects() {
  document.querySelectorAll('select[data-channels]').forEach(sel => {
    const current = sel.value;
    sel.innerHTML = channels
      .map(c => `<option value="${c.id}">#${c.name}</option>`)
      .join('');
    if (current) sel.value = current;
  });
}

function prefillWelcome(cfg) {
  if (cfg.welcomeChannelId) {
    document.getElementById('welcome-channel').value = cfg.welcomeChannelId;
  }
  if (cfg.welcomeMessage) {
    document.getElementById('welcome-message').value = cfg.welcomeMessage;
  }
}

function renderRolesConfigured(roles) {
  const el = document.getElementById('roles-configured');
  if (!roles || !roles.length) { el.textContent = 'No roles defined.'; return; }
  el.innerHTML = `
    <table class="roles-table">
      <thead><tr><th>Emoji</th><th>Label</th><th>Status</th></tr></thead>
      <tbody>
        ${roles.map(r => `
          <tr>
            <td>${r.emoji}</td>
            <td>${r.label}</td>
            <td class="${r.roleId ? 'badge-ok' : 'badge-missing'}">
              ${r.roleId ? '✓ configured' : '✗ missing role ID in .env'}
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderRolesActive(active, channelList) {
  const el = document.getElementById('roles-active');
  const entries = Object.entries(active || {});
  if (!entries.length) { el.innerHTML = '<p class="hint">No role messages posted yet.</p>'; return; }

  const findChannel = id => {
    const ch = channelList.find(c => c.id === id);
    return ch ? `#${ch.name}` : id;
  };

  el.innerHTML = entries.map(([msgId, mapping]) => `
    <div style="margin-bottom:12px; padding:12px; background:var(--surface); border-radius:6px;">
      <div style="font-size:12px; color:var(--text-3); margin-bottom:6px;">Message ID: <code>${msgId}</code></div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        ${Object.entries(mapping).map(([emoji, roleId]) =>
          `<span style="background:var(--card);padding:3px 10px;border-radius:20px;font-size:12px;">${emoji} → <code>${roleId}</code></span>`
        ).join('')}
      </div>
    </div>`).join('');
}

function showLoginError(code) {
  const msgs = {
    not_admin:   'Your Discord account does not have admin access.',
    auth_failed: 'Authentication failed. Please try again.',
    no_code:     'No authorization code received from Discord.',
  };
  const el = document.getElementById('login-error');
  el.textContent = msgs[code] || 'Login failed.';
  el.classList.remove('hidden');
}

/* ── Utilities ─────────────────────────────────────────────────────────── */
async function api(path, opts = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : btn.dataset.label || btn.textContent;
  if (!loading && !btn.dataset.label) btn.dataset.label = btn.textContent;
}

let toastTimer;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}
