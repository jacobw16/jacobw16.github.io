import { ctx, player, camX, camY } from "./main";
import Layer from "./Layer";

export default class Sprite extends Layer {
  constructor(
    cols,
    rows,
    src,
    dx = player.left(),
    dy = player.top(),
    xoffset = 20,
    yoffset = 240
  ) {
    super(src, 0, 0, dx, dy, 0, 0, player.width, player.height);
    this.cols = cols;
    this.rows = rows;
    this.frameWidth = 955 / cols;
    this.frameHeight = 222 / rows;
    this.currentFrame = 0;
    this.updateRate = 1;
    this.waited = 0;
    this.sxoffset = xoffset;
    this.syoffset = yoffset;
    this.rowSwitch = 0b0; //value of 1 indicates to switch to 2nd row of spritesheet.
  }

  drawSprite() {
    ctx.drawImage(
      this.image,
      this.sx + this.sxoffset,
      this.sy + this.syoffset,
      this.frameWidth,
      this.frameHeight,
      this.dx,
      this.dy,
      this.width,
      this.height
    );
    this.updateSprite();
  }

  updateSprite() {
    // ctx.clearRect(camX, camY, screen.width, screen.height);
    if (this.waited >= this.updateRate) {
      if (this.currentFrame % this.cols === 0) {
        // flip the current value using bitwise XOR
        this.rowSwitch = this.rowSwitch ^ 0b1;
      }
      if (this.rowSwitch === 0b0) {
        // set the source Y value to 0 to take sprites from the first row of the spritesheet.
        this.sy = 0;
      } else if (this.rowSwitch === 0b1) {
        // set the source Y value to 120 to take sprites from the second row of the spritesheet.
        this.sy = 120;
      }
      this.currentFrame = ++this.currentFrame % this.cols;
      this.sx = this.currentFrame * this.frameWidth;
      this.dx = player.left();
      this.dy = player.top();
      this.waited = this.waited % this.updateRate;
    } else {
      this.waited += 1;
    }
  }
}
