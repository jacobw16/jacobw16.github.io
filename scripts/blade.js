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
    //draws the blade sprite and assigns its x and y values to the current blade instance.
    this.sprite.drawSprite(false);
    this.sprite.dx = this.left();
    this.sprite.dy = this.top();
  }

  update() {
    //called every frame, causes the blade to shoot up and down from its parent obstacle.
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
    var coll = detectCollision(this.bottomright(), this.parent);
    if (coll.val === true && coll.loc === "bottom") {
      //move the player to the point at which it collides with the obstacle.
      this.vel.y *= coll.intersection.t;
      this.vel.y += 0.1;
      this.position.y += this.vel.y;
      //shoot the obstacle away from the obstacle parent.
      this.vel.y -= this.impulse;
    }
  }
}
