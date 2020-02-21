import AABB from "./AABB";
import { game } from "./main";
import { detectCollision } from "./collisions";
import Game from "./Game.js";
import { thresholdedReLU } from "@tensorflow/tfjs-layers/dist/exports_layers";
export class PowerUp extends AABB {
  constructor(spawnX, spawnY, width, height, xvel, parentobj) {
    super(spawnX, spawnY, width, height, xvel, 0);
    this.powers = [
      this.reducedDistance,
      this.obstacleImmunity,
      this.halfSpeed,
      this.rewindtimeRefill
    ];
    this.power = this.getPower();
    this.parent = parentobj;
    this.startTimer = false;
    this.timer = 0;
    this.duration = 5;
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
    var collisionright = detectCollision(game.player.bottomright(), this);
    var collisionleft = detectCollision(game.player.bottomleft(), this);
    if (collisionright.val === true || collisionleft.val === true) {
      this.activatePower();
      this.startTimer = true;
    }
  }

  activatePower() {
    this.power();
    game.screen.style.background = "rgba(0, 255, 0, 0.3)";
    game.player.currentPower = this.power;
    console.log("start timer");
  }

  deactivatePower() {
    if (this.power === this.reducedDistance) {
      game.platformgap *= 2;
    } else if (this.power === this.obstacleImmunity) {
      game.player.immune = false;
    } else if (this.power === this.halfSpeed) {
      game.player.gravity *= 2;
    }
    game.player.currentPower = undefined;
    game.screen.style.background = "rgba(032,032,032,0.3)";
    this.parent.powerup = null;
    console.log("deadded");
  }

  reducedDistance() {
    if (game.player.currentPower !== this.reducedDistance) {
      game.platformgap = game.platformgap / 2;
    }
  }

  obstacleImmunity() {
    game.player.immune = true;
  }

  halfSpeed() {
    if (game.player.currentPower !== this.halfSpeed) {
      game.player.gravity /= 2;
    }
    // player.vel.scale(0.5);
  }

  rewindtimeRefill() {
    game.playerRewindDuration = 2;
  }
}
