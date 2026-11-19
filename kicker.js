// Field goal mini-game on the hero card.
// Pull back from anywhere on the field and let go to kick. Make it and new
// uprights appear; miss and you re-kick the same ones. Reset clears the score.
//
// The scene is a simple 3D world in yards, seen from behind the kicker:
//   x = left/right, z = distance downfield from the ball, y = height.
// Everything (field lines, uprights, ball) goes through the same project(),
// so what you see matches whether the kick is scored good.
(function () {
  var card = document.querySelector('.kick-card');
  if (!card) return;

  var canvas = card.querySelector('.kick-canvas');
  var ctx = canvas.getContext('2d');
  var out = {
    distance: card.querySelector('[data-kick-distance]'),
    made: card.querySelector('[data-kick-made]'),
    streak: card.querySelector('[data-kick-streak]'),
    best: card.querySelector('[data-kick-best]')
  };

  // Colors come from the CSS tokens in :root so the theme lives in one place.
  var css = getComputedStyle(document.documentElement);
  var C = {
    accent: css.getPropertyValue('--accent').trim() || '#C8F031',
    text: css.getPropertyValue('--text').trim() || '#EDEFEC',
    muted: css.getPropertyValue('--muted').trim() || '#A2ABA5',
    subtle: css.getPropertyValue('--subtle').trim() || '#86908A',
    border: css.getPropertyValue('--border').trim() || '#1F2622',
    strong: css.getPropertyValue('--border-strong').trim() || '#34403A',
    bg: css.getPropertyValue('--bg').trim() || '#0A0C0B'
  };

  // Real field goal sizes, in yards.
  var CROSSBAR = 10 / 3;     // 10 ft
  var HALF_GAP = 18.5 / 6;   // 18.5 ft between the uprights
  var POST_TOP = CROSSBAR + 5;
  var CAM_BACK = 10;         // camera sits this far behind the ball
  var CAM_HEIGHT = 2;
  var GRAVITY = 32;          // yd/s^2
  var LAUNCH = 30 * Math.PI / 180;
  var V_MIN = 23, V_MAX = 52; // ball speed at 0% and 100% power
  var MAX_PULL = 140;        // px of pull for full power
  var TIME_SCALE = 1.5;      // flight plays a little faster than real time

  var W = 0, H = 0, horizon = 0, groundY = 0, focal = 0;
  var state = {
    made: 0, streak: 0, best: readBest(),
    goal: { z: 30, x: 0 },
    pull: null,              // { dx, dy } while aiming
    ball: null,              // flight in progress
    result: null,            // { good, until }
    kicked: false            // hide the hint after the first kick
  };
  var keyAim = { dx: 0, dy: 70 }; // keyboard aiming, same shape as a pull
  var dragStart = null;
  var raf = 0;

  function readBest() {
    try { return parseInt(localStorage.getItem('kick-best'), 10) || 0; } catch (e) { return 0; }
  }
  function saveBest() {
    try { localStorage.setItem('kick-best', String(state.best)); } catch (e) {}
  }

  // ---------- Projection ----------
  function project(x, z, y) {
    var depth = CAM_BACK + z;
    return {
      x: W / 2 + x * focal / depth,
      y: horizon + (CAM_HEIGHT - y) * focal / depth,
      s: focal / depth          // px per yard at this depth
    };
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    horizon = H * 0.5;
    groundY = H - 30;
    focal = (groundY - horizon) * CAM_BACK / CAM_HEIGHT;
    draw();
  }

  // ---------- Game flow ----------
  function newGoal(first) {
    // Kicks get a bit longer as the streak grows.
    var lo = first ? 25 : 20 + Math.min(state.streak * 2, 15);
    var hi = first ? 30 : 38 + Math.min(state.streak * 2, 17);
    var z = Math.round(lo + Math.random() * (hi - lo));
    // Keep the uprights on screen: pick a screen offset, convert to yards.
    var halfPx = HALF_GAP * focal / (CAM_BACK + z);
    var room = Math.max(0, W / 2 - halfPx - 18);
    var offPx = first ? 0 : (Math.random() * 2 - 1) * room * 0.85;
    state.goal = { z: z, x: offPx * (CAM_BACK + z) / focal };
    out.distance.textContent = z + ' yd';
  }

  function updateScore() {
    out.made.textContent = state.made;
    out.streak.textContent = state.streak;
    out.best.textContent = state.best;
  }

  // Turn a pull (pointer moved by dx, dy from where it started) into a kick.
  function aimFrom(pull) {
    if (pull.dy < 12) return null;          // must pull back (down)
    var len = Math.min(Math.hypot(pull.dx, pull.dy), MAX_PULL);
    var power = len / MAX_PULL;
    // The kick travels in the opposite direction of the pull. On screen the
    // ground path is a straight line from the ball to the horizon, so the
    // sideways slope maps straight to a sideways ratio in the world.
    var ratio = (-pull.dx / pull.dy) * (groundY - horizon) / focal;
    ratio = Math.max(-0.35, Math.min(0.35, ratio));
    return { power: power, ratio: ratio, len: len };
  }

  function kick(pull) {
    var aim = aimFrom(pull);
    if (!aim || aim.power < 0.12) return false;
    var v = V_MIN + aim.power * (V_MAX - V_MIN);
    var vz = v * Math.cos(LAUNCH);
    state.ball = {
      t: 0, vz: vz, vx: vz * aim.ratio, vy: v * Math.sin(LAUNCH),
      judged: false, good: false, last: performance.now()
    };
    state.kicked = true;
    state.result = null;
    loop();
    return true;
  }

  function judge(good) {
    var b = state.ball;
    b.judged = true;
    b.good = good;
    if (good) {
      state.made++;
      state.streak++;
      if (state.streak > state.best) { state.best = state.streak; saveBest(); }
    } else {
      state.streak = 0;
    }
    updateScore();
  }

  function finishKick() {
    var good = state.ball.good;
    state.result = { good: good, until: performance.now() + 1000 };
    state.ball = null;
    setTimeout(function () {
      if (good) newGoal(false);
      state.result = null;
      draw();
    }, 1000);
  }

  function step(now) {
    var b = state.ball;
    if (b) {
      var dt = Math.min((now - b.last) / 1000, 0.05) * TIME_SCALE;
      b.last = now;
      var prevZ = b.vz * b.t;
      b.t += dt;
      var z = b.vz * b.t;
      // Score it the moment the ball crosses the plane of the uprights.
      if (!b.judged && prevZ < state.goal.z && z >= state.goal.z) {
        var tc = state.goal.z / b.vz;
        var y = b.vy * tc - GRAVITY * tc * tc / 2;
        var x = b.vx * tc;
        judge(y > CROSSBAR && Math.abs(x - state.goal.x) < HALF_GAP - 0.15);
      }
      var yNow = b.vy * b.t - GRAVITY * b.t * b.t / 2;
      if (yNow < 0 || z > state.goal.z + 12) {
        if (!b.judged) judge(false);  // fell short
        finishKick();
      }
    }
  }

  function loop() {
    if (raf) return;
    raf = requestAnimationFrame(function tick(now) {
      raf = 0;
      step(now);
      draw();
      if (state.ball || state.pull) loop();
    });
  }

  // ---------- Drawing ----------
  function line(a, b) {
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }

  function drawField() {
    ctx.clearRect(0, 0, W, H);
    // Ground below the horizon, a touch lighter than the card.
    var g = ctx.createLinearGradient(0, horizon, 0, H);
    g.addColorStop(0, 'rgba(200, 240, 49, 0.015)');
    g.addColorStop(1, 'rgba(200, 240, 49, 0.06)');
    ctx.fillStyle = g;
    ctx.fillRect(0, horizon, W, H - horizon);

    // Yard lines every 5 yards, hash marks every yard.
    ctx.lineWidth = 1;
    for (var z = 0; z <= 90; z += 1) {
      var l = project(-60, z, 0), r = project(60, z, 0);
      // Stop once lines would bunch up into a solid band near the horizon.
      if (l.y - project(0, z + 5, 0).y < 4) break;
      if (z % 5 === 0) {
        ctx.strokeStyle = z % 10 === 0 ? C.strong : C.border;
        line(l, r);
      } else {
        ctx.strokeStyle = C.border;
        var hl = project(-3.1, z, 0), hr = project(3.1, z, 0);
        line(project(-3.6, z, 0), hl);
        line(hr, project(3.6, z, 0));
      }
    }
    ctx.strokeStyle = C.strong;
    line({ x: 0, y: horizon }, { x: W, y: horizon });
  }

  function drawGoal() {
    var gz = state.goal.z, gx = state.goal.x;
    var base = project(gx, gz, 0);
    var barL = project(gx - HALF_GAP, gz, CROSSBAR);
    var barR = project(gx + HALF_GAP, gz, CROSSBAR);
    var topL = project(gx - HALF_GAP, gz, POST_TOP);
    var topR = project(gx + HALF_GAP, gz, POST_TOP);
    var mid = project(gx, gz, CROSSBAR);
    // Shadow on the ground
    ctx.strokeStyle = 'rgba(200, 240, 49, 0.15)';
    ctx.lineWidth = 1;
    line(project(gx - HALF_GAP, gz, 0), project(gx + HALF_GAP, gz, 0));
    ctx.strokeStyle = C.accent;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(2, base.s * 0.18);
    line(base, mid);          // centre post
    ctx.lineWidth = Math.max(2, base.s * 0.14);
    line(barL, barR);         // crossbar
    line(barL, topL);         // uprights
    line(barR, topR);
    ctx.lineCap = 'butt';
  }

  function drawBall(x, z, y, spin) {
    var p = project(x, z, y);
    var shadow = project(x, z, 0);
    var rx = Math.max(2, 0.3 * p.s), ry = Math.max(1.4, 0.19 * p.s);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(shadow.x, shadow.y, rx * 0.9, ry * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(spin);
    ctx.fillStyle = C.text;
    ctx.beginPath();
    ctx.ellipse(0, 0, ry, rx, 0, 0, Math.PI * 2);
    ctx.fill();
    // Laces
    ctx.strokeStyle = C.bg;
    ctx.lineWidth = Math.max(1, rx * 0.12);
    ctx.beginPath(); ctx.moveTo(0, -rx * 0.4); ctx.lineTo(0, rx * 0.4); ctx.stroke();
    for (var i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-ry * 0.3, i * rx * 0.2); ctx.lineTo(ry * 0.3, i * rx * 0.2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTee() {
    var a = project(-0.25, 0, 0), b = project(0.25, 0, 0);
    ctx.fillStyle = C.strong;
    ctx.fillRect(a.x, a.y - 3, b.x - a.x, 4);
  }

  function drawAim(pull) {
    var aim = aimFrom(pull);
    var ball = project(0, 0, 0.22);
    if (!aim) return;
    // Dotted guide in the kick direction; longer means more power.
    var dirX = -pull.dx, dirY = -pull.dy;
    var d = Math.hypot(dirX, dirY);
    var reach = 40 + aim.power * (groundY - horizon) * 0.9;
    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    line(ball, { x: ball.x + dirX / d * reach, y: ball.y + dirY / d * reach });
    ctx.setLineDash([]);
    // Power readout under the ball
    ctx.fillStyle = C.subtle;
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('PWR ' + Math.round(aim.power * 100) + '%', W - 12, H - 10);
  }

  function drawText() {
    ctx.textAlign = 'center';
    if (state.result) {
      ctx.fillStyle = state.result.good ? C.accent : C.muted;
      ctx.font = '800 44px "Barlow Condensed", sans-serif';
      ctx.fillText(state.result.good ? 'GOOD' : 'NO GOOD', W / 2, 52);
    } else if (!state.kicked && !state.pull) {
      ctx.fillStyle = C.subtle;
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillText('PULL BACK ANYWHERE + LET GO TO KICK', W / 2, 24);
    }
  }

  function draw() {
    if (!W) return;
    drawField();
    var b = state.ball;
    var ballBehind = b && b.vz * b.t > state.goal.z;
    if (!ballBehind) drawGoal();
    drawTee();
    if (b) {
      var y = Math.max(0, b.vy * b.t - GRAVITY * b.t * b.t / 2);
      if (ballBehind) drawGoal();
      drawBall(b.vx * b.t, b.vz * b.t, y, b.t * 14);
    } else if (!state.result || !state.result.good) {
      drawBall(0, 0, 0.22, 0);
      if (state.pull) drawAim(state.pull);
    }
    drawText();
  }

  // ---------- Input ----------
  canvas.addEventListener('pointerdown', function (e) {
    if (state.ball || state.result) return;
    dragStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
    state.pull = { dx: 0, dy: 0 };
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
    loop();
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!dragStart || e.pointerId !== dragStart.id) return;
    state.pull = { dx: e.clientX - dragStart.x, dy: e.clientY - dragStart.y };
  });
  function endDrag(e, cancelled) {
    if (!dragStart || e.pointerId !== dragStart.id) return;
    var pull = state.pull;
    dragStart = null;
    state.pull = null;
    if (!cancelled && pull) kick(pull);
    draw();
  }
  canvas.addEventListener('pointerup', function (e) { endDrag(e, false); });
  canvas.addEventListener('pointercancel', function (e) { endDrag(e, true); });

  // Keyboard: left/right aim, up/down power, space or enter kicks.
  canvas.addEventListener('keydown', function (e) {
    if (state.ball || state.result) return;
    var k = e.key;
    if (k === 'ArrowLeft') keyAim.dx = Math.min(keyAim.dx + 6, 120);
    else if (k === 'ArrowRight') keyAim.dx = Math.max(keyAim.dx - 6, -120);
    else if (k === 'ArrowUp') keyAim.dy = Math.min(keyAim.dy + 8, MAX_PULL);
    else if (k === 'ArrowDown') keyAim.dy = Math.max(keyAim.dy - 8, 16);
    else if (k === ' ' || k === 'Enter') {
      e.preventDefault();
      state.pull = null;
      kick(keyAim);
      return;
    } else return;
    e.preventDefault();
    state.pull = { dx: keyAim.dx, dy: keyAim.dy };
    draw();
  });
  canvas.addEventListener('blur', function () {
    if (!dragStart) { state.pull = null; draw(); }
  });

  card.querySelector('[data-kick-reset]').addEventListener('click', function () {
    state.made = 0;
    state.streak = 0;
    state.ball = null;
    state.result = null;
    state.pull = null;
    state.kicked = false;     // show the how-to hint again
    keyAim = { dx: 0, dy: 70 };
    newGoal(true);
    updateScore();
    draw();
  });

  // ---------- Start ----------
  new ResizeObserver(resize).observe(canvas);
  resize();
  newGoal(true);
  updateScore();
  draw();
  // Redraw once the display fonts are in, so canvas text uses them.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
})();
