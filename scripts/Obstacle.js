import AABB from "./AABB.js";
import Sprite from "./Sprite.js";
import Blade from "./blade.js";
import { PowerUp } from "./powerup.js";
import { game } from "./main.js";
import {
  thresholdedReLU,
  Layer
} from "@tensorflow/tfjs-layers/dist/exports_layers";
import { detectCollision } from "./collisions.js";
import Vector from "./Vector.js";

export default class Obstacle extends AABB {
  constructor(
    id,
    x,
    y,
    width,
    height,
    xvel,
    src,
    imageWidth,
    imageHeight,
    floorspike = false
  ) {
    super(x, y, width, height, xvel, 0);
    this.id = id;
    this.instantiated = false;
    this.sprite = this.createSprite(src, imageWidth, imageHeight);
    this.floorspike = floorspike;
    this.collisions = true;
    if (Math.random() < 0.5 && !this.floorspike) {
      // this.blade = this.createBlade();
      this.createPowerUp();
    } else {
      this.blade = null;
    }
  }

  draw() {
    this.sprite.drawSprite(false);
    // super.draw();
  }

  move() {
    // if (this.position.x === game.surfacearray[0].coordinates[0]))
    // if (this.blade !== null) this.blade.update();
    // this.handleCollisions();
    // this.sprite.drawSprite();
    super.move();
  }
  createSprite(src, imageWidth, imageHeight) {
    return new Sprite(
      1,
      1,
      src,
      this.left(),
      this.top(),
      this.width,
      this.height,
      0,
      0,
      imageWidth,
      imageHeight,
      false
    );
  }

  handleCollisions() {
    if (this.collisions === true) {
      var result = detectCollision(
        new Vector(
          this.position.x,
          this.position.y + (this.height - this.halfsizeHeight)
        ),
        game.enemy,
        game.enemy
      );
      if (result.val === true) {
        this.vel.addForce(game.enemy.vel);
      }
    }
  }

  createBlade() {
    var blade = new Blade(
      this.midpoint().x - 25,
      this.position.y - this.height - 50,
      50,
      50,
      this.vel.x,
      0.04 * screen.height,
      this
    );
    return blade;
  }

  createPowerUp() {
    var newpowerup = new PowerUp(
      this.midpoint().x - 25,
      this.position.y - this.height,
      50,
      50,
      this.vel.x,
      this
    );
    game.powerups.push(newpowerup);
  }
}
