(function () {
  const steps = document.querySelectorAll('.step');
  const dots = document.querySelectorAll('.progress .dot');
  const lines = document.querySelectorAll('.progress .line');
  let current = 1;

  const state = {
    date: null,
    time: null,
    foods: new Set(),
  };

  function show(n) {
    current = n;
    steps.forEach(s => s.classList.toggle('active', +s.dataset.step === n));
    dots.forEach((d, i) => d.classList.toggle('on', i < n));
    lines.forEach((l, i) => l.classList.toggle('on', i < n - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // step 1: yes / no
  document.getElementById('yesBtn').addEventListener('click', () => show(2));

  const noBtn = document.getElementById('noBtn');
  function dodge() {
    const pad = 12;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const r = noBtn.getBoundingClientRect();
    const maxX = w - r.width - pad;
    const maxY = h - r.height - pad;
    const x = Math.max(pad, Math.random() * maxX);
    const y = Math.max(pad, Math.random() * maxY);
    noBtn.style.position = 'fixed';
    noBtn.style.left = x + 'px';
    noBtn.style.top = y + 'px';
    noBtn.style.transform = 'rotate(' + (Math.random() * 30 - 15) + 'deg)';
  }
  noBtn.addEventListener('mouseenter', dodge);
  noBtn.addEventListener('focus', dodge);
  noBtn.addEventListener('touchstart', dodge, { passive: true });
  noBtn.addEventListener('click', (e) => { e.preventDefault(); dodge(); });

  // step 2 -> 3
  document.querySelector('[data-step="2"] [data-next]').addEventListener('click', () => show(3));

  // step 3 inputs
  const dateInput = document.getElementById('dateInput');
  const timeInput = document.getElementById('timeInput');
  const nextStep3 = document.getElementById('nextStep3');

  nextStep3.addEventListener('click', () => {
    state.date = dateInput.value || null;
    state.time = timeInput.value || null;
    show(4);
  });

  // step 4 food grid
  const grid = document.getElementById('foodGrid');
  const nextStep4 = document.getElementById('nextStep4');
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.food');
    if (!btn) return;
    const f = btn.dataset.food;
    if (state.foods.has(f)) {
      state.foods.delete(f);
      btn.classList.remove('selected');
    } else {
      state.foods.add(f);
      btn.classList.add('selected');
    }
    nextStep4.disabled = state.foods.size === 0;
  });

  nextStep4.addEventListener('click', () => {
    renderFinal();
    show(5);
  });

  // step 5 render
  function renderFinal() {
    const sumDate = document.getElementById('sumDate');
    const sumTime = document.getElementById('sumTime');
    const sumFood = document.getElementById('sumFood');
    const finalLine = document.getElementById('finalLine');

    let prettyDate = 'whenever you want 💗';
    if (state.date) {
      const d = new Date(state.date + 'T00:00:00');
      prettyDate = d.toLocaleDateString(undefined, {
        weekday: 'long', month: 'long', day: 'numeric'
      });
    }
    sumDate.textContent = prettyDate;

    const t = state.time ? state.time.split('—')[0].trim() : '19:00';
    sumTime.textContent = 'at ' + t;

    const foods = [...state.foods];
    sumFood.textContent = foods.length ? foods.join(' + ') : 'anything you want';

    finalLine.textContent = t + " it is. i'll be the one outside trying to look chill 😎";
  }

  // copy button
  document.getElementById('copyBtn').addEventListener('click', async () => {
    const toast = document.getElementById('toast');
    const t = document.getElementById('sumTime').textContent.replace(/^at\s+/, '');
    const d = document.getElementById('sumDate').textContent;
    const f = document.getElementById('sumFood').textContent;
    const text = `it's a date 💌\nwhen: ${d} at ${t}\nfood: ${f}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  });

  show(1);
})();
