import {
  surfacearray,
  gamespeed,
  screen,
  forcepos,
  detectCollision,
  platfriction,
  ctx,
  player,
  deltatime,
  restartGame,
  population
} from "./main.js";
import Rectangle from "./Rectangle.js";
import { getNormal, drawLine } from "./Helpers";
import Vector from "./Vector";
import { resolveCollision } from "./collisions.js";
import NeuralNet from "./NeuralNetwork";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";

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
    this.isWithinGap;
    this.nextPlatformvar;
    this.grabID = true;
    this.platformtocheck;
    this.collided;
    this.score = 0;
    // this.prevstate = this;
    // this.lastPlatformIndex = 0;
  }

  draw() {
    super.draw();
  }

  update() {
    this.vel.x = this.initvel;
    //increase landing distance and platform distance with speed.
    // this.initvel *= 1.1;
    this.fall();
    this.handleCollisions(surfacearray);
    this.position.y += this.vel.y;
    this.position.x += this.vel.x;
    this.updateScore(deltatime);
   if (this.top() >= screen.height) {
    //  restartGame();
   }

    if (this.withinGap() && this.grabID) {
      this.nextPlatformvar = surfacearray[0].id + 1;
      // this.nextPlatformvar = surfacearray[1];
      this.grabID = false;
      // forcepos(this, this.nextPlatform());
      // this.isWithinGap = true;
    }
    if (this.withinGap()) {
      // detectCollision(this, this.nextPlatform());
    } else {
      this.grabID = true;
      // this.isWithinGap = false;
    }
    // if (gamehistory.peek() !== undefined) {
    //   if (
    //     gamehistory.peek().isWithinGap === true &&
    //     this.withinGap() === false
    //   ) {
    //     this.callOnCollisionEnter = true;
    //   }
    // }

    // if (
    //   this.callOnCollisionEnter &&
    //   detectCollision(this, this.platformUnder())
    // ) {
    //   this.onCollisionEnter();
    //   this.callOnCollisionEnter = false;
    // } else {
    //   this.called = false;
    // }

    this.isWithinGap = this.withinGap();
    // this.jump();
    // console.log(gamehistory.peek());
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


  updateScore(time){
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
          resolveCollision(this, object, collision);
          if (collision.loc === "top") {
            this.colour = "green";
            this.collided = true;
          }
        } else {
          count++;
        }
        // console.log(platform.id + " " + r);
      }

      if (object.obstacles.length > 0) {
        for (var obstacle of object.obstacles) {
          // console.log(object.id);
          // if (object.id === surfacearray[0].id) {
          //   console.log(obstacle);
          // }

          var coll = detectCollision(this, obstacle);
          if (coll.val === true) {
            resolveCollision(this, obstacle, coll);
            obstacle.colour = "blue";
            this.collided = true;
            if (coll.loc === 'left side'){
              population.splice(this, 1);
            }
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

  // onCollisionEnter() {
  //   if (this.called === undefined) {
  //     this.called = false;
  //   }
  //   if (this.called === false) {
  //     newFriction();
  //     this.called = true;
  //   }
  // }
}
