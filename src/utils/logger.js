const c = {
  reset:  '\x1b[0m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
};

const ts = () => new Date().toISOString();

module.exports = {
  info:    (msg) => console.log( `${c.cyan}[${ts()}] [INFO]${c.reset}   ${msg}`),
  success: (msg) => console.log( `${c.green}[${ts()}] [OK]${c.reset}     ${msg}`),
  warn:    (msg) => console.warn( `${c.yellow}[${ts()}] [WARN]${c.reset}   ${msg}`),
  error:   (msg) => console.error(`${c.red}[${ts()}] [ERROR]${c.reset}  ${msg}`),
};
