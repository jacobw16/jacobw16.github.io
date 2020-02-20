import { game } from "./main.js";
import Game from "./Game.js";
import Vector from "./Vector.js";
// import Obstacle from "./Obstacle.js";

export default class AABB {
  constructor(rx, ry, rwidth, rheight, xvel, yvel) {
    this.position = new Vector(rx, ry);
    this.width = rwidth;
    this.height = rheight;
    this.vel = new Vector(xvel, yvel);
    this.halfsizeWidth = this.width / 2;
    this.halfsizeHeight = this.height / 2;
    this.colour = "black";
    this.x = rx;
    this.y = ry;
  }

  right() {
    return this.position.x + this.width;
  }

  top() {
    return this.position.y;
  }

  left() {
    return this.position.x;
  }

  bottom() {
    return this.position.y + this.height;
  }

  move() {
    this.position.x -= this.vel.x; //* game.platfriction;
  }

  topleft() {
    return new Vector(this.position.x, this.position.y);
  }

  topright() {
    return new Vector(this.position.x + this.width, this.position.y);
  }

  bottomleft() {
    return new Vector(this.position.x, this.position.y + this.height);
  }

  bottomright() {
    return new Vector(
      this.position.x + this.width,
      this.position.y + this.height
    );
  }

  midpoint() {
    return new Vector(
      this.position.x + this.halfsizeWidth,
      this.position.y + this.halfsizeHeight
    );
  }

  draw() {
    game.ctx.fillStyle = this.colour;
    game.ctx.fillRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    game.ctx.fillStyle = "black";
    // if (this.instantiated !== undefined) {
    //   // console.log(this.constructor);
    //   this.instantiated = true;
    // }
  }
}
