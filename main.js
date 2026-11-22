// counts come from the generated lists, so the daily sync never leaves a stale number
document.querySelectorAll('[data-count]').forEach(e => e.textContent = document.querySelectorAll(e.dataset.count).length);

const chips = document.querySelectorAll('.chips button');
chips.forEach(b => b.addEventListener('click', () => {
  chips.forEach(c => c.setAttribute('aria-pressed', c === b));
  document.querySelectorAll('.cat').forEach(c => c.hidden = b.dataset.f !== 'all' && c.dataset.cat !== b.dataset.f);
}));

const rail = document.querySelector('.rail');
document.querySelectorAll('.pager button').forEach(b => b.addEventListener('click', () =>
  rail.scrollBy({ left: b.dataset.dir * rail.clientWidth * 0.8, behavior: 'smooth' })));

// ponytail: footer (#contact) rarely reaches the middle band, so contact lights up only on short screens
const nav = [...document.querySelectorAll('.bar a[href^="#"]')];
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) nav.forEach(a => a.hash === '#' + e.target.id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
}), { rootMargin: '-40% 0px -55% 0px' });
nav.forEach(a => spy.observe(document.querySelector(a.hash)));
