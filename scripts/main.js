// import Platform from "Platform.js";
// import Player from "Player.js";
import Layer from "./Layer.js";
import Player from "./Player.js";
import History from "./History.js";
import Platform from "./Platform.js";
import Vector from "./Vector.js";
import Enemy from "./Enemy.js";
import {
  sweptAABB,
  findIntersect,
  detectCollision,
  forcepos,
  resolveCollision
} from "./collisions.js";
import { createPopulation, getFurthestPlayer, managePopulation } from "./ga.js";
import _ from "lodash";
import Coin from "./coin.js";

let screen = document.getElementById("gamescreen");
screen.style.background = "rgba(032,032,032,0.3)";
var heightratio = 9;
var widthratio = 16;
let ctx = screen.getContext("2d");
var gamespeed = 1;
var width =
  ((window.innerWidth + window.innerHeight) / (heightratio + widthratio)) *
  widthratio;
var height =
  ((window.innerWidth + window.innerHeight) / (heightratio + widthratio)) *
  heightratio;
screen.width = width;
screen.height = height;

var nextplatform;
var coins = [];
var pointer = 0;
var platfriction = 1;

// var obstaclearray = [];
// for (var i in surfacearray){
//   for (var j in i.coordinates){
//     obstaclearray.push(new Platform(-1, j, i.y -pheight, ))

//   }
// }

export function newFriction(collision) {
  // console.log(collision);
  if (collision.object.constructor.name === "Platform") {
    player.vel.x *= collision.object.friction;
  }
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

var surfacearray = [];
var startingplat = new Platform(0);
surfacearray.push(startingplat);
surfacearray.push(
  new Platform(startingplat.id + 1, startingplat.right() + 250)
);
// tf.setBackend("cpu");
var score = 0;
var player = new Player();
const popsize = 100;
var savedEnemies = [];
// var population = createPopulation(popsize, []);
const startTime = new Date();
var t1 = Date.now();
var t2 = 0;
var deltatime = 0.0;
const jumpmultiplier = 1;
const delay = 0;
const fps = 120;
const secondsPerFrame = 1 / fps;
var distance = 0;
var camX = 0;
var camY = 0;
const secondsOfHistory = 2;
const historyLength = secondsOfHistory * fps; // number of frames held in the history stack
var playerRewindDuration = 2; // how long the player is allowed to rewind in seconds.
var gamehistory = new History(historyLength);
//rewindDuration holds the amount of time the player can rewind in seconds using the set time taken for each frame.
var rewind = false;
var paused;
// var furthestplayer = population[0];

window.addEventListener("keydown", function(ev) {
  if (ev.which === 32) {
    player.jump();
    player.collided = false;
  }

  if (ev.key === "R" || ev.key === "r") {
    if (playerRewindDuration > 0) {
      rewind = true;
    } else {
      rewind = false;
    }
  }

  if (ev.key === "Escape" || ev.key === "Esc") {
    pauseGame();
  }
  // if (ev.which === 114) {
  //   restartGame();
  // }
});

window.addEventListener("keyup", function(ev) {
  if (ev.key === "R" || ev.key === "r") {
    rewind = false;
  }
});

function manageCanvas(t = player) {
  t.colour = "yellow";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, screen.width, screen.height);
  const raisespeed = 1.7;
  var yactivezone = screen.height / 8;
  var xactivezone = screen.width / 4;
  var target = t;
  if (target.top() <= yactivezone) {
    camY = (yactivezone - target.top()) * (1 / raisespeed);
  } else camY = 0;

  if (target.right() >= xactivezone) {
    camX = Math.abs(xactivezone - target.right());
  } else camX = 0;
  ctx.translate(-camX, camY);
}

var menu = new Layer("./static/game_menu.png");

var background = new Layer(
  "./static/city_background_clean_long.png",
  0,
  0,
  camX,
  camY,
  0.7
);

var background2 = new Layer(
  "./static/city_background_clean.png",
  0,
  0,
  camX,
  camY - screen.height / 8,
  0.5,
  400
);

function drawGameObjects() {
  for (var i = 0; i < surfacearray.length; i++) {
    if (surfacearray[i].instantiated) {
      surfacearray[i].draw();
    }
  }
  if (coins.length > 0) {
    for (var coin of coins) {
      coin.draw();
    }
  }
}

