import { game } from "./main.js";
import AABB from "./AABB.js";
import { getNormal, drawLine } from "./Helpers";
import Vector from "./Vector";
import { detectCollision, resolveCollision } from "./collisions.js";
import NeuralNet from "./NeuralNetwork";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import Sprite from "./Sprite.js";
import Platform from "./Platform";
// const camX = -player.midpoint().x + screen.width / 2;

export default class Player extends AABB {
  constructor(initvel = 5, maxvel = 30) {
    super(
      game.screen.width / 6 - game.screen.width / 12,
      game.surfacearray[0].position.y - (game.screen.height / 16 + 1) - 100,
      game.screen.width / 36,
      game.screen.height / 16,
      5, //surfacearray[0].u * gamespeed * platfriction,
      0
    );
    // this.fallspeed = 9 * gamespeed * deltatime;#
    this.initvel = initvel;
    this.jumpspeed = 0.04 * game.screen.height * game.gamespeed;
    this.gravity = 0.0012 * game.screen.height * game.gamespeed;
    this.nextPlatformvar;
    this.grabID = true;
    this.platformtocheck;
    this.collided;
    this.lastcollision = null;
    this.score = 0;
    this.sprite;
    this.immune = false;
    this.currentPower;
    this.velocityMultipliery = 1;
    this.velocityMultiplierx = 1;
    this.frictionMultiplier = 1;
    this.maxvelocity = maxvel;
    this.velocitygrowthRate = 0.01;
    game.platformgapMax =
      game.platformgap +
      ((this.maxvelocity - this.initvel) / this.velocitygrowthRate) *
        game.platformgapgrowthRate;
    // this.prevstate = this;
    // this.lastPlatformIndex = 0;
  }

  draw() {
    if (this.sprite === undefined) {
      this.sprite = this.createSprite();
    }
    this.sprite.drawSprite();
  }

  setScores() {
    if (this.name !== "") {
      this.score = Math.trunc(this.score);
      if (game.scores === "undefined" || game.scores === null) {
        var currentScoreArray = [];
      }
      if (game.scores !== "undefined")
        var currentScoreArray = JSON.parse(game.scores);

      if (currentScoreArray === null) currentScoreArray = [];
      var nameInScores = false;
      if (
        game.currenthighScore === null ||
        this.score > game.currenthighScore.score
      ) {
        game.showhighScoreAlert = true;
      }

      if (
        game.currenthighScore === null ||
        game.currenthighScore.score < this.score
      ) {
        var saveString = JSON.stringify({
          score: this.score,
          username: this.name
        });
        localStorage.setItem("highScore", saveString);
      }
      for (var i = 0; i < currentScoreArray.length; i++) {
        if (
          currentScoreArray[i].username === this.name &&
          currentScoreArray[i].score < this.score
        ) {
          nameInScores = true;
          currentScoreArray[i].score = this.score;
        } else if (currentScoreArray[i].username === this.name) {
          nameInScores = true;
        }
      }

      if (nameInScores === false) {
        var saveString = {
          score: this.score,
          username: this.name
        };
        currentScoreArray.push(saveString);
        localStorage.setItem("Scores", JSON.stringify(currentScoreArray));
      } else {
        localStorage.setItem("Scores", JSON.stringify(currentScoreArray));
      }
    }
    game.setState("GAMEOVER");
  }

  update() {
    //set the players name to username entered in login screen.
    if (!this.name) this.name = game.playerName;
    //manage scoreboard when player dies.
    if (this.top() > game.screen.height) {
      this.setScores();
    }

    //increase landing distance and platform distance with speed.
    if (this.vel.x < this.maxvelocity) {
      this.vel.x += this.velocitygrowthRate;
      if (game.platformgap < game.platformgapMax) {
        game.platformMinWidth += game.platformgapgrowthRate;
        game.platformgap += game.platformgapgrowthRate;
      }
    }
    this.fall();
    this.lastcollision = null;
    this.handleCollisions(game.surfacearray);
    // if (this.currentPower && this.currentPower.name === "halfSpeed") {
    //   this.position.y += this.vel.y / 2;
    //   this.position.x += this.vel.x / 2;
    // } else {
    //   this.position.y += this.vel.y;
    //   this.position.x += this.vel.x;
    // }
    this.position.y += this.vel.y * this.velocityMultipliery;
    this.position.x +=
      this.vel.x * this.velocityMultiplierx * this.frictionMultiplier;
    this.updateScore(game.deltatime);
    if (this.top() >= screen.height) {
      //  restartGame();
    }
  }

