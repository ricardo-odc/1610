(() => {
  function bindUI(root = document) {
    const openingScreen = root.querySelector('#opening-screen');
    const gameScreen = root.querySelector('#game-screen');
    const startButton = root.querySelector('#start-button');
    const overlayAction = root.querySelector('#overlay-action');
    const canvas = root.querySelector('#game-canvas');

    if (!openingScreen || !gameScreen || !startButton || !overlayAction || !canvas) {
      return null;
    }

    startButton.addEventListener('click', () => {
      openingScreen.hidden = true;
      gameScreen.hidden = false;
      if (window.spaceGame) window.spaceGame.start();
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