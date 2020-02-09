import {
  screen,
  ctx,
  platfriction,
  player,
  camX,
  camY,
  population
} from "./main.js";
// if (player === undefined) {
//   var camX = 0;
// } else camX = -player.midpoint().x + screen.width / 2;

export default class Layer {
  constructor(
    imagefilename,
    sx = 0,
    sy = 0,
    dx = camX,
    dy = camY,
    scrollspeed = 1,
    offset = 0,
    width = screen.width,
    height = screen.height
  ) {
    this.src = imagefilename;
    this.sx = sx + offset;
    this.sy = sy;
    this.dx = dx;
    this.dy = dy;
    this.scrollspeed = scrollspeed;
    this.width = width;
    this.height = height;
    this.pointer = offset;
    this.image = this.createImage();

    this.getX = function() {
      // pointer points to the starting x value of the image to be displayed.
      // the pointer increases by "scrollspeed" and as when the pointer
      // reaches a number higher than the screen's width, it will wrap back to the starting value
      // this creates the scrolling illusion.
      this.pointer = this.pointer % (this.image.width - camX);
      return this.pointer;
    };

    this.draw = function() {
      // img to draw, sourcex, sourcey, source width, source height, destx, desty, destwidth, destheight
      ctx.drawImage(
        this.image,
        this.sx,
        0,
        this.width,
        this.image.height,
        this.dx + camX,
        this.dy,
        this.width,
        this.height
      );
      // increments the pointer each frame
    };

    this.move = function() {
      this.sx += camX === 0 ? 0 : this.scrollspeed;
      //  this.dx -= this.scrollspeed;
      //   this.pointer += this.scrollspeed * 5;
    };
  }

  createImage() {
    if (this.src !== undefined) {
      var img = new Image();
      img.addEventListener("load", () => {
        console.log("loaded");
      });

      if (this.src === "./static/city_background_clean_long.png") {
        this.src = require("./static/city_background_clean_long.png");
      } else if (this.src === "./static/city_background_clean.png") {
        this.src = require("./static/city_background_clean.png");
      } else if (this.src === "./static/game_menu.png") {
        this.src = require("./static/game_menu.png");
      }

      img.src = this.src;
      return img;
    } else {
      ctx.fillRect(this.dx, this.dy, this.width, this.height);
    }
  }
}

// function imageFound() {
//   alert("That image is found and loaded");
// }

// function imageNotFound() {
//   alert("That image was not found.");
// }
