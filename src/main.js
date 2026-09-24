import './styles.css';
import { portfolio as data } from './content.js';

const { person }=data;
const chips=(items)=>items.map((item)=>`<span>${item}</span>`).join('');

document.querySelector('#app').innerHTML=`
<header class="topbar" data-header>
  <a class="wordmark" href="#home" aria-label="Addy, home"><span>A/M</span><b>Addy</b></a>
  <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav"><span class="sr-only">Open menu</span><i></i><i></i></button>
  <nav id="nav" aria-label="Primary navigation">
    <a href="#about">About</a><a href="#skills">Skills</a><a href="#projects">Projects</a><a href="#experience">Experience</a><a href="#research">Research</a><a href="#contact">Contact</a>
  </nav>
  <a class="resume-link" href="${person.resume}" target="_blank" rel="noopener">Résumé <span>↗</span></a>
</header>

<main id="main">
  <div class="page-grid">
    <div class="story-column">
      <section class="panel hero" id="home" data-view="full" aria-labelledby="hero-title">
        <div class="coordinate" aria-hidden="true">01 — 27.9506° N / 82.4572° W</div>
        <p class="kicker">${person.name} · Healthcare × Engineering</p>
        <h1 id="hero-title">Somewhere between a <em>stethoscope</em> and a line of code is where my curiosity lives.</h1>
        <p class="hero-copy">I’m ${person.nickname}. I build across AI, data, software, and physical devices—especially when the problem lives in healthcare and matters beyond a screen.</p>
        <div class="actions"><a class="button primary" href="#projects">Explore my work <span>↓</span></a><a class="button secondary" href="${person.resume}" target="_blank" rel="noopener">View résumé <span>↗</span></a></div>
        <div class="social-inline"><a href="${person.github}" target="_blank" rel="noopener">GitHub ↗</a><a href="${person.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a></div>
        <dl class="identity-strip"><div><dt>Based at</dt><dd>${person.school}</dd></div><div><dt>Studying</dt><dd>${person.degree}</dd></div><div><dt>Graduating</dt><dd>${person.graduation}</dd></div></dl>
      </section>

      <section class="panel" id="about" data-view="chest" aria-labelledby="about-title">
        <header class="section-head"><p class="section-number">02 / ABOUT ME</p><h2 id="about-title">Under the Skin</h2><p>About me</p></header>
        <div class="prose large"><p>I’m curious about the thread connecting software, data, physical devices, and human problems. Healthcare keeps pulling those threads into the same room.</p><p>I like work that asks me to move between levels: from a signal on a board, to a pipeline, to a model, to the person who ultimately depends on the system making sense.</p><p>I’m ambitious about building useful things, but approachable about the process. Good engineering is rigorous. It can still leave room to ask the slightly weird question that unlocks a better answer.</p></div>
        <aside class="annotation"><span>FIELD NOTE / 02</span><p>Current interests: trustworthy AI, multimodal health data, medical simulation, and where economics meets care.</p></aside>
      </section>

      <section class="panel" id="skills" data-view="neural" aria-labelledby="skills-title">
        <header class="section-head"><p class="section-number">03 / SKILLS & TOOLS</p><h2 id="skills-title">The Nervous System</h2><p>Skills & tools</p></header>
        <div class="neural-map" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="skill-list">${data.skills.map((group,index)=>`<article><span>0${index+1}</span><div><h3>${group.title}</h3><p>${group.items.join(' · ')}</p></div></article>`).join('')}</div>
        <p class="plain-note">Tools I’ve used in coursework, research, internships, and projects. No proficiency meters—just the working vocabulary.</p>
      </section>

      <section class="panel projects-panel" id="projects" data-view="hand" aria-labelledby="projects-title">
        <header class="section-head"><p class="section-number">04 / SELECTED PROJECTS</p><h2 id="projects-title">Anatomy of a Build</h2><p>Selected projects</p></header>
        <p class="section-intro">Three investigations into evidence, public health data, and explainable prediction. They are student projects—not clinically validated products.</p>
        <div class="project-stack">${data.projects.map((project)=>`
          <article class="project">
            <div class="project-index">${project.index}</div><p class="project-type">${project.type}</p><h3>${project.name}</h3><p class="project-summary">${project.summary}</p>
            <div class="project-diagram diagram-${project.index}" aria-hidden="true"><span></span><span></span><span></span><span></span><i></i></div>
            <details><summary>Examine the build <span>+</span></summary><div class="case-study"><div><h4>The Diagnosis</h4><p>${project.diagnosis}</p></div><div><h4>The Procedure</h4><p>${project.procedure}</p></div><div><h4>The Findings</h4><p>${project.findings}</p></div></div></details>
            <div class="chip-row">${chips(project.tools)}</div><p class="pending">Repository and screenshots pending confirmation.</p>
          </article>`).join('')}</div>
      </section>

      <section class="panel" id="experience" data-view="spine" aria-labelledby="experience-title">
        <header class="section-head"><p class="section-number">05 / EXPERIENCE</p><h2 id="experience-title">Clinical History</h2><p>Engineering, research & leadership</p></header>
        <div class="timeline">${data.experience.map((item)=>`<article><div class="timeline-marker" aria-hidden="true"><i></i></div><div class="timeline-date">${item.date}</div><div class="timeline-copy"><p>${item.org}</p><h3>${item.role}</h3><div>${item.body}</div></div></article>`).join('')}</div>
      </section>

      <section class="panel" id="research" data-view="skull" aria-labelledby="research-title">
        <header class="section-head"><p class="section-number">06 / RESEARCH</p><h2 id="research-title">Under the Microscope</h2><p>Research questions & methods</p></header>
        <div class="research-list">${data.research.map((item)=>`<article><div class="research-code">${item.code}</div><h3>${item.title}</h3><dl><div><dt>The question</dt><dd>${item.question}</dd></div><div><dt>My role</dt><dd>${item.role}</dd></div><div><dt>Methods</dt><dd>${item.methods}</dd></div><div><dt>Confirmed output</dt><dd>${item.output}</dd></div></dl></article>`).join('')}</div>
      </section>

      <section class="panel contact-panel" id="contact" data-view="contact" aria-labelledby="contact-title">
        <header class="section-head"><p class="section-number">07 / CONTACT</p><h2 id="contact-title">Let’s Synapse</h2><p>Contact</p></header>
        <p class="contact-line">Good things happen when curious minds connect.</p>
        <p>I’m interested in AI/ML, software engineering, and data engineering opportunities—especially in healthcare, biotech, and medtech.</p>
        <a class="email" href="mailto:${person.email}">${person.email}<span>↗</span></a>
        <div class="contact-links"><a href="${person.linkedin}" target="_blank" rel="noopener"><span>LinkedIn</span><b>Connect ↗</b></a><a href="${person.github}" target="_blank" rel="noopener"><span>GitHub</span><b>@2005ACE ↗</b></a><a href="${person.resume}" target="_blank" rel="noopener"><span>Résumé</span><b>View PDF ↗</b></a></div>
        <div class="synapse" aria-hidden="true"><i></i><i></i><span></span></div>
      </section>
    </div>

    <aside class="anatomy-stage" aria-label="Decorative interactive anatomical skeleton">
      <div class="stage-frame"><canvas id="anatomy-canvas"></canvas><img class="skeleton-fallback" src="/images/skeleton-fallback.png" alt=""/><div class="stage-grid" aria-hidden="true"></div><div class="focus-reticle" aria-hidden="true"></div><div class="stage-label"><span>FIG. 01 / VISUAL METAPHOR</span><b data-region>FULL ANATOMY</b></div><div class="load-status" aria-live="polite">Loading anatomy…</div><button class="motion-toggle" type="button" aria-pressed="false"><span class="motion-dot"></span><span data-motion-label>Pause motion</span></button><a class="model-credit" href="https://github.com/yamz8/human-body-simulator" target="_blank" rel="noopener">Model: Open3Dmodel · CC BY-SA 4.0 ↗</a></div>
    </aside>
  </div>
</main>
<footer><span>© ${new Date().getFullYear()} ${person.name}</span><span>Designed with a little backbone.</span><a href="#home">Back to top ↑</a></footer>`;

