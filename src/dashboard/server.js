const express = require('express');
const session = require('express-session');
const path    = require('path');
const config  = require('../config');
const logger  = require('../utils/logger');

module.exports = function startDashboard(client) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(session({
    secret: config.dashboardSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86_400_000 }, // 24 h
  }));

  app.use(express.static(path.join(__dirname, 'public')));

  // ── Auth guard for all /api routes ───────────────────────────────────────
  function requireAuth(req, res, next) {
    if (req.session.user) return next();
    res.status(401).json({ error: 'Unauthorized' });
  }

  app.use('/auth', require('./routes/auth'));
  app.use('/api',  requireAuth, require('./routes/api')(client));

  // Serve the SPA shell for everything else (app.use catches all unmatched routes in Express 5)
  app.use((_req, res) =>
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  );

  const port = config.dashboardPort;
  app.listen(port, () => logger.success(`Dashboard → http://localhost:${port}`));
};
