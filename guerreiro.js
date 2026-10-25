import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============================================================
   1) CENA BÁSICA
   ============================================================ */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 20, 60);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(3.5, 2.4, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.1, 0);
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x556655, 0.9));
const sol = new THREE.DirectionalLight(0xffffff, 1.6);
sol.position.set(5, 8, 5);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
scene.add(sol);

const chao = new THREE.Mesh(
  new THREE.CircleGeometry(15, 48),
  new THREE.MeshStandardMaterial({ color: 0x5a9c48 })
);
chao.rotation.x = -Math.PI / 2;
chao.receiveShadow = true;
scene.add(chao);

/* ============================================================
   2) FUNÇÕES AJUDANTES PARA CRIAR FORMAS
   ============================================================ */

const material = (cor, metal = 0.1) =>
  new THREE.MeshStandardMaterial({ color: cor, roughness: 0.6, metalness: metal });

function caixa(w, h, d, cor, metal) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(cor, metal));
  m.castShadow = true;
  return m;
}
function esfera(r, cor, metal) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), material(cor, metal));
  m.castShadow = true;
  return m;
}
function cilindro(r, h, cor) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), material(cor));
  m.castShadow = true;
  return m;
}

/* ============================================================
   3) MONTAGEM DO GUERREIRO
   Ideia: cada articulação é um Group ("pivô"). A peça visível
   fica deslocada dentro do pivô. Girar o pivô = mexer a articulação.
   O personagem olha para +Z.
   ============================================================ */

const PELE = 0xe0b08c, ACO = 0x8a8f98, PANO = 0x7a1f1f, COURO = 0x5b3a1e, OURO = 0xd4af37;

const raiz = new THREE.Group();
scene.add(raiz);

// Quadril (tudo o resto é filho dele)
const quadril = new THREE.Group();
quadril.position.y = 0.95;
raiz.add(quadril);
quadril.add(caixa(0.6, 0.25, 0.35, 0x3a3a4a));

// Pernas
function criarPerna(x) {
  const perna = new THREE.Group();
  perna.position.set(x, -0.05, 0);
  const coxa = caixa(0.24, 0.85, 0.26, 0x4a4a5a);
  coxa.position.y = -0.42;
  const bota = caixa(0.28, 0.14, 0.4, 0x2b1d12);
  bota.position.set(0, -0.8, 0.06);
  perna.add(coxa, bota);
  quadril.add(perna);
  return perna;
}
const pernaEsq = criarPerna(0.17);   // esquerda do personagem
const pernaDir = criarPerna(-0.17);  // direita do personagem

// Tronco
const tronco = new THREE.Group();
tronco.position.y = 0.1;
quadril.add(tronco);
const peito = caixa(0.72, 0.8, 0.4, ACO, 0.4);
peito.position.y = 0.4;
const cinto = caixa(0.74, 0.1, 0.42, COURO);
cinto.position.y = 0.05;
tronco.add(peito, cinto);

