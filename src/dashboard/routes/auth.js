const { Router }        = require('express');
const https             = require('https');
const { URLSearchParams } = require('url');
const config            = require('../../config');
const logger            = require('../../utils/logger');

const DISCORD_API = 'https://discord.com/api/v10';

// Minimal Promise wrappers around Node's https module — no extra dependencies needed
function httpsPost(urlStr, params) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const url  = new URL(urlStr);
    const opts = {
      hostname: url.hostname,
      path:     url.pathname,
      method:   'POST',
      headers: {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function httpsGet(urlStr, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    https.get(
      { hostname: url.hostname, path: url.pathname, headers: { Authorization: `Bearer ${token}` } },
      res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
      }
    ).on('error', reject);
  });
}

const router = Router();

router.get('/discord', (_req, res) => {
  const params = new URLSearchParams({
    client_id:     config.clientId,
    redirect_uri:  config.dashboardCallbackUrl,
    response_type: 'code',
    scope:         'identify',
  });
  res.redirect(`${DISCORD_API}/oauth2/authorize?${params}`);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/?error=no_code');

  try {
    const tokenData = await httpsPost(`${DISCORD_API}/oauth2/token`, {
      client_id:     config.clientId,
      client_secret: config.clientSecret,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  config.dashboardCallbackUrl,
    });

    if (!tokenData.access_token) {
      logger.error(`OAuth token exchange failed: ${JSON.stringify(tokenData)}`);
      return res.redirect('/?error=auth_failed');
    }

    const user = await httpsGet(`${DISCORD_API}/users/@me`, tokenData.access_token);

    const adminIds = config.adminIds.split(',').map(id => id.trim()).filter(Boolean);
    if (adminIds.length && !adminIds.includes(user.id)) {
      return res.redirect('/?error=not_admin');
    }

    req.session.user = {
      id:         user.id,
      username:   user.username,
      globalName: user.global_name || user.username,
      avatar:     user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`,
    };

    res.redirect('/');
  } catch (err) {
    logger.error(`Auth callback error: ${err.message}`);
    res.redirect('/?error=auth_failed');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
