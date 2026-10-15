// Hook PostToolUse (Edit|Write): valida sintaxis del archivo recién editado según su extensión.
// Si el chequeo falla, exit 2 → el error le llega a Claude al instante, antes de que el
// código roto (o un _index.json corrupto) viaje a ningún lado.
//
// Stack de Arte: Node (.mjs/.js/.cjs) + JSON (los _index.json son el inventario: un JSON roto
// rompe una colección entera). Si la herramienta no está instalada, el hook se salta en silencio.

const path = require('path');
const { execFileSync } = require('child_process');

// Mapa extensión → [comando, args]. '{file}' se reemplaza por el path editado.
const JSON_CHECK = ['node', ['-e', 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))', '{file}']];
const CHECKS = {
  '.mjs': ['node', ['--check', '{file}']],
  '.js': ['node', ['--check', '{file}']],
  '.cjs': ['node', ['--check', '{file}']],
  '.json': JSON_CHECK,
  '.sh': ['bash', ['-n', '{file}']],
};

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let file = '';
  try {
    file = String(JSON.parse(raw).tool_input?.file_path || '');
  } catch {
    process.exit(0);
  }
  const ext = path.extname(file).toLowerCase();
  const check = CHECKS[ext];
  if (!check) process.exit(0);

  const [cmd, args] = check;
  const finalArgs = args.map((a) => a.replace('{file}', file));
  try {
    execFileSync(cmd, finalArgs, {
      stdio: ['ignore', 'ignore', 'pipe'],
      cwd: process.env.CLAUDE_PROJECT_DIR || undefined,
    });
    process.exit(0);
  } catch (e) {
    if (e.code === 'ENOENT') process.exit(0); // herramienta no instalada → no bloquear
    const err = e.stderr ? e.stderr.toString() : (e.stdout ? e.stdout.toString() : String(e));
    process.stderr.write(cmd + ' detectó un error de sintaxis en ' + file + ':\n' + err);
    process.exit(2);
  }
});
