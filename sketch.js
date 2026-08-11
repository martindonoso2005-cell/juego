// Variables de Audio y Reconocimiento
let mic;
let amp;
let fft;
let recognition;

// Estado del Juego
let gameState = "START"; // "START", "PLAYING", "GAMEOVER"
let audioStarted = false;
let score = 0;
let highScore = 0;
let frameCounter = 0;

let lastSpeech = "Di 'HOLA' para saltar";
let shouldJump = false;         // Bandera de disparo por voz
let detectedWordEffect = false; // Efecto visual cuando dice Hola

// Entidades del Juego
let player;
let obstacles = [];

function setup() {
  createCanvas(800, 450);

  // 1. Configurar Reconocimiento de Voz Nativo
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true; // Activo para respuesta inmediata al hablar

    recognition.onresult = function(event) {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      
      let text = currentTranscript.toLowerCase().trim();
      lastSpeech = currentTranscript;

      // --- FILTRO: SOLO SALTA SI CONTIENE LA PALABRA "HOLA" ---
      if (text.includes("hola")) {
        shouldJump = true;
        detectedWordEffect = true;
        setTimeout(() => { detectedWordEffect = false; }, 600); // Apagar indicador
      }
    };

    recognition.onend = function() {
      if (audioStarted) try { recognition.start(); } catch(e) {}
    };
  }

  // 2. Analizadores de p5.sound (para visualizador de ondas)
  mic = new p5.AudioIn();
  amp = new p5.Amplitude();
  fft = new p5.FFT(0.8, 16);

  player = new Player();
}

function draw() {
  background(15, 23, 42);

  if (!audioStarted) {
    drawStartScreen();
    return;
  }

  // --- ANÁLISIS DE AUDIO (Solo visual) ---
  let level = amp.getLevel();
  let spectrum = fft.analyze();

  // --- LÓGICA DEL JUEGO ---
  if (gameState === "PLAYING") {
    // LÓGICA DE SALTO: Solo si detectó "HOLA"
    if (shouldJump) {
      player.jump();
      shouldJump = false; // Resetear evento de salto
    }

    player.update();

    // Crear obstáculos periódicamente
    frameCounter++;
    if (frameCounter % 90 === 0) {
      obstacles.push(new Obstacle());
    }

    // Actualizar obstáculos y detectar colisiones
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update();

      if (obstacles[i].hits(player)) {
        gameState = "GAMEOVER";
        if (score > highScore) highScore = score;
      }

      if (obstacles[i].offscreen()) {
        obstacles.splice(i, 1);
        score++;
      }
    }
  } else if (gameState === "GAMEOVER" && shouldJump) {
    shouldJump = false;
    resetGame();
  }

  // --- DIBUJAR ELEMENTOS ---
  drawGround();
  player.draw(detectedWordEffect);
  
  for (let obs of obstacles) {
    obs.draw();
  }

  // Interfaz superior HUD
  drawHUD(level, spectrum);

  if (gameState === "GAMEOVER") {
    drawGameOverScreen();
  }
}

// --- CLASE JUGADOR ---
class Player {
  constructor() {
    this.r = 40;
    this.x = 80;
    this.y = height - 50 - this.r;
    this.vy = 0;
    this.gravity = 0.8;
    this.isGrounded = true;
  }

  jump() {
    if (this.isGrounded) {
      this.vy = -14;
      this.isGrounded = false;
    }
  }

  update() {
    this.vy += this.gravity;
    this.y += this.vy;

    let floorY = height - 50 - this.r;
    if (this.y >= floorY) {
      this.y = floorY;
      this.vy = 0;
      this.isGrounded = true;
    }
  }

  draw(isWordActive) {
    // Efecto de aura verde cuando dices "HOLA"
    if (isWordActive) {
      noFill();
      stroke(34, 197, 94, 220);
      strokeWeight(4);
      ellipse(this.x + this.r / 2, this.y + this.r / 2, this.r * 1.7);
    }

    fill(56, 189, 248);
    stroke(255);
    strokeWeight(2);
    rect(this.x, this.y, this.r, this.r, 8);

    // Ojos
    fill(255);
    noStroke();
    ellipse(this.x + 28, this.y + 12, 8, 8);
    fill(0);
    ellipse(this.x + 30, this.y + 12, 4, 4);
  }
}

