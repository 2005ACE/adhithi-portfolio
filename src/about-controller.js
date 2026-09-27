// Single owner for the fixed-layout About facial imaging scan.
export function initAbout({ scrollArea, about, nav, signatureMarkup }) {
  const layout = about.querySelector('.about-layout');
  const portrait = about.querySelector('[data-portrait-exit]');
  const frame = portrait?.querySelector('[data-portrait-reveal]');
  const image = portrait?.querySelector('.portrait-color');
  if (!layout || !portrait || !frame || !image) return;

  const foreground = document.createElement('div');
  foreground.className = 'about-foreground';
  layout.replaceWith(foreground);
  foreground.append(layout);

  const mono = image.cloneNode(true);
  mono.className = 'about-portrait portrait-mono';
  mono.alt = '';
  mono.setAttribute('aria-hidden', 'true');
  frame.insertBefore(mono, image);

  const mesh = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  mesh.classList.add('face-mesh');
  mesh.setAttribute('viewBox', '0 0 300 400');
  mesh.setAttribute('preserveAspectRatio', 'none');
  mesh.setAttribute('aria-hidden', 'true');
  // Hand-fitted landmarks for the supplied portrait crop (300x400).
  const meshPaths = [
    'M111 174 L124 166 L139 164 L151 169 L164 164 L178 166 L190 175',
    'M112 181 L124 177 L137 180 L125 185 Z M164 180 L177 177 L189 181 L177 185 Z',
    'M151 168 L148 190 L143 209 L151 216 L159 209 L154 190 Z',
    'M141 218 Q151 224 161 218 M137 228 Q151 237 165 228',
    'M113 176 L107 196 L112 218 L123 239 L139 253 L151 258 L163 253 L179 239 L190 218 L195 196 L189 176',
    'M123 154 Q151 137 178 154 M118 160 Q151 146 184 160',
    'M101 191 L108 218 L119 244 M201 191 L194 218 L183 244',
    'M130 205 L137 217 L139 237 M172 205 L165 217 L163 237',
    'M121 242 L137 253 L151 258 L165 253 L181 242',
    'M127 162 L135 157 L143 160 M159 160 L167 157 L175 162'
  ];
  const landmarks = [[124,181],[177,181],[151,190],[151,216],[137,228],[165,228],[151,258]];
  mesh.innerHTML = meshPaths.map(d => `<path d="${d}"/>`).join('') + landmarks.map(([x,y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('');
  frame.append(mesh);

  const signature = document.createElement('div');
  signature.innerHTML = signatureMarkup;
  const sign = signature.firstElementChild;
  portrait.append(sign);
  const pen = document.createElement('span');
  pen.className = 'portrait-stylus';
  pen.setAttribute('aria-hidden', 'true');
  pen.innerHTML = '<i></i>';
  portrait.append(pen);

  const paths = [...sign.querySelectorAll('path')];
  const lengths = paths.map(path => path.getTotalLength());
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  let runId = 0;
  let active = false;
  let scheduled = 0;
  let motionPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function complete() {
    runId++;
    frame.classList.remove('scan-prepared', 'scan-active');
    frame.classList.add('scan-done');
    frame.style.setProperty('--scan', '100%');
    portrait.classList.add('has-signature');
    sign.style.opacity = '1';
    paths.forEach((path) => {
      path.style.strokeDasharray = '';
      path.style.strokeDashoffset = '0';
      path.style.visibility = 'visible';
    });
    pen.style.opacity = '0';
    about.classList.remove('about-playing');
  }

  function prepare() {
    frame.classList.remove('scan-done', 'scan-active');
    frame.classList.add('scan-prepared');
    frame.style.setProperty('--scan', '0%');
    portrait.classList.remove('has-signature');
    sign.style.opacity = '0';
    paths.forEach((path, index) => {
      path.style.strokeDasharray = String(lengths[index]);
      path.style.strokeDashoffset = String(lengths[index]);
      path.style.visibility = 'visible';
    });
    pen.style.opacity = '0';
    about.classList.add('about-playing');
  }

  function penAt(path, distance) {
    const point = path.getPointAtLength(distance);
    const parent = portrait.getBoundingClientRect();
    const rect = sign.getBoundingClientRect();
    pen.style.left = `${(rect.left - parent.left + point.x * rect.width / 360) / (parent.width / portrait.offsetWidth)}px`;
    pen.style.top = `${(rect.top - parent.top + point.y * rect.height / 62) / (parent.height / portrait.offsetHeight)}px`;
    pen.style.opacity = '1';
  }

  function drawSignature(id) {
    return new Promise(resolve => {
      const started = performance.now();
      function step(now) {
        if (id !== runId) return resolve();
        const progress = Math.min(1, (now - started) / 2000);
        let remaining = progress * totalLength;
        let activePath = null;
        paths.forEach((path, index) => {
          const drawn = Math.min(lengths[index], Math.max(0, remaining));
          path.style.strokeDashoffset = String(lengths[index] - drawn);
          if (!activePath && drawn > 0 && remaining <= lengths[index]) activePath = [path, drawn];
          remaining -= lengths[index];
        });
        if (activePath) penAt(activePath[0], activePath[1]);
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  async function play(force = false) {
    if (!active && !force) return;
    runId++;
    const id = runId;
    prepare();
    if (motionPaused || !image.naturalWidth) {
      complete();
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 260));
      if (id !== runId) return;
      frame.classList.add('scan-active');
      const scanStart = performance.now();
      await new Promise(resolve => {
        function scan(now) {
          if (id !== runId) return resolve();
          const progress = Math.min(1, (now - scanStart) / 3000);
          frame.style.setProperty('--scan', `${progress * 100}%`);
          if (progress < 1) requestAnimationFrame(scan);
          else resolve();
        }
        requestAnimationFrame(scan);
      });
      if (id !== runId) return;
      frame.classList.remove('scan-active', 'scan-prepared');
      frame.classList.add('scan-done');
      portrait.classList.add('has-signature');
      sign.style.opacity = '1';
      await drawSignature(id);
      if (id !== runId) return;
      pen.style.opacity = '0';
      await new Promise(resolve => setTimeout(resolve, 250));
      if (id === runId) complete();
    } catch (error) {
      if (id === runId) {
        console.error('About scan recovered:', error);
        complete();
      }
    }
  }

  function isAboutActive() {
    const area = scrollArea.getBoundingClientRect();
    const rect = about.getBoundingClientRect();
    const top = rect.top - area.top;
    return top < area.height * .17 && top > -area.height * .18;
  }

  function queue() {
    if (!scheduled) scheduled = requestAnimationFrame(() => {
      scheduled = 0;
      const here = isAboutActive();
      if (here && !active) {
        active = true;
        play();
      } else if (!here && active) {
        active = false;
        runId++;
        complete();
      }
    });
  }

  scrollArea.addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  nav.querySelector('a[href="#about"]')?.addEventListener('click', () => {
    if (isAboutActive()) {
      active = true;
      play(true);
    }
  });
  addEventListener('anatomy-motion-paused', event => {
    motionPaused = !!event.detail;
    if (motionPaused) complete();
  });
  image.addEventListener('load', () => {
    if (active && !motionPaused) play(true);
  }, { once: true });

  frame.classList.add('scan-done');
  portrait.classList.add('has-signature');
  complete();
  checkInitial();
  function checkInitial() { if (isAboutActive()) { active = true; play(); } }
}
