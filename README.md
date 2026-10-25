
# Guerreiro 3D com Three.js

Trabalho da disciplina de Processamento de Imagens / Computação Gráfica.
Personagem 3D criado do zero com [Three.js](https://threejs.org/), usando apenas formas simples (caixas, esferas e cilindros), com animações de sacar, brandir e guardar a espada.

## O que tem no projeto

| Arquivo            | Descrição                                                 |
| ------------------ | ----------------------------------------------------------- |
| `guerreiro.html` | Página que carrega a cena                                  |
| `guerreiro.js`   | Modelo do guerreiro, animações e botões                  |
| `versionar.sh`   | Script usado para versionar o projeto por etapas (opcional) |

O Three.js é carregado pela internet (CDN), então não há nada para instalar.

## Como rodar

O projeto precisa de um servidor local (abrir o `.html` com duplo clique não funciona).

**Opção 1: VS Code**

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão **Live Server**.
3. Clique com o botão direito em `guerreiro.html` e escolha **Open with Live Server**.

**Opção 2: Node.js**

```bash
npx serve
```

**Opção 3: Python**

```bash
python -m http.server 8000
```

Depois abra `guerreiro.html` pelo endereço mostrado (por exemplo, `http://localhost:8000/guerreiro.html`).

## Como usar

- **Mouse:** botão esquerdo gira a câmera, rolagem dá zoom, botão direito move a cena.
- **Painel à esquerda:** botões para escolher a animação.

## Animações

| Animação          | O que faz                                           |
| ------------------- | --------------------------------------------------- |
| Parado              | Respira de leve (em guarda se estiver com a espada) |
| Sacar a espada      | Tira a espada da bainha                             |
| Brandir a espada    | Dois golpes com giro do corpo                       |
| Guardar a espada    | Devolve a espada à bainha                          |
| Sequência completa | Sacar, brandir e guardar em seguida                 |

## Como funciona

- **Formas simples:** o personagem é montado com caixas, esferas e cilindros.
- **Articulações:** cada articulação (ombro, cotovelo, pulso, quadril) é um `Group` do Three.js. Girar o grupo move a peça como um osso.
- **Poses:** cada pose é uma lista de ângulos (blocos `REST`, `PRONTO`, `REACH`, `LIVRE`, `PREPARA` e `GOLPE` em `guerreiro.js`). O código interpola entre elas ao longo do tempo.
- **Espada:** ela muda de "pai" entre a bainha e a mão no meio das animações de sacar e guardar, e por isso acompanha o corpo em cada fase.

## Tecnologias

- Three.js 0.160 (via CDN)
- `OrbitControls` (addon do Three.js)
- JavaScript (módulos ES)

## Integrantes

- Gabriel Calheiros Ferro Gomes
