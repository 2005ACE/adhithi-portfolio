import './styles.css';
import { portfolio as data } from './content.js';

const { person }=data;
const chips=(items)=>items.slice(0,5).map((item)=>`<span>${item}</span>`).join('');

document.querySelector('#app').innerHTML=`
<header class="topbar" data-header>
  <a class="wordmark" href="#home" aria-label="Addy, back to top">Addy.</a>
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
        <h1 id="hero-title">Somewhere between a stethoscope and a line of code is where my curiosity lives.</h1>
        <p class="hero-copy">I’m ${person.name}—most people call me Addy. I build across AI, data, software, and physical devices, especially when the problem lives in healthcare.</p>
        <div class="actions"><a class="button primary" href="#projects">Explore my work <span>↓</span></a><a class="button secondary" href="${person.resume}" target="_blank" rel="noopener">View résumé <span>↗</span></a></div>
        <div class="social-inline"><a href="${person.github}" target="_blank" rel="noopener">GitHub ↗</a><a href="${person.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a></div>
      </section>

      <section class="panel" id="about" data-view="chest" aria-labelledby="about-title">
        <header class="section-head"><p>About</p><h2 id="about-title">Under the Skin</h2></header>
        <div class="prose"><p>I’m interested in the thread connecting healthcare, software, AI, data, and physical devices. I like moving between levels—from a signal on a board, to a pipeline, to a model, to the person who ultimately depends on the system making sense.</p><p>I’m ambitious about building useful things and approachable about the process. The work I enjoy most is technical, collaborative, and grounded in a real human problem.</p></div>
      </section>

      <section class="panel" id="skills" data-view="neural" aria-labelledby="skills-title">
        <header class="section-head"><p>Skills</p><h2 id="skills-title">The Nervous System</h2></header>
        <div class="skill-list">${data.skills.map((group)=>`<article><h3>${group.title}</h3><p>${group.items.join(' · ')}</p></article>`).join('')}</div>
      </section>

      <section class="panel" id="projects" data-view="hand" aria-labelledby="projects-title">
        <header class="section-head"><p>Projects</p><h2 id="projects-title">Anatomy of a Build</h2></header>
        <div class="project-stack">${data.projects.map((project)=>`
          <article class="project">
            <div class="project-copy"><p class="project-type">${project.type}</p><h3>${project.name}</h3><p>${project.summary}</p><div class="chip-row">${chips(project.tools)}</div></div>
            <div class="project-visual visual-${project.index}" role="img" aria-label="Conceptual illustration for ${project.name}; not measured project data"><span class="concept-label">Conceptual illustration</span><div class="visual-art" aria-hidden="true"></div></div>
            <details><summary>Examine the build <span>+</span></summary><div class="case-study"><div><h4>The Diagnosis</h4><p>${project.diagnosis}</p></div><div><h4>The Procedure</h4><p>${project.procedure}</p></div><div><h4>The Findings</h4><p>${project.findings}</p></div></div></details>
          </article>`).join('')}</div>
      </section>

      <section class="panel" id="experience" data-view="spine" aria-labelledby="experience-title">
        <header class="section-head"><p>Experience</p><h2 id="experience-title">Clinical History</h2></header>
        <div class="timeline">${data.experience.map((item)=>`<article><time>${item.date}</time><div><p>${item.org}</p><h3>${item.role}</h3><div>${item.body}</div></div></article>`).join('')}</div>
      </section>

      <section class="panel" id="research" data-view="skull" aria-labelledby="research-title">
        <header class="section-head"><p>Research</p><h2 id="research-title">Under the Microscope</h2></header>
        <div class="research-list">${data.research.map((item)=>`<article><h3>${item.title}</h3><dl><div><dt>Question</dt><dd>${item.question}</dd></div><div><dt>Contribution</dt><dd>${item.role}</dd></div><div><dt>Methods</dt><dd>${item.methods}</dd></div><div><dt>Output</dt><dd>${item.output}</dd></div></dl></article>`).join('')}</div>
      </section>

      <section class="panel contact-panel" id="contact" data-view="contact" aria-labelledby="contact-title">
        <header class="section-head"><p>Contact</p><h2 id="contact-title">Let’s Synapse</h2></header>
        <p class="contact-line">Have something in mind? I’d love to hear it.</p>
        <div class="contact-actions"><a class="button primary" href="mailto:${person.email}">Say hello <span>↗</span></a><button class="button secondary copy-email" type="button" data-email="${person.email}">Copy email</button><span class="copy-status" role="status" aria-live="polite"></span></div>
        <div class="contact-links"><a href="${person.github}" target="_blank" rel="noopener">GitHub ↗</a><a href="${person.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a></div>
      </section>
    </div>

    <aside class="anatomy-stage" aria-label="Animated anatomical skeleton">
      <div class="stage-frame"><canvas id="anatomy-canvas"></canvas><img class="skeleton-fallback" src="/images/skeleton-fallback.png" alt=""/><div class="stage-grid" aria-hidden="true"></div><div class="region-annotation" aria-hidden="true"><i></i><span data-region>Complete figure</span></div><div class="load-status" aria-live="polite">Loading anatomy…</div><button class="motion-toggle" type="button" aria-pressed="false"><span class="motion-dot"></span><span data-motion-label>Pause motion</span></button><a class="model-credit" href="https://github.com/yamz8/human-body-simulator" target="_blank" rel="noopener">Open3Dmodel · CC BY-SA 4.0 ↗</a></div>
    </aside>
  </div>
</main>
<footer><span>© ${new Date().getFullYear()} ${person.name}</span><span>Designed with a little backbone.</span><a href="#home">Back to top ↑</a></footer>`;

