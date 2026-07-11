const pairs = [
  {
    field: "biologico",
    campo: "Campo biológico",
    fator: "Dor por imobilidade prolongada"
  },
  {
    field: "biologico",
    campo: "Campo biológico",
    fator: "Procedimentos invasivos"
  },
  {
    field: "biologico",
    campo: "Campo biológico",
    fator: "Tensão muscular e rigidez"
  },
  {
    field: "emocional",
    campo: "Campo emocional",
    fator: "Medo da piora clínica"
  },
  {
    field: "emocional",
    campo: "Campo emocional",
    fator: "Ansiedade antes da mobilização"
  },
  {
    field: "emocional",
    campo: "Campo emocional",
    fator: "Insônia e hipervigilância"
  },
  {
    field: "social",
    campo: "Campo social",
    fator: "Preocupação financeira familiar"
  },
  {
    field: "social",
    campo: "Campo social",
    fator: "Isolamento da família"
  },
  {
    field: "social",
    campo: "Campo social",
    fator: "Notícia difícil durante visita"
  },
  {
    field: "biopsicossocial",
    campo: "Campo biopsicossocial",
    fator: "Dor influenciada por corpo, emoções e contexto"
  }
];

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matches = 0;
let timeLeft = 120;
let timerInterval;
let playerName = "";

const intro = document.getElementById("intro");
const videoScreen = document.getElementById("video-screen");
const introVideo = document.getElementById("intro-video");
const gameArea = document.getElementById("game-area");
const board = document.getElementById("memory-board");
const feedback = document.getElementById("feedback");
const timerDisplay = document.getElementById("timer");
const matchesDisplay = document.getElementById("matches");
const playerInput = document.getElementById("player-name");
const playerDisplay = document.getElementById("player-display");
const finalScreen = document.getElementById("final-screen");
const finalEmoji = document.getElementById("final-emoji");
const finalTitle = document.getElementById("final-title");
const finalMessage = document.getElementById("final-message");
const gameContainer = document.getElementById("game-container");
const soundBg = document.getElementById("sound-bg");
const instructionsModal = document.getElementById("instructions-modal");
const instructionsBtn = document.getElementById("instructions-btn");
const closeInstructionsBtn = document.getElementById("close-instructions-btn");
const listenInstructionsBtn = document.getElementById("listen-instructions-btn");
const soundCorrect = new Audio("audio/acerto.mp3");
const soundWrong = new Audio("audio/erro.mp3");
const soundTime = new Audio("audio/time.mp3");
const soundFinal = new Audio("audio/final.mp3");
const soundGameOver = new Audio("audio/gameover.mp3");
const soundInstructions = new Audio("audio/instrucaomemoria.mp3");
let timeWarningPlayed = false;

[soundCorrect, soundWrong, soundTime, soundFinal, soundGameOver, soundInstructions].forEach(sound => {
  sound.preload = "auto";
});

soundCorrect.volume = 0.8;
soundWrong.volume = 0.8;
soundTime.volume = 0.9;
soundFinal.volume = 0.9;
soundGameOver.volume = 0.9;
soundInstructions.volume = 0.95;

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function openInstructions() {
  instructionsModal.hidden = false;
}

function closeInstructions() {
  instructionsModal.hidden = true;
  stopInstructionsAudio();
}

function setInstructionsButtonListening(isListening) {
  listenInstructionsBtn.textContent = isListening ? "Ouvindo..." : "Ouvir Instruções";
}

function playInstructionsAudio() {
  introVideo.pause();
  setInstructionsButtonListening(true);
  playSound(soundInstructions);
}

function stopInstructionsAudio() {
  soundInstructions.pause();
  soundInstructions.currentTime = 0;
  setInstructionsButtonListening(false);
}

function getCardBackContent(card) {
  const fieldImages = {
    biologico: "img/biologico.jpg",
    emocional: "img/emocional.jpg",
    social: "img/social.jpg",
    biopsicossocial: "img/bps.png"
  };

  if (card.type === "campo" && fieldImages[card.field]) {
    return `<img class="field-card-image" src="${fieldImages[card.field]}" alt="${card.text}">`;
  }

  return card.text;
}

instructionsBtn.addEventListener("click", openInstructions);
listenInstructionsBtn.addEventListener("click", playInstructionsAudio);
soundInstructions.addEventListener("ended", () => setInstructionsButtonListening(false));
closeInstructionsBtn.addEventListener("click", closeInstructions);

instructionsModal.addEventListener("click", event => {
  if (event.target === instructionsModal) {
    closeInstructions();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !instructionsModal.hidden) {
    closeInstructions();
  }
});

// BOTÃO DA TELA 1 → ABRE TELA DO VÍDEO
document.getElementById("start-intro-btn").addEventListener("click", () => {
  intro.style.display = "none";
  videoScreen.style.display = "flex";
  introVideo.play();
});

