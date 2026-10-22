# Mini jogos

O projeto reúne dois jogos independentes em HTML, CSS e JavaScript, com uma página inicial para escolher qual abrir.

## Abrir

- Abra `index.html` ou inicie um servidor web na pasta do projeto.
- Escolha **Flaap Bird** ou **Space Invaders** na página inicial.

## Organização

```text
index.html
games/
  flap-bird/
    index.html
    css/style.css
    js/game.js
    js/ui.js
  space-invaders/
    index.html
    css/style.css
    js/game.js
    js/ui.js
```

- `index.html` é o menu que leva a cada jogo.
- `games/flap-bird/` contém o Flap Bird, com fases, obstáculos e pontuação.
- `games/space-invaders/` contém o Space Invaders, com ondas de inimigos, nave, barreiras e níveis.

Cada jogo mantém seus próprios arquivos e pode ser publicado em conjunto, sem compilação ou dependências.

## GitHub Pages

Publique o repositório e configure **Settings > Pages > Deploy from a branch**, selecionando a branch `main` e a pasta `/ (root)`. O menu e os dois jogos ficarão disponíveis pelas pastas listadas acima.
