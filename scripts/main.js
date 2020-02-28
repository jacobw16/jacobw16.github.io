import Game from "./Game";
export var game = new Game("MAINMENU", 0);
export function startGame() {
  //call update function where all game logic is ran.
  game.update();
  //continually call the start game function using requestAnimationFrame since it provides useful information such as a timestamp and fixes common recursion error.
  requestAnimationFrame(startGame);
}

export function restartGame(
  state = "RUNNING",
  obstaclequantity = 5,
  gamemode = 0,
  savedenemies = [],
  genNo = 1
) {
  // create a new game instance when restart game is called, using the export keyword, it can be called from any other file.
  game = new Game(state, obstaclequantity, gamemode, savedenemies, genNo);
  console.log("restarted");
}

startGame();
