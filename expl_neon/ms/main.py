import random
import math

# Inicialização das variáveis globais
bolas = []
particulas = []
score = 0
musica = None


def criar_bola():
    return {
        "x": random.randint(-200, 200),
        "y": random.randint(-200, 200),
        "r": random.randint(6, 18),
        # Cores HSL vibrantes no padrão do microStudio
        "color": f"hsl({random.randint(0, 360)}, 100%, 65%)",
        "vx": random.uniform(-1.5, 1.5),
        "vy": random.uniform(-1.5, 1.5),
        "alive": True
    }


def init():
    global score
    bolas.clear()
    particulas.clear()
    score = 0
    for _ in range(100):
        bolas.append(criar_bola())


def update():
    global score

    # Detecção de clique/toque no microStudio
    mouse_clicou = mouse.pressed and mouse.left
    musica = audio.playMusic("madeira",)

    # Atualiza as bolinhas iluminadas
    for d in bolas:
        if not d["alive"]:
            continue
        d["x"] += d["vx"]
        d["y"] += d["vy"]
        d["vx"] = max(min(d["vx"] + random.uniform(-0.08, 0.08), 2.5), -2.5)
        d["vy"] = max(min(d["vy"] + random.uniform(-0.08, 0.08), 2.5), -2.5)
        # Rebatimento nas bordas usando as propriedades da tela do microStudio
        if abs(d["x"]) > screen.width / 2:
            d["vx"] *= -1
        if abs(d["y"]) > screen.height / 2:
            d["vy"] *= -1
        # Detecção de colisão do clique com a bolinha
        if mouse_clicou and abs(mouse.x - d["x"]) < d["r"] and abs(mouse.y - d["y"]) < d["r"]:
            d["alive"] = False
            score += 1
          

            # Spawna 1 bola nova no lugar da que estourou
            bolas.append(criar_bola())
            print("bolas 2x")

            # Efeito Digital Circus: Explosão de partículas de luz
            for _ in range(15):
                angulo = random.uniform(0, math.pi * 2)
                velocidade = random.uniform(1, 5)
                particulas.append({
                    "x": d["x"], "y": d["y"],
                    "vx": math.cos(angulo) * velocidade,
                    "vy": math.sin(angulo) * velocidade,
                    "r": random.randint(2, 5),
                    "alpha": 1.0,
                    "color": d["color"]
                })

    # Atualiza as partículas da explosão
    for p in particulas[:]:
        p["x"] += p["vx"]
        p["y"] += p["vy"]
        p["alpha"] -= 0.05  # Sumindo gradativamente
        if p["alpha"] <= 0:
            particulas.remove(p)




def draw():
    # Rastro luminoso: Desenha um fundo semi-transparente para acumular frames anteriores
    screen.setAlpha(0.15)
    screen.fillRect(0, 0, screen.width, screen.height, "black")

    # Desenha o brilho e o corpo das bolinhas
    for d in bolas:
        if not d["alive"]:
            continue

        # Camadas de brilho Neon (Luz de Circo)
        for i in range(2, 0, -2):
            screen.setAlpha(0.00 * (5 - i))
            screen.fillRound(d["x"], d["y"], d["r"] + i * 4, d["r"] + i * 4, d["color"])

        # Centro sólido da lâmpada
        screen.setAlpha(1.0)
        screen.fillRound(d["x"], d["y"], d["r"], d["r"], d["color"])

    # Desenha as partículas da explosão
    for p in particulas:
        screen.setAlpha(p["alpha"])
        screen.fillRound(p["x"], p["y"], p["r"], p["r"], p["color"])

    # Interface de Pontos (Texto fixo no topo da tela)
    screen.setAlpha(1.0)
    screen.drawText(f"Score: {score}", 0, screen.height / 2 - 20, 20, "white")