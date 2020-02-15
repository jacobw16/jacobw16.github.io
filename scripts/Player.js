import {
  surfacearray,
  gamespeed,
  gamehistory,
  screen,
  forcepos,
  detectCollision,
  newFriction,
  platfriction,
  ctx,
  player,
  deltatime,
  restartGame,
  savedEnemies,
  population
} from "./main.js";
import Rectangle from "./Rectangle.js";
import { getNormal, drawLine } from "./Helpers";
import Vector from "./Vector";
import { resolveCollision } from "./collisions.js";
import NeuralNet from "./NeuralNetwork";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import Sprite from "./Sprite.js";

// const camX = -player.midpoint().x + screen.width / 2;

export default class Player extends Rectangle {
  constructor() {
    super(
      screen.width / 6 - screen.width / 12,
      surfacearray[0].position.y - (screen.height / 16 + 1) - 100,
      screen.width / 36,
      screen.height / 16,
      5, //surfacearray[0].u * gamespeed * platfriction,
      0
    );
    // this.fallspeed = 9 * gamespeed * deltatime;#
    this.initvel = 5;
    this.jumpspeed = 0.04 * screen.height * gamespeed;
    this.gravity = 0.0012 * screen.height * gamespeed;
    this.nextPlatformvar;
    this.grabID = true;
    this.platformtocheck;
    this.collided;
    this.lastcollision = null;
    this.score = 0;
    this.sprite;
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
    this.vel.x = this.initvel;
    //increase landing distance and platform distance with speed.
    this.fall();
    this.lastcollision = null;
    this.handleCollisions(surfacearray);
    this.position.y += this.vel.y;
    this.position.x += this.vel.x;
    this.updateScore(deltatime);

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
      this.collided = false;
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
    for (var object of array) {
      //loops through all objects in a given array and checks if the player object is in collision with it.
      if (object.instantiated) {
        //
        var collision = detectCollision(this, object);

        if (collision.val === true) {
          this.onCollisionEnter(collision);
          resolveCollision(this, object, collision);
        } else {
          count++;
        }
      }

      if (object.obstacles.length > 0) {
        for (var obstacle of object.obstacles) {
          var coll = detectCollision(this, obstacle);
          if (coll.val === true) {
            resolveCollision(this, obstacle, coll);
            // obstacle.colour = "blue";
            this.collided = true;

            // if (coll.loc === "left side") {
            //   savedEnemies.push(
            //     population.splice(population.indexOf(this), 1)[0]
            //   );
            // }
          }
        }
      }
    }

    // if (object.obstacles.length > 0) {
    //   for (var obstacle of object.obstacles) {
    //     // console.log(object.id);
    //     // if (object.id === surfacearray[0].id) {
    //     //   console.log(obstacle);
    //     // }

    //     var coll = detectCollision(this, obstacle);
    //     if (coll.val === true) {
    //       obstacle.colour = "blue";
    //     }
    //   }
    // }

    if (count === array.length) {
      this.colour = "black";
      this.collided = false;
    }
  }

  nextPlatform() {
    // for (let i = 0; i < surfacearray.length; i++) {
    //   if (
    //     surfacearray[i].left() > this.right() &&
    //     surfacearray[i].instantiated
    //   ) {
    //     return surfacearray[i];
    //   }
    //   return surfacearray[1];
    // }
    let nextplatformOBJ;
    for (let i = 0; i < surfacearray.length; i++) {
      if (surfacearray[i].id === this.nextPlatformvar) {
        nextplatformOBJ = surfacearray[i];
      }
    }
    return nextplatformOBJ;
  }

  platformUnder() {
    for (let i = 0; i < surfacearray.length; i++) {
      if (
        this.right() >= surfacearray[i].left() &&
        this.left() <= surfacearray[i].right() &&
        this.bottom() <= surfacearray[i].top() &&
        surfacearray[i].instantiated
      ) {
        return surfacearray[i];
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

  onCollisionEnter(collision) {
    newFriction(collision);
    // if (this.called === undefined) {
    //   this.called = false;
    // }
    // if (this.called === false) {
    //   newFriction();
    //   this.called = true;
    // }
  }
}
