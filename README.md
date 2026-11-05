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

Em **Settings > Pages**, selecione **GitHub Actions** como origem de publicação. A cada push na branch `master`, o workflow publica o site automaticamente; também é possível iniciar a publicação manualmente em **Actions > Deploy to GitHub Pages > Run workflow**. Na primeira publicação, o GitHub exibirá a URL do site em **Settings > Pages** e na execução do workflow. O menu e os dois jogos serão publicados juntos.
