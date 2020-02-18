import { PowerUp } from "./powerup";
import { player, coins } from "./main";
import { detectCollision } from "./collisions";

export default class Coin extends PowerUp {
  constructor(spawnX, spawnY, width, height) {
    super(spawnX, spawnY, width, height, 0);
    this.value = 10;
  }

  update() {
    var collision = detectCollision(player, this);
    if (collision.val === true) {
      this.collect();
    }
  }

  collect() {
    player.score += this.value;
    coins.splice(this, 1);
  }
}
