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
import { restartGame } from "./main.js";
import { drawLine } from "./Helpers";

export default class Game {
  //Class that manages all game logic and drawing.

  constructor(state = "RUNNING") {
    //using 16:9 aspect ratio.
    this.heightratio = 9;
    this.widthratio = 16;
    //loading the canvas HTML element into game attributes.
    this.screen = document.getElementById("gamescreen");

    this.menuOverlay = document.getElementById("overlay");
    this.gameOverMenu = {
      menu: document.getElementById("gameOver")
    };
    this.mainMenu = {
      menu: document.getElementById("mainMenu")
    };
    this.pausedMenu = {
      menu: document.getElementById("pausedMenu")
    };
    this.resumeBtn = document.getElementById("resumeBtn");
    this.helpBtn = document.getElementById("helpBtn");
    this.playBtn = document.getElementById("playBtn");
    this.restartBtn = document.getElementById("restartBtn");
    this.exitBtn = document.getElementById("exitBtn");
    this.loginPage = {
      menu: document.getElementById("loginPage"),
      form: document.getElementById("loginForm"),
      username: document.getElementById("username")
    };
    this.helpPage = document.getElementById("helpPage");
    this.scoresPage = document.getElementById("scoresPage");
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
    this.powerups = [];
    this.state = state;
    this.player;
    this.playerName;
    this.currenthighScore = JSON.parse(localStorage.getItem("highScore"));
    this.scores = localStorage.getItem("Scores");
    this.showhighScoreAlert;
    this.highScoreAlert = document.getElementById("highScoreAlert");
    this.popsize = 100;
    this.savedEnemies = [];
    this.startTime = new Date();
    this.t1;
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
    this.maxRewindDuration = 2;
    this.playerRewindDuration = this.maxRewindDuration; // how long the player is allowed to rewind in seconds.
    this.rewindregenMultiplier = 0.25; // how qucikly the player regens their rewind time.
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
    this.platformMinWidth = this.screen.width / 2;
    this.platformMaxWidth = 2 * this.screen.width;
  }

  update() {
    if (this.state === "RUNNING") {
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

        if (this.rewind === false) this.saveCopies();
        //   distance = 0;
        //    distance += calcDistance(deltatime);
      }
    } else if (this.state === "PAUSED") {
      //display pause menu.
      this.showMenu(this.pausedMenu.menu);
    } else if (this.state === "LOGIN") {
      this.showMenu(this.loginPage.menu);
    } else if (this.state === "GAMEOVER") {
      //display game over menu.
      if (this.showhighScoreAlert) {
        this.highScoreAlert.innerHTML = `NEW HIGHSCORE: ${
          this.player.name
        }, ${Math.trunc(this.player.score)}`;
        this.highScoreAlert.style.visibility = "visible";
      }
      this.showMenu(this.gameOverMenu.menu);
    } else if (this.state === "MAINMENU") {
      //display main menu.
      this.showMenu(this.mainMenu.menu);
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
    this.menu = new Layer(
      "./static/game_menu.png",
      0,
      0,
      this.camX + this.screen.width / 2 - 1050,
      screen.height / 2 - 750,
      0,
      0,
      2100,
      1500
    );
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

  setState(state) {
    this.state = state;
  }

  hideMenu(menu) {
    this.menuOverlay.style.visibility = "hidden";
    menu.style.visibility = "hidden";
  }

  showMenu(menu) {
    this.menuOverlay.style.visibility = "visible";
    if (this.state === "GAMEOVER") {
      this.menuOverlay.style.background = "rgba(50,0,0,0.5)";
    } else {
      this.menuOverlay.style.background = "rgba(32,32,32,0.5)";
    }
    // drawLine(
    //   new Vector(this.camX + this.screen.width / 2, 0),
    //   new Vector(this.camX + this.screen.width / 2, screen.height),
    //   "white"
    // );
    // drawLine(
    //   new Vector(this.camX, this.screen.height / 2),
    //   new Vector(this.camX + this.screen.width, this.screen.height / 2),
    //   "white"
    // );
    menu.style.top = this.screen.height / 2 - menu.offsetHeight / 2 + "px";
    menu.style.left = window.innerWidth / 2 - menu.offsetWidth / 2 + "px";
    menu.style.visibility = "visible";
  }

  initialiseObjects() {
    this.initPlatforms();
    this.initLayers();
    this.t1 = Date.now();
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
      this.playerRewindDuration += this.deltatime * this.rewindregenMultiplier;
    }

    for (var coin of this.coins) {
      coin.update();
    }
  }

  //   restartGame() {
  //     this = new Game();
  //   }

  updatePowerups() {
    for (var powerup of this.powerups) {
      powerup.update();
      if (powerup.startTimer) {
        powerup.timer += this.deltatime;
      }

      if (powerup.timer > powerup.duration) {
        powerup.deactivatePower();
        var index = this.powerups.indexOf(powerup);
        this.powerups.splice(index, 1);
      }
    }
  }

