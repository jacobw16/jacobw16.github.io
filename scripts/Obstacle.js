import AABB from "./AABB.js";
import Sprite from "./Sprite.js";
import Blade from "./blade.js";
import { PowerUp } from "./powerup.js";
import { camY, surfacearray } from "./main.js";

export default class Obstacle extends AABB {
  constructor(id, x, y, width, height, xvel) {
    super(x, y, width, height, xvel, 0);
    this.id = id;
    this.instantiated = false;
    this.blade = Math.random() < 0.5 ? this.createBlade() : null;
    this.powerup = Math.random() < 1 ? this.createPowerUp() : null;
  }

  draw() {
    super.draw();
  }

  move() {
    // if (this.position.x === surfacearray[0].coordinates[0])
    if (this.powerup !== null) this.powerup.update();
    if (this.blade !== null) this.blade.update();
    super.move();
  }

  createBlade() {
    var blade = new Blade(
      this.midpoint().x - 25,
      this.position.y - 300,
      50,
      50,
      this.vel.x,
      0.04 * screen.height,
      this
    );
    return blade;
  }

  createPowerUp() {
    return new PowerUp(
      this.midpoint().x - 25,
      (this.position.y - camY) / 2,
      50,
      50,
      this.vel.x
    );
  }
}
