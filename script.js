const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.querySelector('.sr-only').textContent = open ? 'Open navigation' : 'Close navigation';
  nav?.classList.toggle('open', !open);
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { menuButton?.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && nav?.classList.contains('open')) { nav.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.focus(); } });
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const items = document.querySelectorAll('.reveal');
if (reduced || !('IntersectionObserver' in window)) items.forEach((item) => item.classList.add('is-visible'));
else { const observer = new IntersectionObserver((entries, current) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); current.unobserve(entry.target); } }), { threshold: .12, rootMargin: '0px 0px -35px' }); items.forEach((item) => observer.observe(item)); }
const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();