  drawScore() {
    this.ctx.font = "48px Advent Pro";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `- ${Math.trunc(this.player.score)}m -`,
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
    this.drawRewindbar();
    this.player.draw();
  }

  updateObjects() {
    this.background2.move();
    this.background.move();
    this.updateGameObjects();
    this.updatePowerups();
    this.player.update();
    // console.log(JSON.stringify(this.surfacearray));
    // for (var item of population) {
    //   item.update();
    // }
  }

  saveCopies() {
    //using Lodash library's clone deep function to create a copy of the player object for use later.

    this.gamehistory.add([
      _.cloneDeep(this.player),
      _.cloneDeep(this.surfacearray),
      _.cloneDeep(this.coins),
      this.screen.style.background,
      _.cloneDeep(this.powerups)
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
      this.powerups = this.pop[4];
      this.playerRewindDuration -= this.secondsPerFrame;
      // this.player.currentPower = playercurrentPower;
    } else {
      this.player = this.pop[0];
    }
  }

  drawRewindbar() {
    var ratio = this.playerRewindDuration / this.maxRewindDuration;
    var width = (ratio * this.screen.width) / 12;
    this.ctx.fillStyle = "rgb(0,255,125)";
    this.ctx.fillRect(
      this.screen.width / 2 - this.screen.width / 24 + this.camX,
      screen.height / 9.5,
      width,
      this.screen.height / 64
    );
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(
      this.screen.width / 2 - this.screen.width / 24 + this.camX,
      screen.height / 9.5,
      this.screen.width / 12,
      this.screen.height / 64
    );
    this.ctx.fillStyle = "black";
  }

  addEventListeners() {
    document.getElementById("restartBtn").addEventListener("click", () => {
      this.hideMenu(this.gameOverMenu.menu);
      this.hideMenu(this.pausedMenu.menu);
      restartGame();
    });
    this.loginPage.form.addEventListener("submit", ev => {
      ev.preventDefault();
      this.playerName = this.loginPage.username.value;
      this.loginPage.username.value = "";
      this.hideMenu(this.loginPage.menu);
      this.setState("RUNNING");
    });

    this.resumeBtn.addEventListener("click", ev => {
      this.unpauseGame();
    });

    this.playBtn.addEventListener("click", ev => {
      this.hideMenu(this.mainMenu.menu);
      this.setState("LOGIN");
    });

    this.exitBtn.addEventListener("click", ev => {
      this.hideMenu(this.pausedMenu.menu);
      this.hideMenu(this.gameOverMenu.menu);
      restartGame("MAINMENU");
    });

    this.helpBtn.addEventListener("click", () => {
      this.setState("HELPMENU");
      this.hideMenu(this.mainMenu.menu);
      this.showMenu(this.helpPage);
    });

    document.getElementById("backBtn").addEventListener("click", () => {
      this.setState("MAINMENU");
      this.hideMenu(this.scoresPage);
    });

    document.getElementById("scoresBtn").addEventListener("click", () => {
      //load scores into paragarph element.
      var para = document.getElementById("scores");
      for (var scoreObj of JSON.parse(this.scores)) {
        var append = `User: ${scoreObj.username}, Score: ${scoreObj.score} \n`;
        para.textContent += append;
        para.appendChild(document.createElement("br"));
      }

      this.setState("SCORESMENU");
      this.hideMenu(this.mainMenu.menu);
      this.showMenu(this.scoresPage);
    });

    document.getElementById("helpProceed").addEventListener("click", () => {
      this.hideMenu(this.helpPage);
      this.setState("MAINMENU");
    });

    window.addEventListener("keydown", ev => {
      if (ev.code === "Space") {
        this.player.jump();
        this.player.collided = false;
      }
      if (ev.key === "R" || ev.key === "r") {
        this.rewind = true;
      }

      if (ev.key === "Escape" || ev.key === "Esc") {
        this.pauseGame();
      }

      if (ev.key === "Control") {
        this.player.crouch();
      }
    });

    window.addEventListener("keyup", ev => {
      if (ev.key === "R" || ev.key === "r") {
        this.rewind = false;
      }

      if (ev.key === "Control") {
        this.player.uncrouch();
      }
    });
  }

  pauseGame() {
    if (this.state === "RUNNING") {
      this.setState("PAUSED");
      // this.savedDeltatime = this.deltatime;
    } else if (this.state === "PAUSED") {
      this.hideMenu(this.pausedMenu.menu);
      this.setState("RUNNING");
      this.t1 = Date.now();
    }
  }
  unpauseGame() {
    this.deltatime = this.savedDeltatime;
    this.hideMenu(this.pausedMenu.menu);
    this.setState("RUNNING");
    this.t1 = Date.now();
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
