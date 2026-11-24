const canvas = document.querySelector('canvas');
const title = document.querySelector('h1');
const ctx = canvas.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let points = [], pointer, frame;

function layout() {
  const w = canvas.width = canvas.clientWidth, h = canvas.height = canvas.clientHeight;
  if (!w || !h) return;
  ctx.font = `900 ${Math.min(w * .27, h * .58, 200)}px system-ui, sans-serif`;
  const text = title.textContent;
  const m = ctx.measureText(text);
  ctx.fillText(text, (w - m.width) / 2, (h + m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
  const mask = ctx.getImageData(0, 0, w, h).data;
  const step = w < 500 ? 2 : 3;
  points = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
    const a = x + Math.random() * step, b = y + Math.random() * step;
    if (a >= w || b >= h || mask[(Math.floor(b) * w + Math.floor(a)) * 4 + 3] < 128) continue;
    points.push({ a, b, x: a, y: b, size: .7 + Math.random() * step * .55 });
  }
  title.classList.toggle('painted', points.length > 0);
  queue();
}

function queue() { if (!frame) frame = requestAnimationFrame(draw); }
function draw() {
  frame = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const radius = Math.min(150, canvas.width / 4);
  let moving = false;
  for (const p of points) {
    let tx = p.a, ty = p.b;
    if (pointer && !reduced.matches) {
      const dx = tx - pointer.x, dy = ty - pointer.y, d = Math.hypot(dx, dy);
      const force = Math.max(0, radius - d) * .5 / Math.max(1, d);
      tx += dx * force; ty += dy * force;
    }
    const easing = reduced.matches ? 1 : .28;
    p.x += (tx - p.x) * easing; p.y += (ty - p.y) * easing;
    moving ||= Math.abs(tx - p.x) + Math.abs(ty - p.y) > .1;
    ctx.fillStyle = Math.abs(p.x - p.a) + Math.abs(p.y - p.b) > 1 ? `hsl(${335 - p.a / canvas.width * 180} 95% 69%)` : '#fff';
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  if (moving) queue();
}

if (ctx) {
  new ResizeObserver(layout).observe(canvas);
  function reset() { pointer = null; queue(); }
  for (const event of ['pointerdown', 'pointermove']) canvas.addEventListener(event, e => {
    const box = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - box.left, y: e.clientY - box.top }; queue();
  });
  for (const event of ['pointerleave', 'pointerup', 'pointercancel']) canvas.addEventListener(event, reset);
  reduced.addEventListener('change', reset);
}
