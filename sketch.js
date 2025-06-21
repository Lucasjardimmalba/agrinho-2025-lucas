// Variáveis principais
let arvoresCidade = 0;
let qualidadeVida = 50;
let energiaVerde = 10;
let fase = 1;
let fumaca = [];
let carros = [];
let gameOver = false;
let venceu = false;
let tempoMensagem = 0;
let mensagemFase = "";

let jogoIniciado = false; // controla a tela inicial

let btnArvore, btnPoluicao, btnComecar;

function setup() {
  createCanvas(600, 400);
  
  // Botão começar (aparece na tela inicial)
  btnComecar = createButton("Começar");
  btnComecar.position(width / 2 - 40, height / 2 + 80);
  btnComecar.mousePressed(iniciarJogo);
  
  // Botões do jogo (escondidos até iniciar o jogo)
  btnArvore = createButton("🌳 Plantar Árvore (-1 energia)");
  btnArvore.position(20, height + 20);
  btnArvore.mousePressed(plantarArvore);
  btnArvore.hide();

  btnPoluicao = createButton("☁️ Criar Poluição (+1 energia)");
  btnPoluicao.position(240, height + 20);
  btnPoluicao.mousePressed(criarPoluicao);
  btnPoluicao.hide();
}

function draw() {
  background(220);

  if (!jogoIniciado) {
    telaInicial();
    return;
  }
  
  if (gameOver || venceu) {
    textSize(28);
    fill(0);
    textAlign(CENTER, CENTER);
    text(venceu ? "Você Venceu! 🌱" : "Game Over 💀", width / 2, height / 2 - 30);
    textSize(16);
    if (venceu) {
      text("Aperte PLAY para jogar novamente.", width / 2, height / 2 + 10);
    } else {
      text("Clique F5 para tentar novamente.", width / 2, height / 2 + 10);
    }
    noLoop();
    return;
  }

  // Mostrar mensagem de fase (3 segundos)
  if (mensagemFase && millis() - tempoMensagem < 3000) {
    fill(0, 150, 0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(mensagemFase, width / 2, height / 2);
  }

  // Fundo campo
  fill(150, 200, 100);
  rect(0, 0, width / 2, height);
  fill(0);
  textSize(16);
  text("Campo", 20, 20);
  
  // Instruções na área verde do campo
  textSize(12);
  text("Instruções:", 20, 50);
  text("- 🌳 Planta árvore e reduz poluição", 20, 70);
  text("- ☁️ Cria poluição e ganha energia", 20, 85);
  text("- Avance de fase plantando árvores e mantendo qualidade", 20, 100);

  // Fundo cidade
  fill(180);
  rect(width / 2, 0, width / 2, height);
  fill(0);
  textSize(16);
  text("Cidade", width / 2 + 20, 20);
  text("Fase: " + fase, width - 80, 20);

  // Prédios com janelas piscando
  drawPrediosComJanelas();

  // Árvores na cidade
  for (let i = 0; i < arvoresCidade; i++) {
    drawArvore(width / 2 + 30 + i * 20, 350);
  }

  // Atualizar e desenhar carros
  for (let carro of carros) {
    carro.mover();
    carro.emitirFumaca();
    carro.desenhar();
  }

  // Atualizar e desenhar fumaça
  for (let i = fumaca.length - 1; i >= 0; i--) {
    fumaca[i].atualizar();
    fumaca[i].desenhar();
    if (fumaca[i].estaForaDaTela()) fumaca.splice(i, 1);
  }

  // Atualizar qualidade de vida e energia
  qualidadeVida = constrain(50 + arvoresCidade * 5 - fumaca.length * 1.2, 0, 100);
  energiaVerde = constrain(energiaVerde, 0, 20);

  // Mostrar indicadores na tela
  fill(0);
  textSize(14);
  text("Qualidade de Vida: " + qualidadeVida.toFixed(0) + "%", 20, 150);
  text("Energia Verde: " + energiaVerde, 20, 170);
  fill(lerpColor(color(255, 0, 0), color(0, 200, 0), qualidadeVida / 100));
  rect(20, 180, map(qualidadeVida, 0, 100, 0, 150), 15);

  // Checar avanços de fase e fim de jogo
  checarFases();
}

function telaInicial() {
  background(150, 200, 100);
  fill(0);
  textAlign(CENTER, TOP);
  textSize(28);
  text("Como funciona", width / 2, 50);

  textSize(16);
  textAlign(LEFT, TOP);
  let txt =
    "Bem-vindo ao jogo!\n\n" +
    "Objetivo:\n" +
    "- Plante árvores para reduzir a poluição e aumentar a qualidade de vida.\n" +
    "- Crie poluição para ganhar energia, mas cuidado para não exagerar!\n" +
    "- Avance pelas fases plantando mais árvores e mantendo a cidade saudável.\n\n" +
    "Fases:\n" +
    "1. Plante 15 árvores e mantenha qualidade ≥ 80% para avançar.\n" +
    "2. Plante 25 árvores e mantenha qualidade ≥ 85% para avançar.\n" +
    "3. Plante 35 árvores e mantenha qualidade ≥ 90% para vencer.\n\n" +
    "Use os botões abaixo para plantar árvores e criar poluição.\n" +
    "Boa sorte!";

  text(txt, 40, 110, width - 80, height - 120);
}

function iniciarJogo() {
  jogoIniciado = true;
  btnComecar.hide();
  btnArvore.show();
  btnPoluicao.show();

  // Inicializar carros
  carros = [];
  for (let i = 0; i < 3; i++) {
    carros.push(new Carro());
  }
}

function checarFases() {
  if (qualidadeVida <= 0) {
    gameOver = true;
    return;
  }

  if (fase === 1 && arvoresCidade >= 15 && qualidadeVida >= 80) {
    fase = 2;
    energiaVerde = 10;
    carros.push(new Carro());
    mostrarMensagem("Parabéns! Você avançou para a Fase 2!");
  } else if (fase === 2 && arvoresCidade >= 25 && qualidadeVida >= 85) {
    fase = 3;
    energiaVerde = 10;
    carros.push(new Carro());
    mostrarMensagem("Parabéns! Você avançou para a Fase 3!");
  } else if (fase === 3 && arvoresCidade >= 35 && qualidadeVida >= 90) {
    venceu = true;
  }
}

function mostrarMensagem(texto) {
  mensagemFase = texto;
  tempoMensagem = millis();
}

function plantarArvore() {
  if (energiaVerde > 0) {
    arvoresCidade++;
    energiaVerde--;
    for (let i = 0; i < 3; i++) {
      if (fumaca.length > 0) fumaca.shift();
    }
  }
}

function criarPoluicao() {
  fumaca.push(new Fumaca(random(width / 2 + 50, width - 50), 180));
  energiaVerde++;
}

function drawArvore(x, y) {
  fill(120, 70, 15);
  rect(x, y, 10, 30);
  fill(30, 200, 30);
  ellipse(x + 5, y, 30, 30);
}

function drawPrediosComJanelas() {
  for (let i = 0; i < 4; i++) {
    let px = width / 2 + 30 + i * 60;
    let py = 200 - i * 20;
    let pw = 40;
    let ph = 200;
    fill(100);
    rect(px, py, pw, ph);

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        let wx = px + 5 + col * 8;
        let wy = py + 10 + row * 30;
        let acesa = random() > 0.5;
        fill(acesa ? color(255, 255, 150) : color(50));
        rect(wx, wy, 6, 20, 2);
      }
    }
  }
}

