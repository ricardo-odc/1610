(() => {
  function createGame(root = document) {
    const canvas = root.querySelector('#game-canvas');
    if (!canvas) return null;

    const context = canvas.getContext('2d');
    const scoreValue = root.querySelector('#score-value');
    const livesValue = root.querySelector('#lives-value');
    const levelValue = root.querySelector('#level-value');
    const overlay = root.querySelector('#game-overlay');
    const overlayEyebrow = root.querySelector('#overlay-eyebrow');
    const overlayTitle = root.querySelector('#overlay-title');
    const overlayCopy = root.querySelector('#overlay-copy');
    const overlayAction = root.querySelector('#overlay-action');

    let width = 0;
    let height = 0;
    let scale = 1;
    let state = 'stopped';
    let frameId = null;
    let lastFrame = 0;
    let score = 0;
    let level = 1;
    let lives = 3;
    let player = null;
    let enemies = [];
    let bullets = [];
    let enemyBullets = [];
    let barriers = [];
    let enemyDirection = 1;
    let enemySpeed = 0;
    let enemyFireCooldown = 0;
    const pressedKeys = { left: false, right: false, fire: false };

    function resizeCanvas() {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      width = bounds.width;
      height = bounds.height;
      scale = Math.min(width, height) / 700;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (player) {
        player.width = 42 * scale;
        player.height = 22 * scale;
        player.x = Math.min(Math.max(player.x, player.width / 2 + 16 * scale), width - player.width / 2 - 16 * scale);
      }
    }

    function updateHud() {
      scoreValue.textContent = String(score);
      livesValue.textContent = String(lives);
      levelValue.textContent = String(level);
    }

    function setOverlay(kind) {
      overlayEyebrow.textContent = `NÍVEL ${level}`;
      overlay.hidden = false;

      if (kind === 'ready') {
        overlayTitle.textContent = 'Nave pronta';
        overlayCopy.textContent = 'Use as setas para mover e Espaço para disparar.';
        overlayAction.textContent = 'Iniciar missão';
        return;
      }

      overlayTitle.textContent = 'Base perdida';
      overlayCopy.textContent = `Você alcançou ${score} pontos. Tente novamente na próxima missão.`;
      overlayAction.textContent = 'Recomeçar';
    }

    function createBarriers() {
      const barrierWidth = 92 * scale;
      const barrierHeight = 30 * scale;
      const totalWidth = barrierWidth * 4 + 34 * scale * 3;
      const startX = (width - totalWidth) / 2;
      const y = height - 120 * scale;
      const group = [];
      for (let index = 0; index < 4; index += 1) {
        group.push({
          x: startX + index * (barrierWidth + 34 * scale),
          y,
          width: barrierWidth,
          height: barrierHeight,
          hp: 6,
          active: true,
        });
      }
      return group;
    }

    function spawnWave() {
      const rows = 5;
      const columns = 10;
      const cellWidth = 28 * scale;
      const cellHeight = 20 * scale;
      const columnGap = 18 * scale;
      const rowGap = 20 * scale;
      const startX = (width - (columns * cellWidth + (columns - 1) * columnGap)) / 2;
      const startY = 110 * scale;

      enemies = [];
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          enemies.push({
            x: startX + column * (cellWidth + columnGap),
            y: startY + row * (cellHeight + rowGap),
            width: cellWidth,
            height: cellHeight,
            alive: true,
            color: row < 2 ? '#5be9ff' : row < 4 ? '#7df2c1' : '#ffd166',
          });
        }
      }

      enemyDirection = 1;
      enemySpeed = (35 + level * 8) * scale;
      enemyFireCooldown = Math.max(0.8, 1.6 - level * 0.12) + Math.random() * 0.8;
    }

    function resetRun() {
      score = 0;
      lives = 3;
      level = 1;
      player = {
        x: width / 2,
        y: height - 48 * scale,
        width: 42 * scale,
        height: 22 * scale,
        fireCooldown: 0,
      };
      barriers = createBarriers();
      bullets = [];
      enemyBullets = [];
      spawnWave();
      updateHud();
      setOverlay('ready');
    }

    function firePlayerBullet() {
      if (!player || player.fireCooldown > 0) return;
      bullets.push({
        x: player.x,
        y: player.y - player.height * 0.75,
        radius: 4 * scale,
        speed: 560 * scale,
        direction: -1,
      });
      player.fireCooldown = 0.24;
    }

    function fireEnemyBullet() {
      const liveEnemies = enemies.filter((enemy) => enemy.alive);
      if (!liveEnemies.length) return;
      const bottomEnemies = liveEnemies.slice().sort((a, b) => b.y - a.y);
      const shooter = bottomEnemies[Math.min(Math.floor(Math.random() * Math.min(4, bottomEnemies.length)), bottomEnemies.length - 1)];
      if (!shooter) return;
      enemyBullets.push({
        x: shooter.x + shooter.width / 2,
        y: shooter.y + shooter.height,
        radius: 4 * scale,
        speed: (230 + level * 18) * scale,
        direction: 1,
      });
    }

    function circleRectCollision(circleX, circleY, radius, rectX, rectY, rectWidth, rectHeight) {
      const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
      const closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
      const dx = circleX - closestX;
      const dy = circleY - closestY;
      return dx * dx + dy * dy <= radius * radius;
    }

    function damageBarrier(barrier, bullet) {
      if (!barrier || !bullet) return;
      barrier.hp -= 1;
      bullet.hit = true;
      if (barrier.hp <= 0) {
        barrier.active = false;
      }
    }

    function loseLife() {
      if (state !== 'running') return;
      lives -= 1;
      bullets = [];
      enemyBullets = [];

      if (lives <= 0) {
        state = 'over';
        setOverlay('over');
        return;
      }

      player.x = width / 2;
      player.fireCooldown = 0.5;
      updateHud();
    }

    function advanceEnemies(delta) {
      const livingEnemies = enemies.filter((enemy) => enemy.alive);
      if (!livingEnemies.length) return;

      let minX = Infinity;
      let maxX = -Infinity;
      for (const enemy of livingEnemies) {
        minX = Math.min(minX, enemy.x);
        maxX = Math.max(maxX, enemy.x + enemy.width);
      }

      let moveBy = enemyDirection * enemySpeed * delta;
      if (minX + moveBy < 18 * scale || maxX + moveBy > width - 18 * scale) {
        enemyDirection *= -1;
        moveBy = 0;
        for (const enemy of livingEnemies) {
          enemy.y += 18 * scale;
        }
      }

      for (const enemy of livingEnemies) {
        enemy.x += moveBy;
      }

      if (Math.max(...livingEnemies.map((enemy) => enemy.y + enemy.height)) >= height - 110 * scale) {
        loseLife();
      }
    }

    function update(delta) {
      if (state !== 'running') return;

      if (player) {
        const moveSpeed = 420 * scale;
        if (pressedKeys.left) player.x -= moveSpeed * delta;
        if (pressedKeys.right) player.x += moveSpeed * delta;
        player.x = Math.min(Math.max(player.x, 26 * scale), width - 26 * scale);
        player.fireCooldown = Math.max(0, player.fireCooldown - delta);
      }

      if (pressedKeys.fire) {
        firePlayerBullet();
      }

      for (const bullet of bullets) {
        bullet.y += bullet.speed * delta * bullet.direction;
      }
      for (const bullet of enemyBullets) {
        bullet.y += bullet.speed * delta * bullet.direction;
      }

      enemyFireCooldown -= delta;
      if (enemyFireCooldown <= 0) {
        fireEnemyBullet();
        enemyFireCooldown = Math.max(0.65, 1.35 - level * 0.10) + Math.random() * 0.8;
      }

      advanceEnemies(delta);

      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        for (const bullet of bullets) {
          if (bullet.hit) continue;
          if (circleRectCollision(bullet.x, bullet.y, bullet.radius, enemy.x, enemy.y, enemy.width, enemy.height)) {
            enemy.alive = false;
            bullet.hit = true;
            score += 10;
          }
        }
      }

      for (const barrier of barriers) {
        if (!barrier.active) continue;
        for (const bullet of bullets) {
          if (bullet.hit) continue;
          if (circleRectCollision(bullet.x, bullet.y, bullet.radius, barrier.x, barrier.y, barrier.width, barrier.height)) {
            damageBarrier(barrier, bullet);
          }
        }
        for (const bullet of enemyBullets) {
          if (bullet.hit) continue;
          if (circleRectCollision(bullet.x, bullet.y, bullet.radius, barrier.x, barrier.y, barrier.width, barrier.height)) {
            damageBarrier(barrier, bullet);
          }
        }
      }

      for (const bullet of bullets) {
        if (bullet.hit || bullet.y < -20 * scale || bullet.y > height + 30 * scale) {
          bullet.hit = true;
        }
      }
      for (const bullet of enemyBullets) {
        if (bullet.hit || bullet.y < -20 * scale || bullet.y > height + 30 * scale) {
          bullet.hit = true;
        }
      }

      bullets = bullets.filter((bullet) => !bullet.hit);
      enemyBullets = enemyBullets.filter((bullet) => !bullet.hit);
      enemies = enemies.filter((enemy) => enemy.alive);
      barriers = barriers.filter((barrier) => barrier.active);

      if (!enemies.length) {
        level += 1;
        score += 150;
        spawnWave();
        updateHud();
      }

      for (const bullet of enemyBullets) {
        if (!player) continue;
        if (circleRectCollision(bullet.x, bullet.y, bullet.radius, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height)) {
          bullet.hit = true;
          loseLife();
        }
      }

      updateHud();
    }

    function drawBackground() {
      const sky = context.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#060b1b');
      sky.addColorStop(0.5, '#1d2f5d');
      sky.addColorStop(1, '#091629');
      context.fillStyle = sky;
      context.fillRect(0, 0, width, height);

      context.fillStyle = 'rgba(255,255,255,0.8)';
      for (let index = 0; index < 90; index += 1) {
        const x = ((index * 53.7) % width);
        const y = ((index * 97.1) % (height - 120));
        context.fillRect(x, y, 2 * scale, 2 * scale);
      }
    }

    function drawBarriers() {
      for (const barrier of barriers) {
        if (!barrier.active) continue;
        const opacity = 0.25 + barrier.hp * 0.12;
        context.fillStyle = `rgba(126, 231, 210, ${opacity})`;
        context.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
        context.strokeStyle = '#b9fff0';
        context.strokeRect(barrier.x, barrier.y, barrier.width, barrier.height);
      }
    }

    function drawEnemies() {
      for (const enemy of enemies) {
        context.fillStyle = enemy.color;
        context.fillRect(enemy.x + 2 * scale, enemy.y + 2 * scale, enemy.width - 4 * scale, enemy.height - 4 * scale);
        context.fillStyle = '#06131d';
        context.fillRect(enemy.x + 7 * scale, enemy.y + 7 * scale, 5 * scale, 5 * scale);
        context.fillRect(enemy.x + enemy.width - 12 * scale, enemy.y + 7 * scale, 5 * scale, 5 * scale);
      }
    }

    function drawPlayer() {
      if (!player) return;
      context.save();
      context.translate(player.x, player.y);
      context.fillStyle = '#5be9ff';
      context.beginPath();
      context.moveTo(0, -player.height / 2);
      context.lineTo(player.width / 2, player.height / 2);
      context.lineTo(0, player.height / 4);
      context.lineTo(-player.width / 2, player.height / 2);
      context.closePath();
      context.fill();
      context.fillStyle = '#dffaff';
      context.fillRect(-6 * scale, -3 * scale, 12 * scale, 8 * scale);
      context.restore();
    }

    function drawBullets() {
      for (const bullet of bullets) {
        context.fillStyle = '#dffaff';
        context.beginPath();
        context.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        context.fill();
      }

      for (const bullet of enemyBullets) {
        context.fillStyle = '#ff9ca8';
        context.beginPath();
        context.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        context.fill();
      }
    }

    function draw() {
      if (!width || !height) return;
      drawBackground();
      drawBarriers();
      drawEnemies();
      drawBullets();
      drawPlayer();
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

    function activate() {
      if (state === 'ready') {
        state = 'running';
        overlay.hidden = true;
        return;
      }

      if (state === 'over') {
        if (frameId === null) {
          frameId = window.requestAnimationFrame(frame);
        }
        resetRun();
        state = 'running';
        overlay.hidden = true;
      }
    }

    function stop() {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      state = 'stopped';
    }

    window.addEventListener('keydown', (event) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        pressedKeys.left = true;
      }
      if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        pressedKeys.right = true;
      }
      if (event.code === 'Space') {
        pressedKeys.fire = true;
        event.preventDefault();
      }
      if (event.code === 'Space' && (state === 'ready' || state === 'over')) {
        activate();
      }
    });

    window.addEventListener('keyup', (event) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        pressedKeys.left = false;
      }
      if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        pressedKeys.right = false;
      }
      if (event.code === 'Space') {
        pressedKeys.fire = false;
      }
    });

    window.addEventListener('resize', resizeCanvas);

    return { start, stop, activate };
  }

  window.SpaceInvaders = window.SpaceInvaders || {};
  window.SpaceInvaders.create = createGame;
  window.SpaceInvaders.init = function initializeGame() {
    const root = document.querySelector('[data-space-invaders-root]') || document;
    const instance = createGame(root);
    if (instance) {
      window.spaceGame = instance;
    }
    return instance;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.SpaceInvaders.init, { once: true });
  } else {
    window.SpaceInvaders.init();
  }
})();