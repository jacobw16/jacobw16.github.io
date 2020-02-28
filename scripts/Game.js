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
import { createPopulation, getFurthestPlayer } from "./ga.js";
import _ from "lodash";
import Coin from "./coin.js";
import { restartGame, game } from "./main.js";
import { drawLine } from "./Helpers";
require("babel-polyfill");

export default class Game {
  //Class that manages all game logic and drawing.

  constructor(
    state = "RUNNING",
    obstacleQuantity = 5,
    gamemode = 0,
    oldpopulation = [],
    generationnumber = 1
  ) {
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

    this.loginPage = {
      menu: document.getElementById("loginPage"),
      form: document.getElementById("loginForm"),
      username: document.getElementById("username")
    };
    this.difficultySelect = document.getElementById("difficultySelect");
    this.modeSelect = document.getElementById("modeSelect");
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
    this.popsize = 30;
    this.savedEnemies = oldpopulation;
    this.startTime = new Date();
    this.t1; //start time to calculate time delta.
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
    //rewindDuration holds the amount of time the player can rewind in seconds using the set time taken for each frame.
    this.maxRewindDuration = 2;
    this.playerRewindDuration = 0; // Rewind time starts at 0 so player cannot try to rewind futher than history that is held.
    this.rewindregenMultiplier = 0.25; // how qucikly the player regens their rewind time.
    this.gamehistory = new History(this.historyLength);
    this.gamespeed = 1;
    this.platfriction = 1;
    this.rewind = false;
    this.paused;
    this.pop; // result of popping from the history stack
    this.platformgap = 250;
    this.initialisedObjects = false;
    this.powerupDuration = 5;
    this.platformMinWidth = this.screen.width / 2;
    this.platformMaxWidth = 2 * this.screen.width;
    this.platformgapgrowthRate = 0.25;
    this.platformgapMax;
    this.difficulty;
    this.obstaclequantity = obstacleQuantity;
    this.population;
    this.generationNo = generationnumber;
    this.gameMode = gamemode; // gameMode 0 = solo, gameMode 1 = player vs AI.
    this.addEventListeners();
  }

  initialiseObjects() {
    this.initPlatforms();
    this.initLayers();
    this.player = new Player();
    this.setDifficulty();

    if (this.gameMode === 1) {
      //load the stored neural network if game mode is player vs AI.
      this.loadNN();
    }
    if (this.state === "TRAINING") {
      // create a population of enemies if there is no stored AI to train it.
      if (this.population === undefined) {
        this.population = createPopulation(this.popsize);
      }
      this.player = this.population[0];
    }
    this.initialisedObjects = true;
    this.t1 = Date.now(); //start calculating deltatime.
  }

