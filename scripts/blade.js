import AABB from "./AABB";
import Sprite from "./Sprite";
import { game } from "./main";
import { detectCollision, resolveCollision } from "./collisions";
export default class Blade extends AABB {
  constructor(
    x,
    y,
    w,
    h,
    xvel,
    impulse,
    parentobj,
    gravity = 0.0024 * game.screen.height
  ) {
    super(x, y, w, h, xvel, 0);
    this.impulse = impulse;
    this.gravity = gravity;
    this.parent = parentobj;
    this.sprite = this.createSprite();
  }

  draw() {
    // super.draw();
    // this.drawSprite();
    this.sprite.drawSprite(false);
    this.sprite.dx = this.left();
    this.sprite.dy = this.top();
  }

  update() {
    super.move();
    this.vel.y += this.gravity;
    this.handleCollisions();
    this.position.y += this.vel.y;
    this.draw();
  }

  createSprite() {
    return new Sprite(
      1,
      1,
      "./static/saw-blade.png",
      this.position.x,
      this.top(),
      this.width,
      this.height,
      0,
      0,
      1907,
      1920
    );
  }

  handleCollisions() {
    var coll = detectCollision(this, this.parent);
    if (coll.val === true && coll.loc === "bottom") {
      resolveCollision(this, this.parent, coll);
      this.vel.y -= this.impulse;
    }
  }
}
