(() => {
  function createGame(root = document) {
    const phases = [
      { at: 0, clock: '12:00', name: 'DIA', skyTop: '#65cfe0', skyBottom: '#d9f0ce', hillBack: '#88c987', hillFront: '#4aa879', sun: '#ffca62' },
      { at: 15 * 60, clock: '18:15', name: 'PÔR DO SOL', skyTop: '#ee8b76', skyBottom: '#f9c77f', hillBack: '#a86873', hillFront: '#62536d', sun: '#ffe09a' },
      { at: 30 * 60, clock: '20:00', name: 'NOITE', skyTop: '#202d59', skyBottom: '#455777', hillBack: '#39445c', hillFront: '#28394b', sun: '#f2e4c3' },
      { at: 45 * 60, clock: '06:00', name: 'AMANHECENDO', skyTop: '#7cacc1', skyBottom: '#f2b18d', hillBack: '#789b81', hillFront: '#49776b', sun: '#ffe0a0' },
    ];
    const characters = {
      'blue-dragon': { body: '#159fc1', light: '#69e1ef', dark: '#176b9b', accent: '#a5f5ff', eye: '#183a3b', kind: 'dragon' },
      chicken: { body: '#ffd166', light: '#fff0a6', dark: '#d99b35', accent: '#ef5b54', eye: '#183a3b', kind: 'chicken' },
      'shadow-dragon': { body: '#55428a', light: '#a88be8', dark: '#28213f', accent: '#dbb7ff', eye: '#fff1a8', kind: 'dragon' },
      water: { body: '#2589d8', light: '#8de8ff', dark: '#16539e', accent: '#e0fbff', eye: '#183a3b', kind: 'water' },
      fire: { body: '#e95c32', light: '#ffb338', dark: '#9e2934', accent: '#ffe26a', eye: '#183a3b', kind: 'fire' },
      earth: { body: '#71934e', light: '#b8cc62', dark: '#465d3d', accent: '#e0b56c', eye: '#183a3b', kind: 'earth' },
      air: { body: '#91c9d4', light: '#e4fbff', dark: '#5d8fa8', accent: '#ffffff', eye: '#183a3b', kind: 'air' },
    };

    const canvas = root.querySelector('#game-canvas');
    if (!canvas) return null;

    const context = canvas.getContext('2d');
    const phaseValue = root.querySelector('#phase-value');
    const phaseDetail = root.querySelector('#phase-detail');
    const scoreValue = root.querySelector('#score-value');
    const elapsedValue = root.querySelector('#elapsed-value');
    const overlay = root.querySelector('#game-overlay');
    const overlayEyebrow = root.querySelector('#overlay-eyebrow');
    const overlayTitle = root.querySelector('#overlay-title');
    const overlayCopy = root.querySelector('#overlay-copy');
    const overlayAction = root.querySelector('#overlay-action');
    const overlayStats = root.querySelector('#overlay-stats');
    const overlayScoreValue = root.querySelector('#overlay-score-value');
    const overlayBestValue = root.querySelector('#overlay-best-value');
    const bestScoreKey = 'flaap-bird-best-score';

    let width = 0;
    let height = 0;
    let scale = 1;
    let state = 'stopped';
    let frameId = null;
    let lastFrame = 0;
    let elapsed = 0;
    let score = 0;
    let selectedCharacter = 'blue-dragon';
    let phaseIndex = 0;
    let lastHudSecond = -1;
    let bird;
    let pipes = [];

    function resizeCanvas() {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      width = bounds.width;
      height = bounds.height;
      scale = height / 690;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (bird) bird.x = width * 0.28;
    }

    function currentPhase() {
      let activeIndex = 0;
      for (let index = 1; index < phases.length; index += 1) {
        if (elapsed >= phases[index].at) activeIndex = index;
      }
      return activeIndex;
    }

    function formatElapsed(seconds) {
      const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
      const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${minutes}:${remainder}`;
    }

    function updateHud(force = false) {
      const activePhase = currentPhase();
      const displayedSecond = Math.floor(elapsed);
      if (!force && displayedSecond === lastHudSecond && activePhase === phaseIndex) return;
      phaseIndex = activePhase;
      lastHudSecond = displayedSecond;
      const phase = phases[phaseIndex];
      phaseValue.textContent = `${phaseIndex + 1} / ${phases.length}`;
      phaseDetail.textContent = `${phase.clock} · ${phase.name}`;
      scoreValue.textContent = score.toString();
      elapsedValue.textContent = formatElapsed(elapsed);
    }

    function setOverlay(kind) {
      const phase = phases[phaseIndex];
      overlayEyebrow.textContent = `FASE ${phaseIndex + 1} · ${phase.clock} · ${phase.name}`;
      overlay.hidden = false;

      if (kind === 'ready') {
        overlayTitle.textContent = 'Pronto para voar?';
        overlayCopy.textContent = 'Clique, toque ou pressione Espaço para começar.';
        overlayAction.textContent = 'Começar voo';
        overlayStats.hidden = true;
        return;
      }

      let bestScore = 0;
      try {
        bestScore = Number.parseInt(localStorage.getItem(bestScoreKey) || '0', 10);
        if (!Number.isFinite(bestScore)) bestScore = 0;
        if (score > bestScore) {
          bestScore = score;
          localStorage.setItem(bestScoreKey, String(bestScore));
        }
      } catch (_) {}

      overlayTitle.textContent = 'Voo encerrado';
      overlayCopy.textContent = `Você voou por ${formatElapsed(elapsed)}.`;
      overlayAction.textContent = 'Tentar novamente';
      overlayScoreValue.textContent = String(score);
      overlayBestValue.textContent = String(bestScore);
      overlayStats.hidden = false;
    }

    function resetRun() {
      elapsed = 0;
      score = 0;
      phaseIndex = 0;
      lastHudSecond = -1;
      bird = { x: width * 0.28, y: height * 0.46, velocity: 0, radius: 17 * scale };
      pipes = [{ x: width + 100 * scale, gapY: height * 0.46, scored: false }];
      updateHud(true);
      setOverlay('ready');
    }

    function activate() {
      if (state === 'stopped') return;
      if (state === 'over') resetRun();
      state = 'running';
      bird.velocity = -475 * scale;
      overlay.hidden = true;
    }

    function getDifficulty() {
      const speed = (205 + phaseIndex * 28 + Math.min(score * 2.5, 75)) * scale;
      const gap = Math.max(126, 178 - phaseIndex * 11 - Math.floor(score / 3) * 2) * scale;
      return { speed, gap };
    }

    function addPipe() {
      const { gap } = getDifficulty();
      const margin = 88 * scale + gap / 2;
      const gapY = margin + Math.random() * Math.max(0, height - 2 * margin - 52 * scale);
      pipes.push({ x: width + 40 * scale, gapY, scored: false });
    }

    function update(delta) {
      elapsed += delta;
      const nextPhase = currentPhase();
      if (nextPhase !== phaseIndex) updateHud(true);
      else if (Math.floor(elapsed) !== lastHudSecond) updateHud();

      const { speed, gap } = getDifficulty();
      const groundY = height - 52 * scale;
      bird.velocity += 1450 * scale * delta;
      bird.y += bird.velocity * delta;

      for (const pipe of pipes) {
        pipe.x -= speed * delta;
        const gapTop = pipe.gapY - gap / 2;
        const gapBottom = pipe.gapY + gap / 2;
        const overlapsBird = pipe.x < bird.x + bird.radius && pipe.x + 72 * scale > bird.x - bird.radius;
        if (overlapsBird && (bird.y - bird.radius < gapTop || bird.y + bird.radius > gapBottom)) {
          finishRun();
          return;
        }
        if (!pipe.scored && pipe.x + 72 * scale < bird.x - bird.radius) {
          pipe.scored = true;
          score += 1;
          updateHud(true);
        }
      }

      pipes = pipes.filter((pipe) => pipe.x > -90 * scale);
      const lastPipe = pipes[pipes.length - 1];
      if (!lastPipe || lastPipe.x < width - 310 * scale) addPipe();

      if (bird.y - bird.radius < 0 || bird.y + bird.radius > groundY) finishRun();
    }

    function finishRun() {
      if (state !== 'running') return;
      state = 'over';
      setOverlay('over');
    }

    function drawBackground(phase) {
      const sky = context.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, phase.skyTop);
      sky.addColorStop(1, phase.skyBottom);
      context.fillStyle = sky;
      context.fillRect(0, 0, width, height);

      if (phaseIndex === 2) {
        for (let index = 0; index < 36; index += 1) {
          const starX = ((index * 137.5) % 997) / 997 * width;
          const starY = ((index * 83.7) % 521) / 690 * height;
          context.fillStyle = index % 3 === 0 ? '#fff0bf' : '#e7efff';
          context.fillRect(starX, starY, 2 * scale, 2 * scale);
        }
        context.fillStyle = phase.sun;
        context.beginPath();
        context.arc(width * 0.78, height * 0.2, 38 * scale, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = phase.skyTop;
        context.beginPath();
        context.arc(width * 0.8, height * 0.18, 34 * scale, 0, Math.PI * 2);
        context.fill();
      } else {
        context.fillStyle = phase.sun;
        context.beginPath();
        context.arc(width * 0.78, height * (phaseIndex === 1 ? 0.58 : 0.2), 43 * scale, 0, Math.PI * 2);
        context.fill();
        drawCloud(width * 0.65, height * 0.31, 0.9 * scale);
        drawCloud(width * 0.91, height * 0.43, 0.62 * scale);
      }

      const groundY = height - 52 * scale;
      context.fillStyle = phase.hillBack;
      context.beginPath();
      context.moveTo(0, groundY);
      context.quadraticCurveTo(width * 0.22, height * 0.56, width * 0.49, groundY);
      context.quadraticCurveTo(width * 0.76, height * 0.61, width, groundY - 20 * scale);
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.fill();

      context.fillStyle = phase.hillFront;
      context.beginPath();
      context.moveTo(0, groundY - 12 * scale);
      context.quadraticCurveTo(width * 0.27, height * 0.72, width * 0.56, groundY);
      context.quadraticCurveTo(width * 0.8, height * 0.68, width, groundY - 5 * scale);
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.fill();

      context.fillStyle = '#d39a5b';
      context.fillRect(0, groundY, width, height - groundY);
      context.fillStyle = '#c4d96e';
      context.fillRect(0, groundY, width, 9 * scale);
    }

    function drawCloud(x, y, cloudScale) {
      context.fillStyle = 'rgba(255, 255, 244, 0.72)';
      context.beginPath();
      context.ellipse(x, y, 36 * cloudScale, 12 * cloudScale, 0, 0, Math.PI * 2);
      context.arc(x - 17 * cloudScale, y - 7 * cloudScale, 13 * cloudScale, 0, Math.PI * 2);
      context.arc(x + 9 * cloudScale, y - 10 * cloudScale, 17 * cloudScale, 0, Math.PI * 2);
      context.fill();
    }

    function drawPipes() {
      const { gap } = getDifficulty();
      const groundY = height - 52 * scale;
      for (const pipe of pipes) {
        const gapTop = pipe.gapY - gap / 2;
        const gapBottom = pipe.gapY + gap / 2;
        const pipeWidth = 72 * scale;
        context.fillStyle = '#287c63';
        context.fillRect(pipe.x, 0, pipeWidth, gapTop);
        context.fillRect(pipe.x, gapBottom, pipeWidth, groundY - gapBottom);
        context.fillStyle = '#4ab477';
        context.fillRect(pipe.x + 7 * scale, 0, pipeWidth - 14 * scale, gapTop);
        context.fillRect(pipe.x + 7 * scale, gapBottom, pipeWidth - 14 * scale, groundY - gapBottom);
        context.fillStyle = '#61c887';
        context.fillRect(pipe.x - 8 * scale, gapTop - 22 * scale, pipeWidth + 16 * scale, 22 * scale);
        context.fillRect(pipe.x - 8 * scale, gapBottom, pipeWidth + 16 * scale, 22 * scale);
        context.strokeStyle = '#287c63';
        context.lineWidth = 6 * scale;
        context.strokeRect(pipe.x - 8 * scale, gapTop - 22 * scale, pipeWidth + 16 * scale, 22 * scale);
        context.strokeRect(pipe.x - 8 * scale, gapBottom, pipeWidth + 16 * scale, 22 * scale);
      }
    }

    function drawBird() {
      const character = characters[selectedCharacter];
      context.save();
      context.translate(bird.x, bird.y);
      context.rotate(Math.max(-0.35, Math.min(0.55, bird.velocity / (700 * scale))));

      context.fillStyle = character.dark;
      context.beginPath();
      context.ellipse(-10 * scale, 3 * scale, 13 * scale, 9 * scale, -0.5, 0, Math.PI * 2);
      context.fill();

      if (character.kind === 'dragon') {
        context.fillStyle = character.dark;
        context.beginPath();
        context.moveTo(-9 * scale, -9 * scale);
        context.lineTo(-18 * scale, -22 * scale);
        context.lineTo(-3 * scale, -16 * scale);
        context.closePath();
        context.moveTo(1 * scale, -11 * scale);
        context.lineTo(1 * scale, -25 * scale);
        context.lineTo(10 * scale, -14 * scale);
        context.closePath();
        context.fill();
      } else if (character.kind === 'chicken') {
        context.fillStyle = character.accent;
        context.beginPath();
        context.arc(0, -18 * scale, 4 * scale, Math.PI, 0);
        context.arc(7 * scale, -18 * scale, 4 * scale, Math.PI, 0);
        context.arc(14 * scale, -18 * scale, 4 * scale, Math.PI, 0);
        context.fill();
      } else if (character.kind === 'fire') {
        context.fillStyle = character.accent;
        context.beginPath();
        context.moveTo(-9 * scale, -11 * scale);
        context.lineTo(-7 * scale, -25 * scale);
        context.lineTo(0, -16 * scale);
        context.lineTo(7 * scale, -28 * scale);
        context.lineTo(11 * scale, -12 * scale);
        context.closePath();
        context.fill();
      } else if (character.kind === 'earth') {
        context.fillStyle = character.accent;
        context.beginPath();
        context.ellipse(-8 * scale, -14 * scale, 5 * scale, 10 * scale, -0.8, 0, Math.PI * 2);
        context.ellipse(1 * scale, -16 * scale, 5 * scale, 10 * scale, 0.8, 0, Math.PI * 2);
        context.fill();
      } else if (character.kind === 'water') {
        context.fillStyle = character.accent;
        context.beginPath();
        context.moveTo(-19 * scale, 1 * scale);
        context.quadraticCurveTo(-31 * scale, -9 * scale, -26 * scale, 6 * scale);
        context.quadraticCurveTo(-23 * scale, 12 * scale, -17 * scale, 8 * scale);
        context.fill();
        context.beginPath();
        context.moveTo(-3 * scale, -12 * scale);
        context.quadraticCurveTo(2 * scale, -23 * scale, 8 * scale, -12 * scale);
        context.fill();
      } else if (character.kind === 'air') {
        context.strokeStyle = character.accent;
        context.lineWidth = 3 * scale;
        context.beginPath();
        context.arc(-6 * scale, 2 * scale, 12 * scale, Math.PI * 0.8, Math.PI * 1.8);
        context.stroke();
        context.beginPath();
        context.arc(-2 * scale, -4 * scale, 19 * scale, Math.PI * 1.15, Math.PI * 1.85);
        context.stroke();
      }

      context.fillStyle = character.body;
      context.beginPath();
      context.ellipse(0, 0, 24 * scale, 18 * scale, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = character.light;
      context.beginPath();
      context.ellipse(-2 * scale, 6 * scale, 13 * scale, 8 * scale, -0.2, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#fffdf4';
      context.beginPath();
      context.arc(10 * scale, -7 * scale, 6 * scale, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = character.eye;
      context.beginPath();
      context.arc(12 * scale, -7 * scale, 2.2 * scale, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = character.accent;
      context.beginPath();
      context.moveTo(18 * scale, 0);
      context.lineTo(32 * scale, 4 * scale);
      context.lineTo(18 * scale, 8 * scale);
      context.closePath();
      context.fill();
      context.restore();
    }

    function draw() {
      if (!width || !height || !bird) return;
      const phase = phases[phaseIndex];
      drawBackground(phase);
      drawPipes();
      drawBird();
    }

    function frame(timestamp) {
      if (lastFrame) {
        const delta = Math.min((timestamp - lastFrame) / 1000, 1 / 30);
        if (state === 'running') update(delta);
      }
      lastFrame = timestamp;
      draw();
      frameId = window.requestAnimationFrame(frame);
    }

    function start() {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      resizeCanvas();
      resetRun();
      state = 'ready';
      lastFrame = 0;
      frameId = window.requestAnimationFrame(frame);
    }

    function stop() {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      state = 'stopped';
    }

    window.addEventListener('resize', resizeCanvas);

    function setCharacter(characterId) {
      if (characters[characterId]) selectedCharacter = characterId;
    }

    return { start, stop, activate, setCharacter };
  }

  window.FlaapBird = window.FlaapBird || {};
  window.FlaapBird.create = createGame;
  window.FlaapBird.init = function initializeGame() {
    const root = document.querySelector('[data-flap-bird-root]') || document;
    const instance = createGame(root);
    if (instance) {
      window.flaapGame = instance;
    }
    return instance;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.FlaapBird.init, { once: true });
  } else {
    window.FlaapBird.init();
  }
})();