  fall() {
    this.vel.y += this.gravity;
  }

  jump() {
    if (this.collided) {
      this.vel.y -= this.jumpspeed;
      // this.collided = false;
    }
  }

  crouch() {
    if (!this.crouched) {
      this.height /= 2;
      this.position.y -= this.height / 2;
      this.crouched = true;
    }
  }

  uncrouch() {
    if (this.crouched === true) {
      this.height *= 2;
      this.position.y -= this.height;
      this.crouched = false;
    }
  }

  createSprite() {
    var imgsrc = "./static/26207034.png";
    var sprite = new Sprite(10, 2, imgsrc);
    return sprite;
  }

  updateScore(time) {
    this.score += time * this.vel.x;
  }

  handleCollisions(array) {
    var count = 0;
    var objectcount = 0;
    for (var object of array) {
      //loops through all objects in a given array and checks if the player object is in collision with it.
      // console.log(JSON.stringify(object));
      if (object.instantiated) {
        objectcount++;
        var collisionright = detectCollision(this.bottomright(), object);
        var collisionleft = detectCollision(this.bottomleft(), object);
        if (collisionright.val === true) {
          this.onCollisionEnter(collisionright);
          resolveCollision(this, object, collisionright);
        } else if (collisionleft.val === true) {
          this.onCollisionEnter(collisionleft);
          resolveCollision(this, object, collisionleft);
        } else {
          count++;
        }
      }

      if (object.obstacles.length > 0) {
        objectcount++;
        for (var obstacle of object.obstacles) {
          var collbottom = detectCollision(this.bottomright(), obstacle);
          var colltop = detectCollision(this.topright(), obstacle);
          if (collbottom.val === true && this.immune === false) {
            if (obstacle.floorspike === true) {
              this.resolveCollisionFloorspike(this, obstacle, collbottom);
              var index = object.obstacles.indexOf(obstacle);
              object.obstacles.splice(index, 1);
            } else {
              resolveCollision(this, obstacle, collbottom);
            }
            // obstacle.colour = "blue";
            // this.collided = true;
            // if (coll.loc === "left side") {
            //   savedEnemies.push(
            //     population.splice(population.indexOf(this), 1)[0]
            //   );
            // }
          } else if (colltop.val === true && this.immune === false) {
            if (obstacle.floorspike === true) {
              this.resolveCollisionFloorspike(this, obstacle, colltop);
              var index = object.obstacles.indexOf(obstacle);
              object.obstacles.splice(index, 1);
            } else {
              resolveCollision(this, obstacle, colltop);
            }
          }
        }
      }
    }

    if (count === objectcount) {
      this.colour = "black";
      this.collided = false;
    }
  }

  resolveCollisionFloorspike(player, object, result) {
    this.position.x += this.vel.x * result.intersection.t - 0.1;
    this.vel.x /= 2;
    // player.vel.x = 0;
  }

  nextPlatform() {
    let nextplatformOBJ;
    for (let i = 0; i < surfacearray.length; i++) {
      if (game.surfacearray[i].id === this.nextPlatformvar) {
        nextplatformOBJ = game.surfacearray[i];
      }
    }
    return nextplatformOBJ;
  }

  platformUnder() {
    for (let i = 0; i < game.surfacearray.length; i++) {
      if (
        this.right() >= game.surfacearray[i].left() &&
        this.left() <= game.surfacearray[i].right() &&
        this.bottom() <= game.surfacearray[i].top() &&
        game.surfacearray[i].instantiated
      ) {
        return game.surfacearray[i];
      }
    }
    return false;
  }

  withinGap() {
    if (this.platformUnder() === false) {
      return true;
    } else {
      return false;
    }
  }

  newFriction(collision) {
    if (collision.object.constructor.name === "Platform") {
      // this.velocityMultiplierx = collision.object.friction;
      this.frictionMultiplier = collision.object.friction;
    }
  }

  onCollisionEnter(collision) {
    this.newFriction(collision);

    // if (this.called === undefined) {
    //   this.called = false;
    // }
    // if (this.called === false) {
    //   newFriction();
    //   this.called = true;
    // }
  }
}