var platformgap = 250;
function updateGameObjects() {
  for (var object of surfacearray) {
    object.move();

    if (
      screen.width + camX - object.right() >= platformgap &&
      !object.passedplatgap &&
      object.id !== 0
    ) {
      surfacearray.push(
        new Platform(object.id + 1, object.right() + platformgap)
      );
      if (Math.random() < 0.5) {
        coins.push(
          new Coin(
            object.right() + (platformgap / 2 - 25),
            object.top() - screen.height / 1.5,
            50,
            50
          )
        );
      }
      object.passedplatgap = true;
      // newplatform = false;
    }

    if (object.isOffScreen()) {
      //remove platform from array when its off screen
      surfacearray.shift();
    }
  }
  if (playerRewindDuration < 2 && rewind === false) {
    playerRewindDuration += deltatime;
  }

  for (var coin of coins) {
    coin.update();
  }
}

function restartGame() {
  surfacearray = [];
  var startingplat = new Platform(0);
  surfacearray.push(startingplat);
  surfacearray.push(
    new Platform(startingplat.id + 1, startingplat.right() + 250)
  );
  score = 0;
  var player = new Player();
  // population = createPopulation(popsize, []);
  // for (var i of savedEnemies) {
  //   i.nn.model.dispose();
  // }
  // savedEnemies = [];
  startTime = new Date();
  t1 = Date.now();
  t2 = 0;
  deltatime = 0.0;
  jumpmultiplier = 1;
  delay = 0;
  fps = 120;
  secondsPerFrame = 1 / fps;
  distance = 0;
  camX = 0;
  camY = 0;

  Animate();
}

function drawScore() {
  //  d = speed/time
  ctx.font = "48px Advent Pro";
  ctx.textAlign = "center";
  ctx.fillText(
    `- ${Math.trunc(Math.pow(player.score, 1.01))} -`,
    screen.width / 2 + camX,
    screen.height / 12
  );
  if (player.currentPower !== undefined) {
    ctx.font = "36px Montserrat";
    ctx.fillText(
      `${player.currentPower.name.toUpperCase()}`,
      screen.width / 2 + camX,
      screen.height / 7
    );
  }
}

function drawObjects() {
  background2.draw();
  background.draw();
  drawGameObjects();
  player.draw();
  // for (var item of population) {
  //   item.draw();
  // }
}

function updateObjects() {
  background2.move();
  background.move();
  updateGameObjects();
  player.update();
  // for (var item of population) {
  //   item.update();
  // }
}

function pauseGame() {
  paused = paused === true ? false : true;
  menu.draw();
}

function Animate() {
  requestAnimationFrame(Animate);
  t2 = Date.now();
  deltatime = Math.abs(t2 - t1) / 1000;

  if (deltatime > 0.15) {
    deltatime = 0.15;
  }

  // if (player.top() > screen.height) {
  //   // platfriction = 0;
  // }

  if (deltatime >= secondsPerFrame && paused !== true) {
    t1 = t2 - (deltatime % secondsPerFrame);
    if (rewind === true) {
      if (gamehistory.stack.length > 0) {
        var pop = gamehistory.pop();
        player = pop[0][0];
        surfacearray = pop[0][1];
        playerRewindDuration -= secondsPerFrame;
        console.log(playerRewindDuration);
      } else {
        rewind = false;
      }
      // coins = gamehistory.pop()[0][2];
    }
    manageCanvas(player);
    drawObjects();
    updateObjects();
    drawScore();
    // managePopulation();
    // furthestplayer = getFurthestPlayer();

    //using Lodash library's clone deep function to create a copy of the player object for use later.
    if (rewind === false) {
      var playercopy = _.cloneDeep(player);
      var surfacearraycopy = _.cloneDeep(surfacearray);
      var coinsarraycopy = _.cloneDeep(coins);
      gamehistory.add([playercopy, surfacearraycopy, coinsarraycopy]);
    }

    //   distance = 0;
    //    distance += calcDistance(deltatime);
  }
}
Animate();

export {
  screen,
  deltatime,
  ctx,
  surfacearray,
  randomInRange,
  forcepos,
  detectCollision,
  platfriction,
  player,
  gamespeed,
  gamehistory,
  sweptAABB,
  findIntersect,
  camX,
  camY,
  platformgap,
  restartGame,
  //population,
  savedEnemies,
  coins,
  startTime
};