// Cabeça
const cabeca = new THREE.Group();
cabeca.position.y = 1.02;
tronco.add(cabeca);
cabeca.add(esfera(0.2, PELE));
const capacete = new THREE.Mesh(
  new THREE.SphereGeometry(0.23, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
  material(ACO, 0.4)
);
capacete.position.y = 0.03;
capacete.castShadow = true;
const crista = caixa(0.05, 0.14, 0.3, 0xb91c1c);
crista.position.y = 0.26;
cabeca.add(capacete, crista);
for (const x of [-0.07, 0.07]) {
  const olho = esfera(0.025, 0x111111);
  olho.position.set(x, 0.0, 0.18);
  cabeca.add(olho);
}

// Braços (ombro -> cotovelo -> pulso). lado: -1 = direito, +1 = esquerdo do personagem
function criarBraco(lado) {
  const ombro = new THREE.Group();
  ombro.position.set(0.47 * lado, 0.7, 0);
  tronco.add(ombro);
  ombro.add(esfera(0.13, ACO, 0.4));
  const superior = caixa(0.17, 0.35, 0.17, PANO);
  superior.position.y = -0.18;
  ombro.add(superior);

  const cotovelo = new THREE.Group();
  cotovelo.position.y = -0.36;
  ombro.add(cotovelo);
  const antebraco = caixa(0.15, 0.34, 0.15, ACO, 0.4);
  antebraco.position.y = -0.17;
  cotovelo.add(antebraco);

  const pulso = new THREE.Group();
  pulso.position.y = -0.35;
  cotovelo.add(pulso);
  pulso.add(esfera(0.085, PELE));

  return { ombro, cotovelo, pulso };
}
const bracoDir = criarBraco(-1); // o que segura a espada
const bracoEsq = criarBraco(1);

/* ---------- Espada (a lâmina aponta para +Y local) ---------- */
const espada = new THREE.Group();
const cabo = cilindro(0.025, 0.24, COURO);
const guarda = caixa(0.3, 0.04, 0.06, OURO, 0.5);
guarda.position.y = 0.14;
const lamina = caixa(0.07, 0.85, 0.02, 0xdfe6ea, 0.5);
lamina.position.y = 0.585;
const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.0707, 0.12, 4), material(0xdfe6ea, 0.5));
ponta.rotation.y = Math.PI / 4;
ponta.scale.z = 0.3;
ponta.position.y = 1.07;
ponta.castShadow = true;
const pomo = esfera(0.04, OURO, 0.5);
pomo.position.y = -0.14;
espada.add(cabo, guarda, lamina, ponta, pomo);

/* ---------- "Encaixes" onde a espada pode ficar ---------- */
// 1) Bainha no quadril direito (a lâmina fica apontando para baixo e um pouco para trás)
const encaixeBainha = new THREE.Group();
encaixeBainha.position.set(-0.56, 0.1, -0.06);
encaixeBainha.rotation.x = Math.PI + 0.35;
quadril.add(encaixeBainha);
const bainha = caixa(0.1, 1.0, 0.045, 0x3b2a1a);
bainha.position.y = 0.62;
encaixeBainha.add(bainha);

// 2) Mão direita (a lâmina sai "para cima" quando o antebraço está na horizontal)
const encaixeMao = new THREE.Group();
encaixeMao.rotation.x = Math.PI / 2;
bracoDir.pulso.add(encaixeMao);

// Começa embainhada
encaixeBainha.add(espada);
let espadaNaMao = false;

/* ============================================================
   4) POSES
   Cada pose é um conjunto de ângulos (em radianos).
   Dicas de sinal (personagem olhando para +Z):
     - ombro X negativo  -> braço vai para a frente/cima
     - ombro X positivo  -> braço vai para trás
     - ombro Z (direito) negativo -> braço abre para o lado
     - cotovelo negativo -> dobra o antebraço para a frente
     - pulso positivo    -> a lâmina inclina para baixo
     - tronco Y positivo -> gira para a esquerda do personagem
   Se algum movimento ficar estranho, é só mudar os números aqui.
   ============================================================ */

const REST = {
  bob: 0, torsoX: 0, torsoY: 0, legL: 0, legR: 0,
  rShX: 0.05, rShY: 0, rShZ: -0.1, rEl: -0.1, rWr: 0,
  lShX: 0.05, lShY: 0, lShZ: 0.1, lEl: -0.1,
};

// Posição de guarda (espada na mão, pronto para lutar)
const PRONTO = {
  rShX: -0.6, rShZ: -0.2, rEl: -0.7, rWr: 0,
  lShX: -0.3, lShZ: 0.35, lEl: -0.9,
  torsoY: 0.15, legL: -0.2, legR: 0.2,
};

const suavizar = (k) => { k = Math.min(Math.max(k, 0), 1); return k * k * (3 - 2 * k); };

