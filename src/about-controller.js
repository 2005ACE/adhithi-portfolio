// One controller owns the About camera, image scan, signature, and replay.
export function initAbout({ scrollArea, about, nav, signatureMarkup }) {
  const layout = about.querySelector('.about-layout');
  const portrait = about.querySelector('[data-portrait-exit]');
  const frame = portrait?.querySelector('[data-portrait-reveal]');
  const image = portrait?.querySelector('.portrait-color');
  const stageLayers = [...document.querySelectorAll('#anatomy-canvas, .skeleton-fallback')];
  if (!layout || !portrait || !frame || !image) return;

  const foreground = document.createElement('div');
  foreground.className = 'about-foreground';
  layout.replaceWith(foreground);
  foreground.append(layout);

  // The contours are positioned for the actual profile photo, rather than a
  // stock head graphic. They are only an artistic imaging overlay.
  const mesh = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  mesh.setAttribute('class', 'face-mesh');
  mesh.setAttribute('viewBox', '0 0 300 400');
  mesh.setAttribute('preserveAspectRatio', 'none');
  mesh.setAttribute('aria-hidden', 'true');
  const lines = [];
  for (let i = -6; i <= 6; i++) {
    const y = 193 + i * 5.2;
    const width = 24 * Math.sqrt(Math.max(0, 1 - (i / 7) ** 2));
    lines.push(`M ${150 - width} ${y} Q 150 ${y + 3} ${150 + width} ${y}`);
  }
  for (let i = -8; i <= 8; i++) {
    const y = 196 + i * 5;
    const width = 34 * Math.sqrt(Math.max(0, 1 - (i / 9) ** 2));
    lines.push(`M ${151 - width} ${y} Q 151 ${y - 4} ${151 + width} ${y}`);
  }
  for (let i = -7; i <= 7; i++) {
    const x = 151 + i * 4.4;
    const height = 41 * Math.sqrt(Math.max(0, 1 - (i / 8) ** 2));
    lines.push(`M ${x} ${197 - height} Q ${x + 6} 197 ${x} ${197 + height}`);
  }
  for (let i = -6; i <= 6; i++) {
    const x = 150 + i * 3.6;
    const height = 35 * Math.sqrt(Math.max(0, 1 - (i / 7) ** 2));
    lines.push(`M ${x} ${194 - height} Q ${x - 3} 194 ${x} ${194 + height}`);
  }
  lines.push('M 118 189 Q 117 146 151 157 Q 181 153 184 191',
    'M 119 191 Q 111 231 130 238 M 183 192 Q 193 233 172 238',
    'M 129 224 Q 105 233 101 280 M 173 224 Q 199 234 201 280');
  mesh.innerHTML = lines.map(d => `<path d="${d}"/>`).join('');
  frame.append(mesh);

  // The SVG paths are the same ones already used for the ECG–Addy–ECG mark.
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
  const lengths = paths.map(p => p.getTotalLength());
  const totalLength = lengths.reduce((a, b) => a + b, 0);

  let generation = 0;
  let active = false;
  let motionPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scheduled = 0;
  let cameraAnimation = null;
  let stageAnimations = [];

  function finalize() {
    generation++;
    cameraAnimation?.cancel();
    stageAnimations.forEach(animation => animation.cancel());
    cameraAnimation = null;
    stageAnimations = [];
    foreground.style.transform = '';
    about.classList.remove('is-copy-hidden', 'about-playing');
    frame.classList.remove('scan-prepared', 'scan-active');
    frame.classList.add('scan-done');
    frame.style.setProperty('--scan', '100%');
    portrait.classList.add('has-signature');
    sign.style.opacity = '1';
    paths.forEach(path => { path.style.strokeDasharray = ''; path.style.strokeDashoffset = '0'; });
    pen.style.opacity = '0';
  }

  function prepare() {
    // Never leave stale ancestor opacity or a previously clipped photo behind.
    frame.classList.remove('scan-done', 'scan-active');
    frame.classList.add('scan-prepared');
    frame.style.setProperty('--scan', '0%');
    portrait.classList.remove('has-signature');
    sign.style.opacity = '0';
    paths.forEach((path, i) => {
      path.style.strokeDasharray = String(lengths[i]);
      path.style.strokeDashoffset = String(lengths[i]);
    });
    pen.style.opacity = '0';
    about.classList.add('is-copy-hidden', 'about-playing');
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  function penAt(path, distance) {
    const point = path.getPointAtLength(distance);
    const parent = portrait.getBoundingClientRect();
    const rect = sign.getBoundingClientRect();
    pen.style.left = `${(rect.left - parent.left + point.x * rect.width / 360) / (parent.width / portrait.offsetWidth)}px`;
    pen.style.top = `${(rect.top - parent.top + point.y * rect.height / 62) / (parent.height / portrait.offsetHeight)}px`;
    pen.style.opacity = '1';
  }

  function drawSignature(run) {
    return new Promise(resolve => {
      const begun = performance.now();
      function step(now) {
        if (run !== generation) return resolve();
        let remaining = Math.min(1, (now - begun) / 1700) * totalLength;
        let tip = null;
        paths.forEach((path, i) => {
          const drawn = Math.min(lengths[i], Math.max(0, remaining));
          path.style.strokeDashoffset = String(lengths[i] - drawn);
          if (drawn > 0 && remaining <= lengths[i] && !tip) tip = [path, drawn];
          remaining -= lengths[i];
        });
        if (tip) penAt(...tip);
        if (now - begun < 1700) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  async function play(force = false) {
    if (!active && !force) return;
    finalize();
    if (motionPaused || !image.naturalWidth) return;
    const run = generation;
    prepare();
    try {
      // Keep the skeleton's original right-to-center motion ahead of the camera.
      await sleep(360);
      if (run !== generation) return;
      const area = scrollArea.getBoundingClientRect();
      const target = portrait.getBoundingClientRect();
      const front = foreground.getBoundingClientRect();
      const scale = Math.min(1.85, (area.height - 32) / Math.max(1, target.height));
      const focusX = target.left + target.width / 2;
      const focusY = target.top + target.height / 2;
      const destX = area.left + area.width * .73;
      const destY = area.top + area.height * .51;
      const tx = destX - front.left - scale * (focusX - front.left);
      const ty = destY - front.top - scale * (focusY - front.top);
      const cameraEnd = `translate(${tx}px, ${ty}px) scale(${scale})`;
      foreground.style.transformOrigin = '0 0';
      cameraAnimation = foreground.animate([
        { transform: 'translate(0px, 0px) scale(1)' },
        { transform: cameraEnd }
      ], { duration: 1000, easing: 'cubic-bezier(.22,.65,.2,1)', fill: 'forwards' });
      stageAnimations = stageLayers.map(stage => {
        const stageRect = stage.getBoundingClientRect();
        stage.style.transformOrigin = '0 0';
        return stage.animate([
          { transform: 'translate(0px, 0px) scale(1)' },
          { transform: `translate(${tx + (1 - scale) * (front.left - stageRect.left)}px, ${ty + (1 - scale) * (front.top - stageRect.top)}px) scale(${scale})` }
        ], { duration: 1000, easing: 'cubic-bezier(.22,.65,.2,1)', fill: 'forwards' });
      });
      await cameraAnimation.finished;
      if (run !== generation) return;
      frame.classList.add('scan-active');
      const scanStart = performance.now();
      await new Promise(resolve => {
        function scan(now) {
          if (run !== generation) return resolve();
          const progress = Math.min(1, (now - scanStart) / 2600);
          frame.style.setProperty('--scan', `${progress * 100}%`);
          if (progress < 1) requestAnimationFrame(scan);
          else resolve();
        }
        requestAnimationFrame(scan);
      });
      if (run !== generation) return;
      frame.classList.add('scan-done');
      frame.classList.remove('scan-active', 'scan-prepared');
      portrait.classList.add('has-signature');
      sign.style.opacity = '1';
      await drawSignature(run);
      if (run !== generation) return;
      pen.style.opacity = '0';
      await sleep(280);
      if (run !== generation) return;
      cameraAnimation.reverse();
      stageAnimations.forEach(animation => animation.reverse());
      await cameraAnimation.finished;
      if (run !== generation) return;
      finalize();
    } catch (error) {
      if (run === generation) {
        console.error('About animation recovered:', error);
        finalize();
      }
    }
  }

  function isAboutActive() {
    const area = scrollArea.getBoundingClientRect();
    const rect = about.getBoundingClientRect();
    return rect.top - area.top < area.height * .17 && rect.top - area.top > -area.height * .18;
  }
  function check() {
    scheduled = 0;
    const isHere = isAboutActive();
    if (isHere && !active) { active = true; play(); }
    else if (!isHere && active) { active = false; finalize(); }
  }
  function queue() { if (!scheduled) scheduled = requestAnimationFrame(check); }
  scrollArea.addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  nav.querySelector('a[href="#about"]')?.addEventListener('click', () => {
    if (isAboutActive()) { active = true; play(true); }
  });
  addEventListener('anatomy-motion-paused', event => {
    motionPaused = !!event.detail;
    if (motionPaused) finalize();
  });
  image.addEventListener('load', () => { if (active && !motionPaused) play(true); }, { once: true });
  frame.classList.add('scan-done');
  portrait.classList.add('has-signature');
  check();
}
