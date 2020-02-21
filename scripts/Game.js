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

export default class Game {
  constructor() {
    this.heightratio = 9;
    this.widthratio = 16;
    this.screen = document.getElementById("gamescreen");
    this.ctx = this.screen.getContext("2d");
    this.screen.width =
      ((window.innerWidth + window.innerHeight) /
        (this.heightratio + this.widthratio)) *
      this.widthratio;
    this.screen.height =
      ((window.innerWidth + window.innerHeight) /
        (this.heightratio + this.widthratio)) *
      this.heightratio;
    this.screen.style.background = "rgba(032,032,032,0.3)";
    this.coins = [];
    this.surfacearray = []; //this.initPlatforms();
    this.player;
    this.popsize = 100;
    this.savedEnemies = [];
    this.startTime = new Date();
    this.t1 = Date.now();
    this.t2 = 0;
    this.deltatime = 0.0;
    this.jumpmultiplier = 1;
    this.delay = 0;
    this.fps = 60;
    this.secondsPerFrame = 1 / this.fps;
    this.camX = 0;
    this.camY = 0;
    this.secondsOfHistory = 2;
    this.historyLength = this.secondsOfHistory * this.fps; // number of frames held in the history stack
    this.playerRewindDuration = 2; // how long the player is allowed to rewind in seconds.
    this.gamehistory = new History(this.historyLength);
    this.gamespeed = 1;
    this.platfriction = 1;
    //rewindDuration holds the amount of time the player can rewind in seconds using the set time taken for each frame.
    this.rewind = false;
    this.paused;
    this.pop;
    this.platformgap = 250;
    this.addEventListeners();
    this.initialisedObjects = false;
    this.powerupDuration = 5;
    this.powerupTimer = 0;
  }

  update() {
    this.t2 = Date.now();
    this.deltatime = Math.abs(this.t2 - this.t1) / 1000;

    if (this.initialisedObjects === false) {
      this.initialiseObjects();
      this.player = new Player();
      this.initialisedObjects = true;
    }

    // if (this.deltatime > 0.15) {
    //   this.deltatime = 0.15;
    // }

    if (this.deltatime >= this.secondsPerFrame && this.paused !== true) {
      this.t1 = this.t2 - (this.deltatime % this.secondsPerFrame);
      if (this.rewind) this.rewindGame();
      this.manageCanvas(this.player);
      this.drawObjects();
      this.updateObjects();
      this.drawScore();
      // managePopulation();
      // furthestplayer = getFurthestPlayer();

      //using Lodash library's clone deep function to create a copy of the player object for use later.
      if (this.rewind === false) this.saveCopies();
      //   distance = 0;
      //    distance += calcDistance(deltatime);
    }
  }

  initPlatforms() {
    this.startingplat = new Platform(0);
    this.surfacearray.push(this.startingplat);
    this.surfacearray.push(
      new Platform(this.startingplat.id + 1, this.startingplat.right() + 250)
    );
  }

  initLayers() {
    this.menu = new Layer("./static/game_menu.png");
    this.background = new Layer(
      "./static/city_background_clean_long.png",
      0,
      0,
      this.camX,
      this.camY,
      0.7
    );
    this.background2 = new Layer(
      "./static/city_background_clean.png",
      0,
      0,
      this.camX,
      this.camY - screen.height / 8,
      0.5,
      400
    );
  }

  initialiseObjects() {
    this.initPlatforms();
    this.initLayers();
  }

  updateGameObjects() {
    for (var object of this.surfacearray) {
      object.move();

      if (
        this.screen.width + this.camX - object.right() >= this.platformgap &&
        !object.passedplatgap &&
        object.id !== 0
      ) {
        this.surfacearray.push(
          new Platform(object.id + 1, object.right() + this.platformgap)
        );
        if (Math.random() < 1) {
          this.coins.push(
            new Coin(
              object.right() + (this.platformgap / 2 - 25),
              object.top() - this.screen.height / 1.5,
              50,
              50
            )
          );
        }
        object.passedplatgap = true;
        this.newplatform = false;
      }

      if (object.isOffScreen()) {
        //remove platform from array when its off screen
        this.surfacearray.shift();
      }
    }

    // player regens rewind time when they're not in the process of rewinding time
    if (this.playerRewindDuration < 2 && this.rewind === false) {
      this.playerRewindDuration += this.deltatime;
    }

    for (var coin of this.coins) {
      coin.update();
    }
  }

