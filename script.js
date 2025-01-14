
// Vars

const main = document.querySelector(".main"),
      scoreElem = document.querySelector('.score'),
      levelElem = document.querySelector('.level'),
      nextTetroElem = document.querySelector('.next-tetro'),
      startBtn = document.getElementById("start"),
      pauseBtn = document.getElementById("pause"),
      gameOver = document.querySelector(".game-over");

let playfield = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

let currentLevel = 1;
let score = 0;
let gameTimerId;
let isPaused = true;
let possibleLevels = {
  1: {
    speed: 500,
    scorePerLine: 10,
    nextLevelScore: 50,
  },
  2: {
    speed: 400,
    scorePerLine: 15,
    nextLevelScore: 150,
  },
  3: {
    speed: 300,
    scorePerLine: 20,
    nextLevelScore: 250,
  },
  4: {
    speed: 200,
    scorePerLine: 30,
    nextLevelScore: 350,
  },
  5: {
    speed: 100,
    scorePerLine: 40,
    nextLevelScore: Infinity,
  }
}

// Obj of possible figures

let figures = {
  O: [
    [1, 1],
    [1, 1],
  ],
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
};

let activeTetro = getNewTetro();
let nextTetro = getNewTetro();

function draw() {
  let mainInnerHTML = "";
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        mainInnerHTML += '<div class="cell movingCell"></div>';
      } else if (playfield[y][x] === 2) {
        mainInnerHTML += '<div class="cell fixedCell"></div>';
      } else {
        mainInnerHTML += '<div class="cell"></div>';
      }
    }
  }
  main.innerHTML = mainInnerHTML;
}

function drawNextTetro() {
  let nextTetroInnerHTML = "";
  for (let y = 0; y < nextTetro.shape.length; y++) {
    for (let x = 0; x < nextTetro.shape[y].length; x++) {
      if (nextTetro.shape[y][x]) {
        nextTetroInnerHTML += '<div class="cell movingCell"></div>';
      } else {
        nextTetroInnerHTML += '<div class="cell"></div>';
      }
    }
    nextTetroInnerHTML += "<br/>";
  }
  nextTetroElem.innerHTML = nextTetroInnerHTML;
}

function removePrevActiveTetro() {
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        playfield[y][x] = 0;
      }
    }
  }
}

function addActiveTetro() {
  removePrevActiveTetro();

  for (let y = 0; y < activeTetro.shape.length; y++) {
    for (let x = 0; x < activeTetro.shape[y].length; x++) {
      if (activeTetro.shape[y][x]) {
        playfield[activeTetro.y + y][activeTetro.x + x] = activeTetro.shape[y][x];
      }
    }
  }
}

function rotateTetro() {
  const prevTetroState = activeTetro.shape;

  activeTetro.shape = activeTetro.shape[0].map((val, index) =>
    activeTetro.shape.map((row) => row[index]).reverse()
  );

  if (hasCollisions()) {
    activeTetro.shape = prevTetroState;
  }
}

// 

function hasCollisions() {
  for (let y = 0; y < activeTetro.shape.length; y++) {
    for (let x = 0; x < activeTetro.shape[y].length; x++) {
      if (
        activeTetro.shape[y][x] &&
        (playfield[activeTetro.y + y] === undefined ||
          playfield[activeTetro.y + y][activeTetro.x + x] === undefined ||
          playfield[activeTetro.y + y][activeTetro.x + x] === 2
          )
      ) {
        return true;
      }
    }
  }
  return false;
}

function removeFullLines() {
  let canRemoveLine = true;
  let filledLines = 0;
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] !== 2) {
        canRemoveLine = false;
        break;
      }
    }
    if (canRemoveLine) {
      playfield.splice(y, 1);
      playfield.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      filledLines += 1;
    }
    canRemoveLine = true;
  }

  
  switch(filledLines) {
      case 1:
      score += possibleLevels[currentLevel].scorePerLine;
      break;
      case 2:
      score += possibleLevels[currentLevel].scorePerLine * 3;
      break;
      case 3:
        score += possibleLevels[currentLevel].scorePerLine * 6;
      break;
      case 4:
        score += possibleLevels[currentLevel].scorePerLine * 12;
      break;
    }
    
    scoreElem.innerHTML = score;
    if (score >= possibleLevels[currentLevel].nextLevelScore) {
      currentLevel++;
      levelElem.innerHTML = currentLevel;
    }
    
  }

// Generate next figure
  
function getNewTetro() {
  const possibleTetro = "IOLJTSZ";
  const rand = Math.floor(Math.random() * 7);
  const newTetro = figures[possibleTetro[rand]];
  
  return {
    x: Math.floor((10 - newTetro[0].length) / 2),
    y: 0,
    shape: newTetro,
  };
}

// fix figure 

function fixTetro() {
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        playfield[y][x] = 2;
      }
    }
  }
}

// Move figure down

function moveTetroDown() {
  activeTetro.y += 1;
  if (hasCollisions()) {
    activeTetro.y -= 1;
    fixTetro();
    removeFullLines();
    activeTetro = nextTetro;
    if (hasCollisions()) {
      reset();
    }
    nextTetro = getNewTetro();
  }
}

function dropTetro() {
  for (let y = activeTetro.y; y < playfield.length; y++) {
    activeTetro.y += 1;
    if (hasCollisions()) {
      activeTetro.y -= 1;
      break;
    }
  }
}

function reset() {
  isPaused = true;
  clearTimeout(gameTimerID);
  playfield = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  draw();
  gameOver.style.display = "block";
}

// Listener for control figure

document.onkeydown = function (e) {
  if (!isPaused) {
    if (e.keyCode === 37) {
      activeTetro.x -= 1;
      if (hasCollisions()) {
        activeTetro.x += 1;
      }
    } else if (e.keyCode === 39) {
      activeTetro.x += 1;
      if (hasCollisions()) {
        activeTetro.x -= 1;
      }
    } else if (e.keyCode === 40) {
      moveTetroDown();
    } else if (e.keyCode === 38) {
      rotateTetro();
    } else if (e.keyCode === 32) {
      dropTetro();
    }

    updateGameState();
  }
};

function updateGameState() {
  if (!isPaused) {
    addActiveTetro();
    draw();
    drawNextTetro();
  }
}

pauseBtn.addEventListener("click", (e) => {
  if (e.target.innerHTML === "Pause") {
    e.target.innerHTML = "Keep Playing...";
    clearTimeout(gameTimerID);
  } else {
    e.target.innerHTML = "Pause";
    gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
  isPaused = !isPaused;
});

startBtn.addEventListener("click", (e) => {
  e.target.innerHTML = "Start again";
  isPaused = false;
  gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  gameOver.style.display = "none";
});
  
scoreElem.innerHTML = score;
levelElem.innerHTML = currentLevel;

draw();

// start game

function startGame() {
  moveTetroDown();
  if (!isPaused) {
    updateGameState();
    gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
};
