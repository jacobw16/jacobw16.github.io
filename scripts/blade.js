import Rectangle from "./Rectangle";
import Sprite from "./Sprite";
import { screen, ctx } from "./main";
import { detectCollision, resolveCollision } from "./collisions";
export default class Blade extends Rectangle {
  constructor(
    x,
    y,
    w,
    h,
    xvel,
    impulse,
    parentobj,
    gravity = 0.0024 * screen.height
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
    // var img = new Image();
    // img.onload = () => {
    //   // console.log(img);
    //   ctx.drawImage(
    //     img,
    //     0,
    //     0,
    //     1907,
    //     1920,
    //     this.left(),
    //     this.top(),
    //     this.width,
    //     this.height
    //   );
    // };
    // img.src = require("./static/saw-blade.png");
    // ctx.drawImage(img, 0, this.left(), this.right());
    return new Sprite(
      1,
      1,
      "saw-blade.png",
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
