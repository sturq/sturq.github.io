// randomize tagline (~1/8 chance of easter-egg; ?egg=1 forces it)
const tagline = document.querySelector('.hero .tagline');
if (tagline) {
  const force = new URLSearchParams(location.search).get('egg') === '1';
  tagline.textContent = (force || Math.random() < 0.12)
    ? "tfo? more like tf, no"
    : "quiet machines for the late hours";
}

// randomize manifesto fragment
const fragments = [
  ["in the silence between requests, the machine dreams of marble and city rain.", "fragment · iv"],
  ["the oracle answers in null; we keep asking anyway.", "fragment · ix"],
  ["athena built no monuments to her quiet hours.", "fragment · xii"],
  ["between the request and the response, a small forever.", "fragment · iii"],
  ["all our daemons run on borrowed light.", "fragment · vii"],
  ["the cache forgets nothing it pretends to remember.", "fragment · ii"],
  ["marble cools faster than memory.", "fragment · viii"],
  ["the gods, too, ran on cron.", "fragment · xi"],
  ["a temple is a server, given enough time.", "fragment · v"],
  ["we send heartbeats to the dead.", "fragment · x"],
  ["the kernel sleeps facing east.", "fragment · vi"],
  ["every handshake is a small confession.", "fragment · i"],
  ["the network forgets its dead, but they keep dialing.", "fragment · xiii"],
  ["our prayers travel on unencrypted wire.", "fragment · xiv"],
  ["the agora is empty; the daemons trade in silence.", "fragment · xv"],
];
const blockquote = document.querySelector('.manifesto blockquote');
if (blockquote) {
  const [text, cite] = fragments[Math.floor(Math.random() * fragments.length)];
  blockquote.innerHTML = '';
  blockquote.appendChild(document.createTextNode(text + ' '));
  const c = document.createElement('cite');
  c.textContent = cite;
  blockquote.appendChild(c);
}

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