// Classes

class Carro {
  constructor() {
    this.x = width / 2 + random(-50, 150);
    this.y = 380;
    this.vel = random(1, 2);
    this.cor = color(random(50, 255), random(50, 255), random(50, 255));
  }

  mover() {
    this.x += this.vel;
    if (this.x > width) {
      this.x = width / 2 - 60;
      this.vel = random(1, 2);
    }
  }

  desenhar() {
    fill(this.cor);
    rect(this.x, this.y - 20, 50, 20, 5);
    fill(0);
    ellipse(this.x + 10, this.y, 15, 15);
    ellipse(this.x + 40, this.y, 15, 15);
  }

  emitirFumaca() {
    if (frameCount % floor(70 / this.vel) === 0) {
      fumaca.push(new Fumaca(this.x, this.y - 15));
    }
  }
}

class Fumaca {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanhoX = random(30, 40);
    this.tamanhoY = random(15, 20);
    this.alpha = 80;
  }

  atualizar() {
    this.y -= 1;
    this.x += random(-0.3, 0.3);
    this.alpha -= 0.3;
  }

  desenhar() {
    noStroke();
    fill(80, 80, 80, this.alpha);
    ellipse(this.x + random(-1, 1), this.y, this.tamanhoX, this.tamanhoY);
  }

  estaForaDaTela() {
    return this.y < 0 || this.alpha <= 0;
  }
}
