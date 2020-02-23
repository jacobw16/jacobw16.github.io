import Game from "./Game";
export var game = new Game("MAINMENU");
export function startGame() {
  game.update();
  requestAnimationFrame(startGame);
}

export function restartGame(state = "RUNNING") {
  game = new Game(state);
}

startGame();
