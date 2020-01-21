import Rectangle from "./Rectangle.js";

export default class Obstacle extends Rectangle {
  constructor(id, x, y, width, height, xvel) {
    super(x, y, width, height, xvel, 0);
    this.id = id;
    this.instantiated = false;
  }

  draw() {
    super.draw();
  }

  move() {
    super.move();
  }
}