  initPlatforms() {
    this.startingplat = new Platform(0);
    this.surfacearray.push(this.startingplat);
    this.surfacearray.push(
      new Platform(
        this.startingplat.id + 1,
        this.obstaclequantity,
        this.startingplat.right() + 250
      )
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

  setDifficulty() {
    if (!!this.player) {
      //if this.player is not false. (accounts for undefined and null)
      if (this.difficulty === "hard") {
        this.obstaclequantity = 5;
        this.player.maxvelocity = 30;
      }

      if (this.difficulty === "medium") {
        this.obstaclequantity = 2;
        this.player.maxvelocity = 20;
      }

      if (this.difficulty === "easy") {
        this.obstaclequantity = 0;
        this.player.maxvelocity = 15;
      }
    }
  }

  update() {
    if (this.state === "RUNNING" || this.state === "TRAINING") {
      this.t2 = Date.now();
      this.deltatime = Math.abs(this.t2 - this.t1) / 1000; // deltatime will equal the time passed since t1 and t2 in seconds.
      if (this.initialisedObjects === false) {
        this.initialiseObjects();
      }

      // if (this.deltatime > 0.15) {
      //   this.deltatime = 0.15;
      // }

      if (this.deltatime >= this.secondsPerFrame && this.paused !== true) {
        // only call update logic if the time passed is bigger or equal to the update rate.
        this.t1 = this.t2 - (this.deltatime % this.secondsPerFrame);
        if (this.rewind) this.rewindGame();
        this.manageCanvas(this.player);
        this.drawObjects();
        this.updateObjects();
        this.drawScore();
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
      // display game over menu.
      if (this.showhighScoreAlert) {
        this.highScoreAlert.innerHTML = `NEW HIGHSCORE: ${
          this.player.name
        }, ${Math.trunc(this.player.score)}m`;
        this.highScoreAlert.style.visibility = "visible";
      }
      this.showMenu(this.gameOverMenu.menu);
    } else if (this.state === "MAINMENU") {
      //display main menu.
      this.showMenu(this.mainMenu.menu);
    } else if (this.state === "DIFFICULTYSELECT") {
      this.showMenu(this.difficultySelect);
    } else if (this.state === "MODESELECT") {
      this.showMenu(this.modeSelect);
    }
  }

  updateObjects() {
    this.background2.move();
    this.background.move();
    if (this.gameMode === 0) {
      this.updatePlatforms(false);
    } else this.updatePlatforms();
    this.updateCoins();
    this.updatePowerups();
    this.updateRewind();
    if (this.state === "RUNNING") {
      if (this.enemy !== undefined && this.gameMode === 1) this.enemy.update();
      this.player.update();
    } else if (this.state === "TRAINING") {
      this.updatePopulation();
    }

    // console.log(JSON.stringify(this.surfacearray));
  }

  updatePlatforms(generatecoins = true) {
    for (var object of this.surfacearray) {
      object.move();

      if (
        this.screen.width + this.camX - object.right() >= this.platformgap &&
        !object.passedplatgap &&
        object.id !== 0
      ) {
        // generate a new platform only when the end of the last one is at the right side of the screen.
        this.surfacearray.push(
          new Platform(
            object.id + 1,
            this.obstaclequantity,
            object.right() + this.platformgap
          )
        );
        if (Math.random() < 0.5 && generatecoins === true) {
          // generate a coin at 50% chance.
          var newcoin = new Coin(
            object.right() + (this.platformgap / 2 - 25),
            object.top() - this.screen.height / 1.5,
            50,
            50
          );
          this.coins.push(newcoin);
        }
        object.passedplatgap = true;
        this.newplatform = false;
      }

      if (object.isOffScreen()) {
        //remove platform from array when its off screen
        this.surfacearray.shift();
      }
    }
  }

  updatePopulation() {
    this.player = this.population[0];

    for (var item of this.population) {
      item.update();
    }

    if (this.player.score >= 1500) {
      if (this.generationNo < 3) {
        if (this.population.length > 0) {
          // the last enemy alive is pushed to the population for the next generation.
          this.savedEnemies.push(this.population[0]);
        }
        var enemies = this.savedEnemies;
        // restartGame();
        restartGame("TRAINING", 0, enemies, ++this.generationNo);
      } else {
        // if there has been 3 generations, the model is saved.
        this.saveModel();
        restartGame("MAINMENU");
      }
    }
    if (this.player !== undefined) this.updateVelocityPopulation();
  }

  async saveModel() {
    //saves the model to the browser's localstorage
    const result = await this.player.nn.model.save("localstorage://my-model-1");
  }

  async loadNN() {
    // fetch("./static/my-model.json").then(function(responseObj) {
    //   console.log("status: ", responseObj.text());
    // });
    try {
      // tries to retrieve the model from local storage.
      const enemyNN = await tf.loadLayersModel("localstorage://my-model-1");
      this.enemy = new Enemy();
      this.enemy.nn.model = enemyNN;
      this.enemy.position.x -= this.screen.width / 8;
    } catch (err) {
      // if it couldnt be found, the AI will be retrained and that model saved.
      console.log("AI must be trained first... /n setting to train mode");
      restartGame("TRAINING", 0);
    }
  }
  updateVelocityPopulation() {
    //updating the velocity for each member of the population, done in the game class so velocity is not increased as many times as the quantity of the population.
    var velocityTotalMAX = this.population.length * this.player.maxvelocity;
    var velocityTotal = 0;
    for (var enemy of this.population) velocityTotal += enemy.vel.x;
    if (velocityTotal < velocityTotalMAX) {
      for (var object of this.population) {
        object.vel.x += object.velocitygrowthRate;
      }
      if (this.platformgap < this.platformgapMax) {
        this.platformMinWidth += this.platformgapgrowthRate;
        this.platformgap += this.platformgapgrowthRate;
      }
    }
  }

  updateCoins() {
    for (var coin of this.coins) {
      coin.update();
    }
  }

  updateRewind() {
    // player regens rewind time when they're not in the process of rewinding time
    if (this.playerRewindDuration < 2 && this.rewind === false) {
      this.playerRewindDuration += this.deltatime * this.rewindregenMultiplier;
    }
  }

  updatePowerups() {
    for (var powerup of this.powerups) {
      powerup.update();
      if (powerup.startTimer) {
        // when a powerup is activated its starttimer attribute will be true, deltatime is added until it reaches powerup duration.
        powerup.timer += this.deltatime;
      }

      if (powerup.timer > powerup.duration) {
        //powerup time limit reached.
        powerup.deactivatePower();
        var index = this.powerups.indexOf(powerup);
        this.powerups.splice(index, 1);
      }
    }
  }

  saveCopies() {
    //using Lodash library's clone deep function to create a copy of the player object for use later.
    var arr = [
      _.cloneDeep(this.player),
      _.cloneDeep(this.surfacearray),
      _.cloneDeep(this.coins),
      this.screen.style.background,
      _.cloneDeep(this.powerups)
    ];
    if (this.state === "RUNNING" && this.gameMode === 1) {
      // only clones enemy if the game is not in a training state.
      arr.push(_.cloneDeep(this.enemy));
    }
    this.gamehistory.add(arr);
  }

  rewindGame() {
    if (this.gamehistory.stack.length > 0 && this.playerRewindDuration > 0) {
      //all game objects are set to the values in the history stack at the point when the player let go of "R".
      this.pop = this.gamehistory.pop();
      this.player = this.pop[0];
      this.surfacearray = this.pop[1];
      this.coins = this.pop[2];
      this.screen.style.background = this.pop[3];
      this.powerups = this.pop[4];
      if (this.state === "RUNNING" && this.gameMode === 1)
        this.enemy = this.pop[5];
      this.playerRewindDuration -= this.secondsPerFrame;
    } else {
      this.player = this.pop[0];
    }
  }

  drawScore() {
    this.ctx.font = "48px Advent Pro";
    this.ctx.textAlign = "center";
    if (this.player !== undefined) {
      if (this.gameMode === 1) {
        // draws both the player and enemy's score if it is player vs ai mode.
        this.ctx.fillText(
          `- Your score: ${Math.trunc(
            this.player.score
          )}m  Enemy score: ${Math.trunc(this.enemy.score)}m-`,
          this.screen.width / 2 + this.camX,
          this.screen.height / 12
        );
      } else {
        this.ctx.fillText(
          `- ${Math.trunc(this.player.score)}m -`,
          this.screen.width / 2 + this.camX,
          this.screen.height / 12
        );
      }
    }

    if (this.player.currentPower !== undefined) {
      //draws the player's active power up.
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
    this.drawPlatforms();
    this.drawCoins();
    this.drawRewindbar();
    this.player.draw();
    if (this.enemy !== undefined) this.enemy.draw();
    if (this.state === "TRAINING") {
      for (var item of this.population) {
        item.draw();
      }
    }
  }

  drawPlatforms() {
    for (var i = 0; i < this.surfacearray.length; i++) {
      if (this.surfacearray[i].instantiated) {
        this.surfacearray[i].draw();
      }
    }
  }

  drawCoins() {
    if (this.coins.length > 0) {
      for (var coin of this.coins) {
        coin.draw();
      }
    }
  }

  drawRewindbar() {
    var ratio = this.playerRewindDuration / this.maxRewindDuration;
    var width = (ratio * this.screen.width) / 12;
    //fills a bar with the percentage of rewind duration the player has.
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

  setState(state) {
    this.state = state;
  }

  hideMenu(menu) {
    if (menu === this.gameOverMenu.menu) {
      this.highScoreAlert.style.visibility = "hidden";
    }

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
    menu.style.top = this.screen.height / 2 - menu.offsetHeight / 2 + "px";
    menu.style.left = window.innerWidth / 2 - menu.offsetWidth / 2 + "px";
    menu.style.visibility = "visible";
  }

  addEventListeners() {
    document.body.addEventListener("click", ev => {
      if (ev.target.id === "restartBtn") {
        this.hideMenu(this.gameOverMenu.menu);
        this.hideMenu(this.pausedMenu.menu);
        restartGame("LOGIN", this.obstaclequantity, this.gameMode);
      }

      if (ev.target.id === "playBtn") {
        this.hideMenu(this.mainMenu.menu);
        this.setState("MODESELECT");
      }

      if (ev.target.id === "resumeBtn") {
        this.unpauseGame();
      }

      if (ev.target.id === "helpBtn") {
        this.setState("HELPMENU");
        this.hideMenu(this.mainMenu.menu);
        this.showMenu(this.helpPage);
      }

      if (ev.target.id === "exitBtn") {
        this.hideMenu(this.pausedMenu.menu);
        this.hideMenu(this.gameOverMenu.menu);
        restartGame("MAINMENU");
      }

      if (ev.target.id === "helpProceed") {
        this.hideMenu(this.helpPage);
        this.setState("MAINMENU");
      }

      if (ev.target.id === "backBtn") {
        this.setState("MAINMENU");
        this.hideMenu(this.scoresPage);
        this.hideMenu(this.difficultySelect);
      }

      if (ev.target.id === "hardBtn") {
        this.difficulty = "hard";
        this.setState("LOGIN");
        this.hideMenu(this.difficultySelect);
      }

      if (ev.target.id === "mediumBtn") {
        this.difficulty = "medium";
        this.setState("LOGIN");
        this.hideMenu(this.difficultySelect);
      }

      if (ev.target.id === "easyBtn") {
        this.difficulty = "easy";
        this.setState("LOGIN");
        this.hideMenu(this.difficultySelect);
      }

      if (ev.target.id === "soloBtn") {
        this.gameMode = 0;
        this.hideMenu(this.modeSelect);
        this.setState("DIFFICULTYSELECT");
      }

      if (ev.target.id === "pveBtn") {
        this.gameMode = 1;
        this.hideMenu(this.modeSelect);
        this.setState("DIFFICULTYSELECT");
      }

      if (ev.target.id === "trainAI") {
        this.hideMenu(this.modeSelect);
        this.obstaclequantity = 0;
        this.setState("TRAINING");
      }
    });

    document.getElementById("scoresBtn").addEventListener("click", () => {
      //load scores into paragarph element.
      this.scores = localStorage.getItem("Scores");
      var para = document.getElementById("scores");
      if (this.scores !== null) {
        para.textContent = "";
        var scores = JSON.parse(this.scores);
        scores.sort((a, b) => (a.score < b.score ? 1 : -1));
        for (var scoreObj of scores) {
          var append = `#${scores.indexOf(scoreObj) + 1} User: ${
            scoreObj.username
          }, Score: ${scoreObj.score} \n`;
          para.textContent += append;
          para.appendChild(document.createElement("br"));
        }
      }
      this.setState("SCORESMENU");
      this.hideMenu(this.mainMenu.menu);
      this.showMenu(this.scoresPage);
    });

    this.loginPage.form.addEventListener("submit", ev => {
      ev.preventDefault();
      this.playerName = this.loginPage.username.value;
      // this.loginPage.username.value = "";
      this.hideMenu(this.loginPage.menu);
      this.setState("RUNNING");
      this.t1 = Date.now();
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

  manageCanvas(target = this.player) {
    //setting the camera to follow the player only when it's in its active zone.
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
