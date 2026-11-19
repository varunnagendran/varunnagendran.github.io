// Start at the top on reload instead of where you last were.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// Someone opened a shared link like .../#sign: jump straight to that section.
if (location.hash) {
  var linked = document.getElementById(location.hash.slice(1));
  if (linked) {
    window.addEventListener('load', function () {
      linked.scrollIntoView({ behavior: 'instant' });
    });
  }
}

// In-page links (nav, "Watch the film", etc.) scroll smoothly without
// adding #section to the address, so a reload starts at the top.
// A shared link like .../#sign still opens at that section.
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    var id = link.getAttribute('href').slice(1);
    var target = id === 'top' ? null : document.getElementById(id);
    if (id !== 'top' && !target) return;
    e.preventDefault();
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  });
});

// Nav: light up the link for whichever section is at the top of the screen.
(function () {
  var header = document.querySelector('.site-header');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var linkFor = {};
  links.forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'))
    .filter(function (s) { return linkFor[s.id]; });
  var current;

  function update() {
    var line = header.getBoundingClientRect().bottom + 24;
    var active = null;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= line) active = s.id;
    });
    // At the very bottom the last section can't reach the top, so pick it anyway.
    var doc = document.documentElement;
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
      active = sections[sections.length - 1].id;
    }
    if (active === current) return;
    current = active;

    links.forEach(function (a) {
      var on = a === linkFor[active];
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });

    // On phones the links scroll sideways: keep the active one in view.
    var a = linkFor[active];
    var row = a && a.parentNode;
    if (row && row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: a.offsetLeft - (row.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
    }
  }

  // update() only measures six sections, so it's cheap enough to run on every scroll event.
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
