import { game } from "./main.js";
import Game from "./Game.js";
import Vector from "./Vector.js";
// import Obstacle from "./Obstacle.js";

export default class AABB {
  // class for axis aligned bounding boxes.
  //all collisions will be approximated using bounding boxes.
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
    //returns the right position of the bounding box
    return this.position.x + this.width;
  }

  top() {
    //returns the top position of the bounding box
    return this.position.y;
  }

  left() {
    //returns the left position of the bounding box
    return this.position.x;
  }

  bottom() {
    //returns the bottom position of the bounding box
    return this.position.y + this.height;
  }

  move() {
    //moves the box by the velocity passed into the constructor. (on x-axis)
    this.position.x -= this.vel.x; //* game.platfriction;
  }

  topleft() {
    //returns a Vector(x,y) object containing the co-ordinates for the top left of the bounding box instance.
    return new Vector(this.position.x, this.position.y);
  }

  topright() {
    //returns a Vector(x,y) object containing the co-ordinates for the top right of the bounding box instance.
    return new Vector(this.position.x + this.width, this.position.y);
  }

  bottomleft() {
    //returns a Vector(x,y) object containing the co-ordinates for the bottom left of the bounding box instance.
    return new Vector(this.position.x, this.position.y + this.height);
  }

  bottomright() {
    //returns a Vector(x,y) object containing the co-ordinates for the bottom right of the bounding box instance.
    return new Vector(
      this.position.x + this.width,
      this.position.y + this.height
    );
  }

  midpoint() {
    //returns a Vector(x,y) object containing the co-ordinates for the mid point of the bounding box instance.
    return new Vector(
      this.position.x + this.halfsizeWidth,
      this.position.y + this.halfsizeHeight
    );
  }

  draw() {
    //draws the bounding box to the canvas with the colour passed in as a parameter in the constructor.
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
}
