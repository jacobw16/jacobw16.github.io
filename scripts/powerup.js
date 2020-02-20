import AABB from "./AABB";
import { game } from "./main";
import { detectCollision } from "./collisions";
import Game from "./Game.js";
export class PowerUp extends AABB {
  constructor(spawnX, spawnY, width, height, xvel) {
    super(spawnX, spawnY, width, height, xvel, 0);
    this.powers = [
      this.reducedDistance,
      this.obstacleImmunity,
      this.halfSpeed,
      this.rewindtimeRefill
    ];
    this.power = this.getPower();
  }

  update() {
    this.handleCollisions();
    super.move();
    super.draw();
  }

  getPower() {
    return this.powers[Math.floor(Game.randomInRange(0, this.powers.length))];
  }

  handleCollisions() {
    var collision = detectCollision(game.player, this);
    if (collision.val === true) {
      this.activatePower();
    }
  }

  activatePower() {
    this.power();
    game.screen.style.background = "rgba(0, 255, 0, 0.3)";
    game.player.currentPower = this.power;
  }

  reducedDistance() {
    game.platformgap = game.platformgap / 2;
  }

  obstacleImmunity() {
    game.player.immune = true;
  }

  halfSpeed() {
    game.player.vel.x /= 2;
    game.player.gravity /= 2;
    console.log(game.player.initvel);
  }

  rewindtimeRefill() {
    game.playerRewindDuration = 2;
  }
}
