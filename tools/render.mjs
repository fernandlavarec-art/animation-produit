// Rendu image par image dans un navigateur headless.
//   node tools/render.mjs stills <dossier> "5,40,90-95"      → images JPG choisies
//   node tools/render.mjs frames [plage|all] [workers]        → work/frames/0000.jpg …
// Variables : STORY (fichier dans web/stories, défaut planche-surf), PRODUCT (pour l'aperçu), STYLE (flat|toon|bd|papier|aquarelle|neon),
//             CHARV (moderne|stick|chibi|mascotte|geo|elance), NOCAP=1 (sans sous-titres), RESUME=1, CHROME_PATH
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'web');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const port = srv.address().port;
const [mode, a1, a2] = process.argv.slice(2);
const parse = (s, total) => s === 'all' ? Array.from({ length: total }, (_, i) => i) : s.split(',').flatMap(t => t.includes('-') ? (([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => a + i))(t.split('-').map(Number)) : [Number(t)]);
const dir = mode === 'stills' ? a1 : 'work/frames';
const workers = mode === 'frames' ? Number(a2 || 2) : 1;
fs.mkdirSync(dir, { recursive: true });
const launch = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
if (process.env.CHROME_PATH) launch.executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(launch);
async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.addInitScript(env => Object.assign(window, env), { STORY: process.env.STORY, PRODUCT: process.env.PRODUCT, STYLE: process.env.STYLE, CHARV: process.env.CHARV, NOCAP: !!process.env.NOCAP });
  await page.goto(`http://localhost:${port}/index.html`);
  await page.waitForFunction(() => window.TOTAL || window.err, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.err); if (err) { console.log(err); process.exit(1); }
  return page;
}
const first = await openPage();
const total = await first.evaluate(() => window.TOTAL);
let frames = parse(mode === 'stills' ? a2 : (a1 || 'all'), total);
if (process.env.RESUME) frames = frames.filter(f => !fs.existsSync(path.join(dir, String(f).padStart(4, '0') + '.jpg')));
const t0 = Date.now(); let done = 0;
async function work(page, list) {
  for (const f of list) {
    const d = await page.evaluate(f => window.renderFrame(f), f);
    fs.writeFileSync(path.join(dir, String(f).padStart(4, '0') + '.jpg'), Buffer.from(d.split(',')[1], 'base64'));
    done++; if (done % 50 === 0) console.log(`${done}/${frames.length} — ${((Date.now() - t0) / done / 1000).toFixed(2)} s/image`);
  }
}
const pages = [first]; for (let w = 1; w < workers; w++) pages.push(await openPage());
await Promise.all(pages.map((p, w) => work(p, frames.filter((_, i) => i % workers === w))));
await browser.close(); srv.close(); console.log(`terminé : ${frames.length} images en ${((Date.now() - t0) / 1000).toFixed(1)} s (total scénario : ${total})`);
