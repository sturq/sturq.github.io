// reveal-on-scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// mouse parallax on hero bust (via CSS custom props on wrapper)
const bustWrap = document.querySelector('.bust-wrap');
if (bustWrap && window.matchMedia('(pointer: fine)').matches) {
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const onMove = (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    tx = (e.clientX - cx) / cx;
    ty = (e.clientY - cy) / cy;
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const tick = () => {
    x += (tx - x) * 0.06;
    y += (ty - y) * 0.06;
    bustWrap.style.setProperty('--px', `${x * -14}px`);
    bustWrap.style.setProperty('--py', `${y * -10}px`);
    if (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
    }
  };
  window.addEventListener('mousemove', onMove, { passive: true });
}
