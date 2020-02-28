import Player from "./Player.js";
import NeuralNet from "./NeuralNetwork.js";
import { game } from "./main.js";
import { restartGame } from "./main";
import { detectCollision, resolveCollision } from "./collisions.js";
import Vector from "./Vector.js";
export default class Enemy extends Player {
  constructor(nnModel = new NeuralNet(5, 4, 2)) {
    super();
    this.previousplatform;
    this.nn = nnModel;
    this.outputvalues;
    this.width = game.player.width * 2;
    this.height = game.player.height * 2;
    this.immune = true;
    this.stopUpdating = false;
    this.colour = "red";
  }

  draw() {
    game.ctx.fillStyle = this.colour;
    game.ctx.fillRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    //reset the canvas fillstyle.
    game.ctx.fillStyle = "black";
  }

  update() {
    //increase landing distance and platform distance with speed.
    // this.initvel *= 1.001;
    if (this.stopUpdating === false) {
      this.makeDecision();
      this.fall();

      this.handleCollisions(game.surfacearray);
      // this.vel.x *= game.deltatime;
      // this.vel.y *= game.deltatime;
      this.position.y += this.vel.y * this.velocityMultipliery;
      this.position.x +=
        this.vel.x * this.velocityMultiplierx * this.frictionMultiplier;
      if (game.state === "RUNNING") {
        this.updateVelocity();
        if (this.top() >= game.screen.height) {
          this.stopUpdating = true;
          document.getElementById("gameOverText").innerText = "You Win!";
        }
      }
      this.updateScore(game.deltatime);
    }

    if (game.state === "TRAINING") {
      if (this.top() >= game.screen.height && game.population.length > 1) {
        game.savedEnemies.push(
          game.population.splice(game.population.indexOf(this), 1)[0]
        );
        // game.player = game.population[0];
      } else if (
        this.top() >= game.screen.height &&
        game.population.length === 1
      ) {
        var enemies = this.savedEnemies;
        restartGame("RUNNING", 0, enemies, game.generationNo + 1);
      }
    }
  }

  findNearestObstacle() {
    var smallestDistance = Infinity;
    var closestObstacle = null;
    if (
      game.surfacearray[1] !== undefined &&
      game.surfacearray[1].obstacles[0] !== undefined
    ) {
      closestObstacle = game.surfacearray[1].obstacles[0];
    }
    for (var platform of game.surfacearray) {
      if (platform.obstalces !== undefined) {
        for (var obstacle of platform.obstacles) {
          if (obstacle.position.x - this.position.x < smallestDistance) {
            smallestDistance = obstacle.position.x - this.position.x;
            closestObstacle = obstacle;
          }
        }
      }
    }
    return closestObstacle;
  }

  handleCollisions(arr) {
    for (var object of arr) {
      var collright = detectCollision(this.bottomright(), object, this);
      var collleft = detectCollision(this.bottomleft(), object, this);
      if (collright.val === true) {
        resolveCollision(this, object, collright);
      } else if (collleft.val === true) {
        resolveCollision(this, object, collleft);
      }
    }
    if (game.state === "RUNNING") {
      var playerCollision = detectCollision(
        new Vector(
          game.player.position.x,
          game.player.position.y + game.player.halfsizeHeight
        ),
        this,
        this
      );
      if (playerCollision.val === true) {
        game.setState("GAMEOVER");
      }
    }
  }

  findNextPlatform() {
    var minDistance = Infinity;
    var nextPlat = 0;
    var difference;
    for (var platform of game.surfacearray) {
      difference = platform.left() - this.right();
      if (difference < minDistance && difference >= 0) {
        minDistance = difference;
        nextPlat = platform;
      }
    }
    return nextPlat;
  }

  findCurrentPlatform() {
    for (var platform of game.surfacearray) {
      if (this.right() >= platform.left() && this.right() <= this.right()) {
        //should really use player.left to check if player is past the right edge but
        // since collision is done from right, player is technically off the plat as soon as the right edge goes off.
        this.previousplatform = platform;
        return platform;
      }
    }
    return 0;
  }

  jump() {
    if (this.collided) {
      this.vel.y -= this.jumpspeed;
      this.collided = false;
    }
  }

  makeDecision() {
    var inputs = [];
    //get inputs: xvel, currentx, xpos of nearest obstacle, xend of current platform, xstart of next platform
    var currentplatform; // = game.surfacearray[0];
    var nextplatform; //= game.surfacearray[1];

    // set first input as right x coordinate of player.
    inputs[0] = this.right();

    //set 2nd input as player's horizontal velocity.
    inputs[1] = this.vel.x;
    // inputs[2] = 0;

    // set 3rd input as left x coordinate of nearest obstacle.
    var currentDist = Infinity;
    var nearestObstacle = 0;
    if (!game.surfacearray[1] === undefined) {
      currentDist = game.surfacearray[1].obstacles[0].left() - this.right();
    } else {
      inputs[4] = 0;
    }

    //Loop through all platforms
    for (var plat of game.surfacearray) {
      //find the platform that the player is currently on.
      if (
        this.left() >= plat.left() &&
        this.right() <= plat.right() &&
        plat.instantiated
      ) {
        //set current platform to the platform that satisfies conditions.
        currentplatform = plat;
      }

      if (plat.obstacles.length > 0) {
        for (var obstacle of plat.obstacles) {
          var dist = obstacle.left() - this.right();
          if (dist < currentDist && dist >= 0) {
            //store obstacle position if it is the current closest in the search
            currentDist = dist;
            nearestObstacle = obstacle;
            // inputs[2] = null;
          }
        }
      }
    }

    nextplatform =
      game.surfacearray[game.surfacearray.indexOf(currentplatform) + 1];
    if (currentplatform === undefined) {
      currentplatform = 0;
      inputs[2] = 0;
    } else {
      inputs[2] = currentplatform.right();
      //   if (currentplatform.id !== 0){
      //   inputs[2] = currentplatform.obstacles[0].left();
      // }
    }

    if (nextplatform === undefined) {
      nextplatform = game.surfacearray[0];
    }

    // if (this.findNextPlatform() !== null) {
    //   inputs[4] = this.findNextPlatform().left();
    // } else {
    //   inputs[4] = null;
    // }

    if (nextplatform === 0) {
      inputs[3] = 0;
    } else {
      inputs[3] = nextplatform.left();
    }

    // inputs[4] = nearestObstacle !== 0 ? nearestObstacle.left() - 100 : 0;
    inputs[4] = 0;
    var result = this.nn.output(inputs);
    result.data().then(x => {
      if (x[0] > x[1]) {
        this.jump();
      }
    });
    // console.log(result.dataSync());
    // if (result.dataSync()[0] > result.dataSync()[1]) {
    //   // this.jump();
    // }
    // console.log(this.jumpspeed);
    // this.jump();
  }
}