  //   restartGame() {
  //     this = new Game();
  //   }

  drawScore() {
    this.ctx.font = "48px Advent Pro";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `- ${Math.trunc(Math.pow(this.player.score, 1.01))} -`,
      this.screen.width / 2 + this.camX,
      this.screen.height / 12
    );
    if (this.player.currentPower !== undefined) {
      this.ctx.font = "36px Montserrat";
      this.ctx.fillText(
        `${this.player.currentPower.name.toUpperCase()}`,
        this.screen.width / 2 + this.camX,
        this.screen.height / 7
      );
    }
  }

  drawObjects() {
    this.background2.draw();
    this.background.draw();
    this.drawGameObjects();
    this.player.draw();
  }

  updateObjects() {
    this.background2.move();
    this.background.move();
    this.updateGameObjects();
    this.player.update();
    // console.log(JSON.stringify(this.surfacearray));
    // for (var item of population) {
    //   item.update();
    // }
  }

  saveCopies() {
    var playercopy = _.cloneDeep(this.player);
    var surfacearraycopy = _.cloneDeep(this.surfacearray);
    var coinsarraycopy = _.cloneDeep(this.coins);
    var screencolor = this.screen.style.background;
    this.gamehistory.add([
      playercopy,
      surfacearraycopy,
      coinsarraycopy,
      screencolor
    ]);
  }

  rewindGame() {
    if (this.gamehistory.stack.length > 0 && this.playerRewindDuration > 0) {
      // save the player's powerup state before rewinding and then re assign to previous so player cannot avoid powerup running out.
      // var playercurrentPower = this.player.currentPower;
      this.pop = this.gamehistory.pop();
      this.player = this.pop[0];
      this.surfacearray = this.pop[1];
      this.coins = this.pop[2];
      this.screen.style.background = this.pop[3];
      this.playerRewindDuration -= this.secondsPerFrame;
      // this.player.currentPower = playercurrentPower;
    } else {
      this.player = this.pop[0];
    }
  }

  addEventListeners() {
    window.addEventListener("keydown", ev => {
      if (ev.which === 32) {
        this.player.jump();
        this.player.collided = false;
      }
      if (ev.key === "R" || ev.key === "r") {
        this.rewind = true;
      }

      if (ev.key === "Escape" || ev.key === "Esc") {
        this.pauseGame();
      }
    });

    window.addEventListener("keyup", ev => {
      if (ev.key === "R" || ev.key === "r") {
        this.rewind = false;
      }
    });
  }

  pauseGame() {
    this.paused = this.paused === true ? false : true;
    this.menu.draw();
  }

  drawGameObjects() {
    for (var i = 0; i < this.surfacearray.length; i++) {
      if (this.surfacearray[i].instantiated) {
        this.surfacearray[i].draw();
      }
    }
    if (this.coins.length > 0) {
      for (var coin of this.coins) {
        coin.draw();
      }
    }
  }

  manageCanvas(target = this.player) {
    target.colour = "yellow";
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
    const raisespeed = 1.7;
    var yactivezone = this.screen.height / 8;
    var xactivezone = this.screen.width / 4;
    if (target.top() <= yactivezone) {
      this.camY = (yactivezone - target.top()) * (1 / raisespeed);
    } else this.camY = 0;

    if (target.right() >= xactivezone) {
      this.camX = Math.abs(xactivezone - target.right());
    } else this.camX = 0;
    this.ctx.translate(-this.camX, this.camY);
  }

  static randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }
}
