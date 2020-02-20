import { game } from "./main";
import Layer from "./Layer";

export default class Sprite extends Layer {
  constructor(
    cols,
    rows,
    src = undefined,
    dx = game.player.left(),
    dy = game.player.top(),
    dw = game.player.width,
    dh = game.player.height,
    xoffset = 20,
    yoffset = 240,
    sheetWidth = 955,
    sheetHeight = 222,
    spritesheet = true
  ) {
    super(src, 0, 0, dx, dy, 0, 0, dw, dh);
    this.cols = cols;
    this.rows = rows;
    this.frameWidth = sheetWidth / cols;
    this.frameHeight = sheetHeight / rows;
    this.currentFrame = 0;
    this.updateRate = 1;
    this.waited = 0;
    this.sxoffset = xoffset;
    this.syoffset = yoffset;
    this.spritesheet = spritesheet;
    this.rowSwitch = 0b0; //value of 1 indicates to switch to 2nd row of spritesheet.
    this.images = [];
    this.initialised = false;
    this.imagePointer = 0;
    this.timeElapsed = 0;
  }

  init() {
    if (this.src.constructor.name === "Array") {
      for (var path of this.src) {
        var img = Layer.createImage(path);
        this.images.push(img);
      }
    }
    this.initialised = true;
  }
  drawSprite(update = true) {
    if (this.src.constructor.name === "String") {
      Layer.drawImage(
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
    } else if (this.src.constructor.name === "Array") {
      if (this.initialised === false) {
        this.init();
      }
      // console.log(this.images[this.imagePointer]);
      Layer.drawImage(
        this.images[this.imagePointer],
        this.sx + this.sxoffset,
        this.sy + this.syoffset,
        this.frameWidth,
        this.frameHeight,
        this.dx,
        this.dy,
        this.width,
        this.height
      );
    }

    if (update === true) {
      this.updateSprite();
    }
  }

  updateSprite(updaterate = 240) {
    // game.ctx.clearRect(game.camX, game.camY, screen.width, screen.height);
    var updaterateSeconds = (game.secondsPerFrame * updaterate) / 1000;

    // if (this.timeElapsed >= updaterateSeconds) {
    //   this.timeElapsed = this.timeElapsed % updaterateSeconds;
    if (this.spritesheet === true) {
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
        this.dx = game.player.left();
        this.dy = game.player.top();
        this.waited = this.waited % this.updateRate;
      } else {
        this.waited += 1;
      }
    } else if (this.src.constructor.name === "Array") {
      this.imagePointer = ++this.imagePointer % this.src.length;
    }
  }
}
// } else {
//   this.timeElapsed += game.deltatime;
// }
//   }
// }