const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('nav');
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));toggle.querySelector('.sr-only').textContent=open?'Open menu':'Close menu';nav.classList.toggle('open',!open)});
nav.querySelectorAll('a').forEach((link)=>link.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));
document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus()}});
window.addEventListener('scroll',()=>document.querySelector('[data-header]').classList.toggle('scrolled',scrollY>20),{passive:true});

document.querySelectorAll('details').forEach((detail)=>detail.addEventListener('toggle',()=>{detail.querySelector('summary span').textContent=detail.open?'−':'+'}));

const sections=[...document.querySelectorAll('[data-view]')];
const observer=new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting){document.body.dataset.view=entry.target.dataset.view;window.dispatchEvent(new CustomEvent('anatomy-view',{detail:entry.target.dataset.view}))}})},{rootMargin:'-35% 0px -45% 0px'});
sections.forEach((section)=>observer.observe(section));

const loadAnatomy=()=>import('./scene.js').then(({initAnatomyStage})=>initAnatomyStage()).catch(()=>{document.documentElement.classList.add('no-webgl');const status=document.querySelector('.load-status');if(status)status.textContent='Static anatomy'});
if('requestIdleCallback' in window) requestIdleCallback(loadAnatomy,{timeout:1200});
else setTimeout(loadAnatomy,80);
