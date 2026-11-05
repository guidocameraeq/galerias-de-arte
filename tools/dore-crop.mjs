// Recorte DETERMINÍSTICO del margen de papel de una página de libro con una plancha de Doré (excepción documentada a la regla 2:
// docs/CALIDAD.md §5). Solo se corta el papel crema y el fondo: los píxeles del grabado no se tocan, no se reescalan, no se retocan.
// Se detecta el grabado como el componente "no-papel" más grande que no toca el borde de la página (en miniatura), y se
// traduce el rectángulo a la resolución original. Solo lectura: devuelve el rectángulo; quien llama recorta con sharp.extract().
import sharp from 'sharp';

const paperFn = (minRB) => (r, g, b) => r > 165 && g > 145 && b > 105 && r - b > minRB && r - b < 80 && (r - g) < 40;

export async function detectPlate(file, { work = 900, inset = 0.006, minRB = 10, mode = 'paper', texThr = 7, dilate = 2 } = {}) {
  // mode 'paper': grabado = lo que no es papel crema (grabados oscuros, caso normal)
  // mode 'texture': además cuenta como grabado lo que tiene trama (cielos claros que se parecen al papel)
  // mode 'white': margen blanco puro (series 'Plate N' de Commons): grabado = lo que no es blanco
  const isPaper = mode === 'white' ? ((r, g, b) => (r + g + b) / 3 >= 244) : mode === 'dark' ? ((r, g, b) => (r + g + b) / 3 >= 205) : paperFn(minRB);
  const meta = await sharp(file, { limitInputPixels: false }).metadata();
  const scale = work / Math.max(meta.width, meta.height);
  const w = Math.round(meta.width * scale), h = Math.round(meta.height * scale);
  const { data } = await sharp(file, { limitInputPixels: false }).resize(w, h, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) ink[i] = isPaper(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) ? 0 : 1;
  if (mode === 'texture') {
    const lum = new Float32Array(w * h); for (let i = 0; i < w * h; i++) lum[i] = (data[i * 3] + data[i * 3 + 1] + data[i * 3 + 2]) / 3;
    const g = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) g[y * w + x] = Math.abs(lum[y * w + x + 1] - lum[y * w + x - 1]) + Math.abs(lum[(y + 1) * w + x] - lum[(y - 1) * w + x]);
    const K = 3;
    for (let y = K; y < h - K; y++) for (let x = K; x < w - K; x++) { let sum = 0; for (let dy = -K; dy <= K; dy++) for (let dx = -K; dx <= K; dx++) sum += g[(y + dy) * w + x + dx]; if (sum / ((2 * K + 1) ** 2) > texThr) ink[y * w + x] = 1; }
  }
  // cierre morfológico simple (dilatar 2 px) para unir tramas claras del grabado
  const dil = new Uint8Array(w * h), R = dilate;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!ink[y * w + x]) continue;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < h && xx >= 0 && xx < w) dil[yy * w + xx] = 1; }
  }
  // componentes conexas (4-vecinos)
  const lab = new Int32Array(w * h); let best = null, id = 0;
  const stack = [];
  for (let s = 0; s < w * h; s++) {
    if (!dil[s] || lab[s]) continue;
    id++; let minx = w, miny = h, maxx = 0, maxy = 0, area = 0, touches = false;
    stack.push(s); lab[s] = id;
    while (stack.length) {
      const p = stack.pop(), y = (p / w) | 0, x = p - y * w; area++;
      if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
      if (x <= 1 || y <= 1 || x >= w - 2 || y >= h - 2) touches = true;
      for (const q of [p - 1, p + 1, p - w, p + w]) { if (q >= 0 && q < w * h && dil[q] && !lab[q] && Math.abs(((q / w) | 0) - y) <= 1) { lab[q] = id; stack.push(q); } }
    }
    if (!touches && (!best || area > best.area)) best = { minx, miny, maxx, maxy, area };
  }
  if (!best) return null;
  // quitar el efecto de la dilatación (R px) y aplicar un pequeño margen interior
  const x0 = Math.max(0, best.minx + R), y0 = Math.max(0, best.miny + R), x1 = Math.min(w - 1, best.maxx - R), y1 = Math.min(h - 1, best.maxy - R);
  const ix = Math.round((x1 - x0) * inset / scale * scale), iy = Math.round((y1 - y0) * inset);
  const L = Math.round((x0 + ix) / scale), T = Math.round((y0 + iy) / scale);
  const W = Math.round((x1 - x0 - 2 * ix) / scale), H = Math.round((y1 - y0 - 2 * iy) / scale);
  return { left: L, top: T, width: Math.min(W, meta.width - L), height: Math.min(H, meta.height - T), page: { w: meta.width, h: meta.height }, areaFrac: best.area / (w * h) };
}

if (process.argv[1]?.endsWith('dore-crop.mjs')) {
  const f = process.argv[2], out = process.argv[3];
  const r = await detectPlate(f);
  console.log(JSON.stringify(r));
  if (out && r) await sharp(f, { limitInputPixels: false }).extract({ left: r.left, top: r.top, width: r.width, height: r.height }).jpeg({ quality: 95 }).toFile(out);
}

// Quita franjas finas de papel que queden pegadas a los bordes de la caja (máx. maxFrac del lado). Solo mueve el rectángulo.
export async function refineBox(file, box, { work = 700, maxFrac = 0.03, minRB = 10, thr = 0.25, stdMax = 9 } = {}) {
  const isPaper = paperFn(minRB);
  const sc = work / Math.max(box.width, box.height);
  const w = Math.max(8, Math.round(box.width * sc)), h = Math.max(8, Math.round(box.height * sc));
  const { data } = await sharp(file, { limitInputPixels: false }).extract({ left: box.left, top: box.top, width: box.width, height: box.height })
    .resize(w, h, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => { const i = (y * w + x) * 3; return isPaper(data[i], data[i + 1], data[i + 2]) ? 1 : 0; };
  let t = 0, b = 0, l = 0, r = 0; const mx = Math.round(w * maxFrac), my = Math.round(h * maxFrac);
  const lumAt = (x, y) => { const i = (y * w + x) * 3; return (data[i] + data[i + 1] + data[i + 2]) / 3; };
  // una fila/columna es "papel" si es crema Y lisa (el grabado, aunque sea claro, tiene trama: desvío alto)
  const isPaperLine = (n, get) => { let c = 0, m = 0, m2 = 0; for (let k = 0; k < n; k++) { const [x, y] = get(k); c += px(x, y); const v = lumAt(x, y); m += v; m2 += v * v; } m /= n; const sd = Math.sqrt(Math.max(0, m2 / n - m * m)); return c / n > thr && sd < stdMax; };
  const rowP = (y) => isPaperLine(w - l - r, (k) => [l + k, y]);
  const colP = (x) => isPaperLine(h - t - b, (k) => [x, t + k]);
  while (t < my && rowP(t)) t++;
  while (b < my && rowP(h - 1 - b)) b++;
  while (l < mx && colP(l)) l++;
  while (r < mx && colP(w - 1 - r)) r++;
  const pad = 2; // 2 px de la miniatura de margen extra si se recortó algo
  const f = (v) => (v ? Math.round((v + pad) / sc) : 0);
  const L = f(l), T = f(t), Rr = f(r), B = f(b);
  return { left: box.left + L, top: box.top + T, width: box.width - L - Rr, height: box.height - T - B, trimmed: { t: T, b: B, l: L, r: Rr } };
}
