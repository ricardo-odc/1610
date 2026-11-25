(() => {
  function bindUI(root = document) {
    const openingScreen = root.querySelector('#opening-screen');
    const characterScreen = root.querySelector('#character-screen');
    const gameScreen = root.querySelector('#game-screen');
    const startButton = root.querySelector('#start-button');
    const characterBack = root.querySelector('#character-back');
    const characterContinue = root.querySelector('#character-continue');
    const characterCards = [...root.querySelectorAll('.character-card')];
    const menuButton = root.querySelector('#menu-button');
    const overlayAction = root.querySelector('#overlay-action');
    const canvas = root.querySelector('#game-canvas');

    if (!openingScreen || !characterScreen || !gameScreen || !startButton || !characterBack
      || !characterContinue || !characterCards.length || !menuButton || !overlayAction || !canvas) {
      return null;
    }

    let selectedCharacter = 'blue-dragon';

    startButton.addEventListener('click', () => {
      openingScreen.hidden = true;
      characterScreen.hidden = false;
    });

    characterCards.forEach((card) => {
      card.addEventListener('click', () => {
        selectedCharacter = card.dataset.character;
        characterCards.forEach((option) => {
          const isSelected = option === card;
          option.classList.toggle('selected', isSelected);
          option.setAttribute('aria-pressed', String(isSelected));
        });
      });
    });

    characterBack.addEventListener('click', () => {
      characterScreen.hidden = true;
      openingScreen.hidden = false;
    });

    characterContinue.addEventListener('click', () => {
      characterScreen.hidden = true;
      gameScreen.hidden = false;
      if (window.flaapGame) {
        window.flaapGame.setCharacter(selectedCharacter);
        window.flaapGame.start();
      }
    });

    menuButton.addEventListener('click', () => {
      if (window.flaapGame) window.flaapGame.stop();
      gameScreen.hidden = true;
      openingScreen.hidden = false;
    });

    overlayAction.addEventListener('click', () => {
      if (window.flaapGame) window.flaapGame.activate();
    });

    canvas.addEventListener('pointerdown', () => {
      if (window.flaapGame) window.flaapGame.activate();
    });

    window.addEventListener('keydown', (event) => {
      if (gameScreen.hidden || event.repeat) return;
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        if (window.flaapGame) window.flaapGame.activate();
      }
    });

    return { openingScreen, characterScreen, gameScreen };
  }

  window.FlaapBird = window.FlaapBird || {};
  window.FlaapBird.bindUI = bindUI;

  function initializeUI() {
    const root = document.querySelector('[data-flap-bird-root]') || document;
    if (!window.FlaapBird.init) {
      window.FlaapBird.init = function initGame() {
        const instance = window.FlaapBird.create ? window.FlaapBird.create(root) : null;
        if (instance) window.flaapGame = instance;
        return instance;
      };
    }

    if (!window.flaapGame) {
      window.FlaapBird.init();
    }

    bindUI(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI, { once: true });
  } else {
    initializeUI();
  }
})();