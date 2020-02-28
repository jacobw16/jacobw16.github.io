import AABB from "./AABB";
import { game } from "./main";
import { detectCollision } from "./collisions";
import Sprite from "./Sprite";
import Game from "./Game.js";
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
    this.sprite = this.createSprite();
  }

  createSprite() {
    return new Sprite(
      1,
      1,
      [
        "./static/orb_1.png",
        "./static/orb_2.png",
        "./static/orb_3.png",
        "./static/orb_4.png",
        "./static/orb_5.png",
        "./static/orb_6.png"
      ],
      this.left(),
      this.top(),
      this.width,
      this.height,
      0,
      0,
      318,
      318,
      false
    );
  }

  update() {
    if (this.sprite !== undefined) this.sprite.drawSprite(true);
    this.handleCollisions();
    super.move();
    // super.draw();
  }

  getPower() {
    return this.powers[Math.floor(Game.randomInRange(0, this.powers.length))];
  }

  handleCollisions() {
    var collisionright = detectCollision(game.player.bottomright(), this);
    var collisionleft = detectCollision(game.player.bottomleft(), this);
    if (collisionright.val === true || collisionleft.val === true) {
      this.activatePower();
    }
  }

  activatePower() {
    this.power();
    game.screen.style.background = "rgba(0,255,0,0.3)";
    game.player.currentPower = this.power;
    this.startTimer = true;
  }

  deactivatePower() {
    if (this.power === this.reducedDistance) {
      game.platformgap *= 2;
    } else if (this.power === this.obstacleImmunity) {
      game.player.immune = false;
    } else if (this.power === this.halfSpeed) {
      game.player.gravity *= 2;
      game.player.velocityMultiplierx *= 2;
      game.player.velocityMultipliery *= 2;

      game.enemy.gravity *= 2;
      game.enemy.velocityMultiplierx *= 2;
      game.enemy.velocityMultipliery *= 2;
    }
    this.startTimer = false;
    game.screen.style.background = "rgba(32,32,32,0.3)";
    game.player.currentPower = undefined;
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
      game.player.velocityMultiplierx /= 2;
      game.player.velocityMultipliery /= 2;

      game.enemy.gravity /= 2;
      game.enemy.velocityMultiplierx /= 2;
      game.enemy.velocityMultipliery /= 2;
    }
    // player.vel.scale(0.5);
  }

  rewindtimeRefill() {
    game.playerRewindDuration = 2;
  }
}