// BOTÃO DA TELA 2 → COMEÇA O JOGO
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  playerName = playerInput.value.trim();

  if (playerName === "") {
    alert("Digite seu nome para começar.");
    return;
  }

  stopInstructionsAudio();
  videoScreen.style.display = "none";
  gameArea.style.display = "block";
  playerDisplay.innerHTML = playerName;

  introVideo.pause();

  soundBg.volume = 0.25;
  soundBg.play();

  timeWarningPlayed = false;
  createCards();
  startTimer();
}

function createCards() {
  cards = [];

  pairs.forEach(pair => {
    cards.push({
      field: pair.field,
      type: "campo",
      text: pair.campo
    });

    cards.push({
      field: pair.field,
      type: "fator",
      text: pair.fator
    });
  });

  cards.sort(() => Math.random() - 0.5);

  board.innerHTML = "";

  cards.forEach((card, index) => {
    const cardElement = document.createElement("div");

    cardElement.classList.add("card");
    cardElement.dataset.field = card.field;
    cardElement.dataset.type = card.type;
    cardElement.dataset.index = index;
    const cardBackContent = getCardBackContent(card);
    const imageCardClass = card.type === "campo" && ["biologico", "emocional", "social", "biopsicossocial"].includes(card.field)
      ? " image-field"
      : "";

    cardElement.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="img/icon-192.png" alt="MANEJA DOR">
        </div>
        <div class="card-back ${card.type}${imageCardClass}">
          ${cardBackContent}
        </div>
      </div>
    `;

    cardElement.addEventListener("click", () => flipCard(cardElement));

    board.appendChild(cardElement);
  });
}

function flipCard(card) {
  if (lockBoard) return;
  if (card.classList.contains("flipped")) return;
  if (card.classList.contains("matched")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  checkMatch();
}

function checkMatch() {
  lockBoard = true;

  const sameField = firstCard.dataset.field === secondCard.dataset.field;
  const differentType = firstCard.dataset.type !== secondCard.dataset.type;
  const sameType = firstCard.dataset.type === secondCard.dataset.type;

  if (sameField && differentType) {
    playSound(soundCorrect);

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    const matchedCards = [firstCard, secondCard];

    matches++;
    matchesDisplay.innerHTML = matches;

    feedback.classList.remove("negative-alert");
    feedback.style.background = "#c8e6c9";
    feedback.innerHTML = "Combinação correta! Esse fator pertence ao campo selecionado.";

    resetTurn();

    if (matches === pairs.length) {
      finishGame(true);
    } else {
      setTimeout(() => {
        matchedCards.forEach(card => card.classList.add("found"));
      }, 1100);
    }

  } else {
    playSound(soundWrong);

    feedback.style.background = "#ffcdd2";
    feedback.innerHTML = sameType
      ? "Atenção! Você virou dois cards do mesmo tipo. Escolha um campo e um fator correspondente."
      : "Ainda não! Esse fator pertence a outro campo da abordagem ampliada da dor.";
    feedback.classList.remove("negative-alert");
    void feedback.offsetWidth;
    feedback.classList.add("negative-alert");

    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 900);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.innerHTML = timeLeft;

    if (timeLeft <= 10) {
      timerDisplay.style.color = "#d50000";

      if (!timeWarningPlayed) {
        timeWarningPlayed = true;
        playSound(soundTime);
      }
    }

    if (timeLeft <= 0) {
      finishGame(false);
    }
  }, 1000);
}

function finishGame(won) {
  clearInterval(timerInterval);
  gameArea.style.display = "none";
  finalScreen.style.display = "grid";
  finalScreen.classList.toggle("won", won);
  finalScreen.classList.toggle("lost", !won);
  soundBg.pause();
  soundTime.pause();
  soundTime.currentTime = 0;

  if (won) {
    playSound(soundFinal);

    finalEmoji.innerHTML = "🏆";
    finalTitle.innerHTML = "Parabéns!";
    finalMessage.innerHTML = `
      ${playerName}, você está rápido para identificar fatores dos três campos
      da abordagem ampliada da dor.
    `;
    createConfetti(140);
  } else {
    playSound(soundGameOver);

    finalEmoji.innerHTML = "😢";
    finalTitle.innerHTML = "Tempo esgotado!";
    finalMessage.innerHTML = `
      ${playerName}, precisa melhorar sua memória e seu tempo para reconhecer
      os fatores biopsicossociais que influenciam a dor.
    `;
  }
}

function createConfetti(num) {
  for (let i = 0; i < num; i++) {
    const conf = document.createElement("div");
    conf.classList.add("confetti");
    conf.style.left = Math.random() * 100 + "%";
    conf.style.backgroundColor = `hsl(${Math.random() * 360},100%,50%)`;
    conf.style.animationDuration = (2 + Math.random() * 3) + "s";
    conf.style.width = conf.style.height = (6 + Math.random() * 10) + "px";
    gameContainer.appendChild(conf);
  }
}