// Cria uma função que interpola entre vários "quadros-chave" no tempo
function quadros(lista) {
  const cheios = lista.map((f) => ({ ...REST, ...f }));
  const duracao = cheios[cheios.length - 1].t;
  return (t) => {
    t = Math.min(t, duracao);
    let i = 0;
    while (i < cheios.length - 2 && t > cheios[i + 1].t) i++;
    const a = cheios[i], b = cheios[i + 1];
    let k = (t - a.t) / (b.t - a.t);
    k = b.rapido ? Math.min(Math.max(k, 0), 1) ** 3 : suavizar(k); // golpe: acelera
    const saida = {};
    for (const c in REST) saida[c] = a[c] + (b[c] - a[c]) * k;
    return saida;
  };
}

/* ============================================================
   5) AS ANIMAÇÕES
   ============================================================ */

const REACH = { rShX: 0.2, rShZ: -0.15, rEl: -0.25, rWr: 1.95, torsoY: -0.1 }; // mão no cabo da espada
const LIVRE = { rShX: -0.5, rShZ: -0.2, rEl: -0.6, rWr: 1.1, torsoY: 0.05, lShZ: 0.2 }; // espada fora da bainha
const PREPARA = { rShX: -2.4, rShZ: -0.3, rEl: -0.3, rWr: 0, torsoY: -0.5, lShX: 0.3, lShZ: 0.4, lEl: -0.5, legL: -0.25, legR: 0.25 };
const GOLPE = { rShX: -1.0, rShZ: 0.2, rEl: -0.2, rWr: 1.7, torsoY: 0.6, lShX: 0.4, lShZ: 0.5, lEl: -0.1, legL: -0.3, legR: 0.3 };

const animacoes = {
  idle: {
    loop: true,
    sample: (t) => {
      const p = { ...REST, ...(espadaNaMao ? PRONTO : {}) };
      p.torsoX += 0.015 * Math.sin(t * 2);
      p.rShX += 0.02 * Math.sin(t * 2 + 1);
      p.lShX += 0.02 * Math.sin(t * 2 + 2);
      p.bob = 0.005 * Math.sin(t * 2);
      return p;
    },
  },

  sacar: {
    dur: 1.4,
    sample: quadros([
      { t: 0 },
      { t: 0.45, ...REACH },
      { t: 0.6, ...REACH },
      { t: 1.0, ...LIVRE },
      { t: 1.4, ...PRONTO },
    ]),
    eventos: [{ t: 0.5, fn: () => montarEspada(encaixeMao, 0.15) }],
  },

  brandir: {
    dur: 2.6,
    sample: quadros([
      { t: 0, ...PRONTO },
      { t: 0.5, ...PREPARA },
      { t: 0.75, ...GOLPE, rapido: true },
      { t: 0.95, ...GOLPE },
      { t: 1.4, ...PREPARA, torsoY: -0.8 },
      { t: 1.65, ...GOLPE, torsoY: 0.8, rapido: true },
      { t: 1.9, ...GOLPE, torsoY: 0.8 },
      { t: 2.6, ...PRONTO },
    ]),
  },

  guardar: {
    dur: 1.6,
    sample: quadros([
      { t: 0, ...PRONTO },
      { t: 0.5, ...LIVRE },
      { t: 1.0, ...REACH },
      { t: 1.15, ...REACH },
      { t: 1.6 },
    ]),
    eventos: [{ t: 1.05, fn: () => montarEspada(encaixeBainha, 0.15) }],
  },
};

/* ============================================================
   6) TROCAR A ESPADA DE LUGAR (bainha <-> mão)
   ============================================================ */

const ZERO = new THREE.Vector3();
const IDENT = new THREE.Quaternion();
let transicaoEspada = null;

function montarEspada(encaixe, duracao) {
  encaixe.updateWorldMatrix(true, false);
  espada.updateWorldMatrix(true, false);
  encaixe.attach(espada); // muda de pai mantendo a posição no mundo
  espadaNaMao = encaixe === encaixeMao;
  // depois desliza suavemente até o encaixe perfeito
  transicaoEspada = { t: 0, dur: duracao, p: espada.position.clone(), q: espada.quaternion.clone() };
}