// --- CLASE OBSTÁCULO ---
class Obstacle {
  constructor() {
    this.w = 30;
    this.h = random(35, 65);
    this.x = width;
    this.y = height - 50 - this.h;
    this.speed = 6 + score * 0.2;
  }

  update() {
    this.x -= this.speed;
  }

  offscreen() {
    return this.x < -this.w;
  }

  hits(player) {
    return (
      player.x < this.x + this.w &&
      player.x + player.r > this.x &&
      player.y < this.y + this.h &&
      player.y + player.r > this.y
    );
  }

  draw() {
    fill(239, 68, 68);
    stroke(255);
    strokeWeight(2);
    rect(this.x, this.y, this.w, this.h, 6);
  }
}

// --- INTERFAZ Y PANTALLAS ---
function drawGround() {
  stroke(51, 65, 85);
  strokeWeight(4);
  line(0, height - 50, width, height - 50);
}

function drawHUD(level, spectrum) {
  noStroke();
  fill(30, 41, 59, 240);
  rect(15, 12, width - 30, 80, 10);

  // 1. PUNTUACIÓN
  textAlign(LEFT, TOP);
  fill(255);
  textSize(16);
  textStyle(BOLD);
  text(`Puntos: ${score}`, 28, 22);
  
  fill(148, 163, 184);
  textSize(11);
  text(`Máximo: ${highScore}`, 28, 45);

  // 2. PALABRA CLAVE Y TRANSCRIPCIÓN
  fill(56, 189, 248);
  textSize(12);
  textStyle(NORMAL);
  textAlign(CENTER, TOP);
  text(`Escuchado: "${lastSpeech}"`, width / 2 - 20, 24);

  // 3. INDICADOR DE ACTIVACIÓN POR LA PALABRA HOLA
  if (detectedWordEffect) {
    fill(34, 197, 94); // Verde brillante
    rect(width / 2 - 80, 48, 120, 24, 6);
    fill(0);
    textSize(11);
    textStyle(BOLD);
    text("🗣️ ¡DIJO HOLA!", width / 2 - 20, 54);
  } else {
    fill(51, 65, 85);
    rect(width / 2 - 80, 48, 120, 24, 6);
    fill(148, 163, 184);
    textSize(10);
    textStyle(NORMAL);
    text("Di 'HOLA' para saltar", width / 2 - 20, 54);
  }

  // 4. MONITOR DE MICRÓFONO
  let visX = width - 230;
  let visY = 22;
  let visW = 200;
  let visH = 45;

  fill(15, 23, 42);
  stroke(51, 65, 85);
  strokeWeight(1);
  rect(visX, visY, visW, visH, 6);

  noStroke();
  let barW = visW / spectrum.length;
  for (let i = 0; i < spectrum.length; i++) {
    let barH = map(spectrum[i], 0, 255, 0, visH - 8);
    fill(56, 189, 248, 150);
    rect(visX + i * barW + 1, visY + visH - barH - 2, barW - 1, barH);
  }
}

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(56, 189, 248);
  textSize(24);
  textStyle(BOLD);
  text("🎮 JUEGO: SALTA DICIENDO 'HOLA'", width / 2, height / 2 - 20);

  fill(255);
  textSize(14);
  textStyle(NORMAL);
  text("El personaje solo saltará cuando digas la palabra 'HOLA'.", width / 2, height / 2 + 15);

  fill(148, 163, 184);
  textSize(12);
  text("👉 Haz clic para iniciar 👈", width / 2, height / 2 + 50);
}

function drawGameOverScreen() {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(239, 68, 68);
  textSize(32);
  textStyle(BOLD);
  text("¡GAME OVER!", width / 2, height / 2 - 30);

  fill(255);
  textSize(16);
  textStyle(NORMAL);
  text(`Puntuación final: ${score}`, width / 2, height / 2 + 10);

  fill(56, 189, 248);
  textSize(13);
  text("Di 'HOLA' o haz clic para volver a jugar", width / 2, height / 2 + 45);
}

function resetGame() {
  score = 0;
  obstacles = [];
  frameCounter = 0;
  player = new Player();
  gameState = "PLAYING";
}

function mousePressed() {
  if (!audioStarted) {
    userStartAudio();
    mic.start();
    amp.setInput(mic);
    fft.setInput(mic);
    if (recognition) try { recognition.start(); } catch(e) {}
    audioStarted = true;
    resetGame();
  } else if (gameState === "GAMEOVER") {
    resetGame();
  }
}