const header=document.querySelector('[data-header]');
const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('#nav');
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));toggle.querySelector('.sr-only').textContent=open?'Open menu':'Close menu';nav.classList.toggle('open',!open)});
nav.querySelectorAll('a').forEach((link)=>link.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));
document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus()}});
document.querySelectorAll('details').forEach((detail)=>detail.addEventListener('toggle',()=>{detail.querySelector('summary span').textContent=detail.open?'−':'+'}));

const copyButton=document.querySelector('.copy-email');
copyButton.addEventListener('click',async()=>{const status=document.querySelector('.copy-status');try{await navigator.clipboard.writeText(copyButton.dataset.email);status.textContent='Email copied';copyButton.textContent='Copied'}catch{status.textContent=`Email: ${copyButton.dataset.email}`}setTimeout(()=>{status.textContent='';copyButton.textContent='Copy email'},2200)});

const sections=[...document.querySelectorAll('[data-view]')];
const navLinks=[...nav.querySelectorAll('a[href^="#"]')];
let activeView='full';let ticking=false;
function setActiveSection(){
  const marker=innerHeight*.42;let active=sections[0];
  for(const section of sections){if(section.getBoundingClientRect().top<=marker)active=section;else break}
  const view=active.dataset.view;
  if(view!==activeView){activeView=view;document.body.dataset.view=view;window.dispatchEvent(new CustomEvent('anatomy-view',{detail:view}))}
  navLinks.forEach((link)=>{const current=link.getAttribute('href')===`#${active.id}`;link.classList.toggle('active',current);if(current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
  header.classList.toggle('scrolled',scrollY>16);ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(setActiveSection);ticking=true}},{passive:true});
addEventListener('resize',setActiveSection);setActiveSection();

const stage=document.querySelector('.anatomy-stage');const pageGrid=document.querySelector('.page-grid');const hero=document.querySelector('.hero');
const mobile=matchMedia('(max-width: 760px)');
function placeStage(event){if(event.matches)hero.append(stage);else pageGrid.append(stage)}
placeStage(mobile);mobile.addEventListener('change',placeStage);

const loadAnatomy=()=>import('./scene.js').then(({initAnatomyStage})=>initAnatomyStage()).catch(()=>{document.documentElement.classList.add('no-webgl');const status=document.querySelector('.load-status');if(status)status.textContent='Static anatomy'});
if('requestIdleCallback' in window)requestIdleCallback(loadAnatomy,{timeout:900});else setTimeout(loadAnatomy,60);