/* ============================================================
   7) "TOCADOR" DE ANIMAÇÕES
   ============================================================ */

const MISTURA = 0.25; // segundos de transição entre animações
let atual = 'idle';
let tempo = 0;
let de = { ...REST };
let mistura = 1;
let fila = [];
const poseSaida = { ...REST };

function iniciar(nome) {
  de = { ...poseSaida };
  atual = nome;
  tempo = 0;
  mistura = 0;
  destacarBotao(nome);
}

function tocar(nome) {
  fila = [];
  if (nome === 'sacar' && espadaNaMao) return;
  if (nome === 'guardar' && !espadaNaMao) return;
  if (nome === 'brandir' && !espadaNaMao) { fila = ['brandir']; nome = 'sacar'; }
  iniciar(nome);
}

function sequenciaCompleta() {
  if (espadaNaMao) { fila = ['guardar']; iniciar('brandir'); }
  else { fila = ['brandir', 'guardar']; iniciar('sacar'); }
}

function aplicarPose(p) {
  quadril.position.y = 0.95 + p.bob;
  tronco.rotation.set(p.torsoX, p.torsoY, 0);
  pernaEsq.rotation.x = p.legL;
  pernaDir.rotation.x = p.legR;
  bracoDir.ombro.rotation.set(p.rShX, p.rShY, p.rShZ);
  bracoDir.cotovelo.rotation.x = p.rEl;
  bracoDir.pulso.rotation.x = p.rWr;
  bracoEsq.ombro.rotation.set(p.lShX, p.lShY, p.lShZ);
  bracoEsq.cotovelo.rotation.x = p.lEl;
}

function atualizar(dt) {
  const anim = animacoes[atual];
  const antes = tempo;
  tempo += dt;

  if (anim.eventos) {
    for (const e of anim.eventos) if (antes < e.t && tempo >= e.t) e.fn();
  }
  if (!anim.loop && tempo >= anim.dur) iniciar(fila.shift() ?? 'idle');

  const alvo = animacoes[atual].sample(tempo);
  mistura = Math.min(mistura + dt / MISTURA, 1);
  const k = suavizar(mistura);
  for (const c in REST) poseSaida[c] = de[c] + (alvo[c] - de[c]) * k;
  aplicarPose(poseSaida);

  if (transicaoEspada) {
    transicaoEspada.t += dt;
    const kk = Math.min(transicaoEspada.t / transicaoEspada.dur, 1);
    espada.position.lerpVectors(transicaoEspada.p, ZERO, kk);
    espada.quaternion.copy(transicaoEspada.q).slerp(IDENT, kk);
    if (kk >= 1) transicaoEspada = null;
  }
}

/* ============================================================
   8) BOTÕES
   ============================================================ */

const painel = document.getElementById('painel');
const botoes = {};
const lista = [
  ['idle', 'Parado (respirando)'],
  ['sacar', 'Sacar a espada'],
  ['brandir', 'Brandir a espada'],
  ['guardar', 'Guardar a espada'],
];
for (const [nome, rotulo] of lista) {
  const b = document.createElement('button');
  b.textContent = rotulo;
  b.onclick = () => tocar(nome);
  painel.appendChild(b);
  botoes[nome] = b;
}
const bSeq = document.createElement('button');
bSeq.textContent = 'Sequência completa';
bSeq.className = 'seq';
bSeq.onclick = sequenciaCompleta;
painel.appendChild(bSeq);

function destacarBotao(nome) {
  for (const n in botoes) botoes[n].classList.toggle('ativo', n === nome);
}
destacarBotao('idle');

/* ============================================================
   9) LOOP PRINCIPAL
   ============================================================ */

const relogio = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  atualizar(Math.min(relogio.getDelta(), 0.05));
  controls.update();
  renderer.render(scene, camera);
}
loop();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
