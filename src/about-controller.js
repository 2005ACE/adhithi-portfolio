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

  const wireframe = document.createElement('img');
  wireframe.className = 'portrait-wireframe';
  wireframe.src = '/assets/about-wireframe.png';
  wireframe.alt = '';
  wireframe.setAttribute('aria-hidden', 'true');
  frame.insertBefore(wireframe, image);
  function drawMesh(progress = 1, active = true) {
    wireframe.style.opacity = active ? '1' : '0';
    wireframe.style.clipPath = active ? `inset(${progress * 100}% 0 0 0)` : 'inset(100% 0 0 0)';
  }

  const assetsReady = Promise.all([image, wireframe].map(asset => {
    const decode = () => asset.decode ? asset.decode().catch(() => {}) : Promise.resolve();
    if (asset.complete && asset.naturalWidth) return decode();
    return new Promise((resolve, reject) => {
      asset.addEventListener('load', () => decode().then(resolve), { once: true });
      asset.addEventListener('error', reject, { once: true });
    });
  }));

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
    drawMesh(1, false);
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
    drawMesh(0, true);
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
    try {
      await assetsReady;
      if (id !== runId) return;
      prepare();
      if (motionPaused) {
        complete();
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 260));
      if (id !== runId) return;
      frame.classList.add('scan-active');
      const scanStart = performance.now();
      await new Promise(resolve => {
        function scan(now) {
          if (id !== runId) return resolve();
          const progress = Math.min(1, (now - scanStart) / 3000);
          frame.style.setProperty('--scan', `${progress * 100}%`);
          drawMesh(progress, true);
          if (progress < 1) requestAnimationFrame(scan);
          else resolve();
        }
        requestAnimationFrame(scan);
      });
      if (id !== runId) return;
      frame.classList.remove('scan-active', 'scan-prepared');
      frame.classList.add('scan-done');
      drawMesh(1, false);
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
