README

COMO JOGAR (ㆆ_ㆆ)


## Descrição

**Shuriken Dodge** é um jogo simples de sobrevivência onde o jogador controla um balão e deve desviar de shurikens que caem do céu. Cada shuriken evitada aumenta sua pontuação. O objetivo é sobreviver o máximo possível e bater seu próprio recorde.

---

## Como Jogar

### Controles

* **A** ou **← (Seta Esquerda)**: mover para a esquerda
* **D** ou **→ (Seta Direita)**: mover para a direita
* **ESPAÇO**: iniciar o jogo ou reiniciar após o Game Over

### Objetivo

Evite as shurikens que caem do topo da tela. Cada shuriken que atravessa a tela sem atingir o jogador gera **1 ponto**.

---

## Mecânicas

### Sistema de Estados

O jogo possui três estados principais:

* **Menu**: tela inicial.
* **Jogo**: gameplay em andamento.
* **Game Over**: exibido quando o jogador é atingido.

### Shurikens

Cada shuriken:

1. Surge em uma posição aleatória.
2. Exibe um aviso antes de cair.
3. Cai em velocidade aleatória.
4. Gira durante a queda.
5. Retorna ao topo após sair da tela.

### Pontuação

* O jogador ganha pontos ao evitar obstáculos.
* O recorde é salvo automaticamente utilizando armazenamento local.

---

## Estrutura do Projeto

### Funções Auxiliares

| Função            | Descrição                          |
| ----------------- | ---------------------------------- |
| `chave()`         | Verifica teclas pressionadas       |
| `captura()`       | Detecta interação por toque/clique |
| `locariza_x()`    | Gera posição aleatória no eixo X   |
| `aperta_comeca()` | Cria uma nova shuriken             |
| `reset()`         | Reinicia os dados de uma shuriken  |

### Funções Principais

#### `init()`

Inicializa todas as variáveis do jogo.

#### `update()`

Executa a lógica principal:

* movimentação do jogador;
* atualização das shurikens;
* colisões;
* pontuação;
* troca de estados.

#### `draw()`

Responsável por desenhar:

* menu;
* cenário;
* jogador;
* obstáculos;
* interface;
* tela de Game Over.

---

## Sistema de Recorde

O melhor resultado é armazenado através de:

```python
storage.set("bestScore", spedrun)
```

Ao iniciar o jogo novamente, o recorde é carregado automaticamente:

```python
storage.get("bestScore")
```

---

## Sprites Utilizados

O projeto utiliza os seguintes recursos gráficos:

* `ceu`
* `balao_vermelho`
* `obstaculo`

Esses sprites devem estar disponíveis no projeto para que o jogo seja exibido corretamente.

---

## Possíveis Melhorias Futuras

* Aumento progressivo da dificuldade.
* Sistema de vidas.
* Efeitos sonoros.
* Música de fundo.
* Animações do personagem.
* Diferentes tipos de obstáculos.
* Power-ups.
* Ranking de jogadores.
* Sistema de fases.

---

## Autor

Projeto desenvolvido em Python para ambiente de jogos educacionais/2D com suporte a sprites, teclado, toque e armazenamento local.

Divirta-se desviando das shurikens e tentando alcançar um novo recorde!


# 🎮 Como Jogar — desvia_ou_morre

## Objetivo

Controle o balão e desvie das shurikens que caem do céu. Quanto mais tempo você sobreviver, maior será sua pontuação.

---

## Controles

### Teclado

| Tecla          | Ação                        |
| -------------- | --------------------------- |
| **A** ou **←** | Mover para a esquerda       |
| **D** ou **→** | Mover para a direita        |
| **ESPAÇO**     | Iniciar ou reiniciar o jogo |

### Toque / Clique

* Toque ou clique na tela para iniciar o jogo.
* Após o Game Over, toque ou clique novamente para reiniciar.

---

## Como Funciona

1. Inicie o jogo pressionando **ESPAÇO**.
2. Mova o balão para a esquerda ou direita.
3. Observe os locais onde as shurikens irão aparecer.
4. Desvie dos obstáculos antes que eles atinjam seu personagem.
5. Cada shuriken evitada adiciona **1 ponto** à sua pontuação.
6. Continue sobrevivendo para bater seu recorde.

---

## Pontuação

* Você ganha **1 ponto** para cada shuriken que atravessa a tela sem acertar o balão.
* O melhor resultado é salvo automaticamente como **Recorde**.

---

## Game Over

O jogo termina quando uma shuriken atinge o balão.

Na tela de Game Over serão exibidos:

* Sua pontuação final.
* A opção de reiniciar a partida.

Pressione **ESPAÇO** ou toque na tela para jogar novamente.

---

## Dicas

✅ Mantenha o balão sempre em movimento.

✅ Evite ficar parado por muito tempo na mesma posição.

✅ Observe os avisos antes da queda das shurikens.

✅ Tente antecipar os movimentos dos obstáculos.

✅ Concentre-se em sobreviver, não apenas em fazer pontos rapidamente.

---

## Boa Sorte!

Desvie das shurikens, sobreviva o máximo possível e tente alcançar um novo recorde!
