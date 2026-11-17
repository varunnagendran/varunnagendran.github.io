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
