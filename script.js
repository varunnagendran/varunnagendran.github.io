// Start/Sit buttons on the hero card: highlight the chosen call
// and show the matching verdict line.
document.querySelectorAll('.call-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var call = btn.dataset.call;
    document.querySelectorAll('.call-btn').forEach(function (b) {
      var on = b.dataset.call === call;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    document.querySelectorAll('[data-verdict]').forEach(function (el) {
      el.hidden = el.dataset.verdict !== call;
    });
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
