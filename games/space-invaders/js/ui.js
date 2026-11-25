(() => {
  function bindUI(root = document) {
    const openingScreen = root.querySelector('#opening-screen');
    const gameScreen = root.querySelector('#game-screen');
    const startButton = root.querySelector('#start-button');
    const overlayAction = root.querySelector('#overlay-action');
    const canvas = root.querySelector('#game-canvas');
    const xWingPreview = root.querySelector('#xwing-preview');
    const shipOptions = root.querySelectorAll('[data-player-choice]');

    if (!openingScreen || !gameScreen || !startButton || !overlayAction || !canvas) {
      return null;
    }

    if (xWingPreview && window.SpaceInvaders.drawXWing) {
      const previewContext = xWingPreview.getContext('2d');
      window.SpaceInvaders.drawXWing(previewContext, xWingPreview.width / 2, xWingPreview.height / 2, 2);
    }

    startButton.addEventListener('click', () => {
      openingScreen.hidden = true;
      gameScreen.hidden = false;
      if (window.spaceGame) window.spaceGame.start();
    });

    shipOptions.forEach((option) => {
      option.addEventListener('click', () => {
        shipOptions.forEach((item) => {
          item.classList.remove('is-selected');
          item.setAttribute('aria-pressed', 'false');
        });
        option.classList.add('is-selected');
        option.setAttribute('aria-pressed', 'true');
        if (window.spaceGame) {
          window.spaceGame.setPlayerShip(option.dataset.playerChoice);
        }
      });
    });

    overlayAction.addEventListener('click', () => {
      if (window.spaceGame) window.spaceGame.activate();
    });

    canvas.addEventListener('pointerdown', () => {
      if (window.spaceGame) window.spaceGame.activate();
    });

    window.addEventListener('keydown', (event) => {
      if (gameScreen.hidden || event.repeat) return;
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        if (window.spaceGame) window.spaceGame.activate();
      }
    });

    return { openingScreen, gameScreen };
  }

  window.SpaceInvaders = window.SpaceInvaders || {};
  window.SpaceInvaders.bindUI = bindUI;

  function initializeUI() {
    const root = document.querySelector('[data-space-invaders-root]') || document;
    if (!window.SpaceInvaders.init) {
      window.SpaceInvaders.init = function initGame() {
        const instance = window.SpaceInvaders.create ? window.SpaceInvaders.create(root) : null;
        if (instance) window.spaceGame = instance;
        return instance;
      };
    }

    if (!window.spaceGame) {
      window.SpaceInvaders.init();
    }

    bindUI(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI, { once: true });
  } else {
    initializeUI();
  }
})();