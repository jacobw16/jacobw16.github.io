import { PowerUp } from "./powerup";
import { game } from "./main.js";
import { detectCollision } from "./collisions";
import Sprite from "./Sprite";

export default class Coin extends PowerUp {
  constructor(spawnX, spawnY, width, height) {
    super(spawnX, spawnY, width, height, 0);
    this.value = 10;
    this.sprite = new Sprite(
      1,
      1,
      [
        "./static/gold_coin_round_blank_1.png",
        "./static/gold_coin_round_blank_2.png",
        "./static/gold_coin_round_blank_3.png",
        "./static/gold_coin_round_blank_4.png",
        "./static/gold_coin_round_blank_5.png",
        "./static/gold_coin_round_blank_6.png"
      ],
      this.left(),
      this.top(),
      this.width,
      this.height,
      0,
      0,
      50,
      50,
      false
    );
  }

  update() {
    // check collisions.
    var collisionbottom = detectCollision(game.player.bottomright(), this);
    var collisiontop = detectCollision(game.player.topright(), this);
    if (collisionbottom.val === true || collisiontop.val === true) {
      //if player landed on a coin, add its value to the score and delete the coin.
      this.collect();
    }

    if (this.right() < game.camX) {
      // delete the coin if it goes off screen.
      var index = game.coins.indexOf(this);
      game.coins.splice(index, 1);
    }
  }

  draw() {
    this.sprite.drawSprite(true);
  }

  collect() {
    // adds the value of the coin to the player's score.
    game.player.score += this.value;
    var index = game.coins.indexOf(this);
    game.coins.splice(index, 1);
  }
}
