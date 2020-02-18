import AABB from "./AABB";
import { randomInRange, platformgap } from "./main";
import { player, gamehistory, gamespeed, screen } from "./main";
import { detectCollision } from "./collisions";
export class PowerUp extends AABB {
  constructor(spawnX, spawnY, width, height, xvel) {
    super(spawnX, spawnY, width, height, xvel, 0);
    this.powers = [
      this.reduceDistance,
      this.obstacleImmunity,
      this.halfSpeed,
      this.refillRewindTime
    ];
    this.power = this.getPower();
  }

  update() {
    this.handleCollisions();
    super.move();
    super.draw();
  }

  getPower() {
    return this.powers[Math.floor(randomInRange(0, this.powers.length))];
  }

  handleCollisions() {
    var collision = detectCollision(player, this);
    if (collision.val === true) {
      this.activatePower();
    }
  }

  activatePower() {
    this.power();
    screen.style.background = "rgba(0, 255, 0, 0.3)";
    player.currentPower = this.power;
  }

  reduceDistance() {
    // platformgap /= 2;
  }

  obstacleImmunity() {
    player.immune = true;
  }

  halfSpeed() {
    // gamespeed *= 0.5;
  }

  refillRewindTime() {}
}
