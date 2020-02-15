import Rectangle from "./Rectangle.js";
import Sprite from "./Sprite.js";
import Blade from "./blade.js";

export default class Obstacle extends Rectangle {
  constructor(id, x, y, width, height, xvel) {
    super(x, y, width, height, xvel, 0);
    this.id = id;
    this.instantiated = false;
    this.blade = this.createBlade(); // Math.random() < 0.5 ? this.createBlade() : null;
  }

  draw() {
    super.draw();
  }

  move() {
    super.move();
    if (this.blade !== null) {
      this.blade.update();
    }
  }

  createBlade() {
    var blade = new Blade(
      this.left() - this.width / 1.5,
      this.position.y - 300,
      50,
      50,
      this.vel.x,
      0.04 * screen.height,
      this
    );
    return blade;
  }
}
