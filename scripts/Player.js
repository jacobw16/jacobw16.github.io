import { game } from "./main.js";
import AABB from "./AABB.js";
import { getNormal, drawLine } from "./Helpers";
import Vector from "./Vector";
import { detectCollision, resolveCollision } from "./collisions.js";
import NeuralNet from "./NeuralNetwork";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import Sprite from "./Sprite.js";
// const camX = -player.midpoint().x + screen.width / 2;

export default class Player extends AABB {
  constructor() {
    super(
      game.screen.width / 6 - game.screen.width / 12,
      game.surfacearray[0].position.y - (game.screen.height / 16 + 1) - 100,
      game.screen.width / 36,
      game.screen.height / 16,
      5, //surfacearray[0].u * gamespeed * platfriction,
      0
    );
    // this.fallspeed = 9 * gamespeed * deltatime;#
    this.initvel = 5;
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

    // this.prevstate = this;
    // this.lastPlatformIndex = 0;
  }

  draw() {
    // super.draw();
    if (this.sprite === undefined) {
      this.sprite = this.createSprite();
    }
    this.sprite.drawSprite();
  }

  update() {
    //increase landing distance and platform distance with speed.
    this.initvel = Math.min(15, Math.max(5, Math.pow(this.initvel, 1.001)));
    this.vel.x = this.initvel;
    this.fall();
    this.lastcollision = null;
    this.handleCollisions(game.surfacearray);
    if (this.currentPower && this.currentPower.name === "halfSpeed") {
      this.position.y += this.vel.y / 2;
      this.position.x += this.vel.x / 2;
    } else {
      this.position.y += this.vel.y;
      this.position.x += this.vel.x;
    }
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
            resolveCollision(this, obstacle, collbottom);
            // obstacle.colour = "blue";
            // this.collided = true;
            // if (coll.loc === "left side") {
            //   savedEnemies.push(
            //     population.splice(population.indexOf(this), 1)[0]
            //   );
            // }
          } else if (colltop.val === true && this.immune === false) {
            resolveCollision(this, obstacle, colltop);
          }
        }
      }
    }

    if (count === objectcount) {
      this.colour = "black";
      this.collided = false;
    }
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
      this.vel.x *= collision.object.friction;
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
