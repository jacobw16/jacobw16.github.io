import { game } from "./main";
// if (player === undefined) {
//   var camX = 0;
// } else camX = -player.midpoint().x + screen.width / 2;

export default class Layer {
  constructor(
    imagefilename,
    sx = 0,
    sy = 0,
    dx = game.camX,
    dy = game.camY,
    scrollspeed = 1,
    offset = 0,
    width = game.screen.width,
    height = game.screen.height
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
    this.image = Layer.createImage(this.src);

    this.getX = function() {
      // pointer points to the starting x value of the image to be displayed.
      // the pointer increases by "scrollspeed" and as when the pointer
      // reaches a number higher than the screen's width, it will wrap back to the starting value
      // this creates the scrolling illusion.
      this.pointer = this.pointer % (this.image.width - game.camX);
      return this.pointer;
    };

    this.draw = function(
      image = this.image,
      sx = this.sx,
      sy = this.sy,
      swidth = this.width,
      sheight = this.image.height,
      dx = this.dx + game.camX,
      dy = this.dy,
      dwidth = this.width,
      dheight = this.height
    ) {
      // img to draw, sourcex, sourcey, source width, source height, destx, desty, destwidth, destheight
      game.ctx.drawImage(
        image,
        sx,
        sy,
        swidth,
        sheight,
        dx,
        dy,
        dwidth,
        dheight
      );
      // increments the pointer each frame
    };

    this.move = function() {
      this.sx += game.camX === 0 ? 0 : this.scrollspeed;
      //  this.dx -= this.scrollspeed;
      //   this.pointer += this.scrollspeed * 5;
    };
  }

  static drawImage(
    image = this.image,
    sx = this.sx,
    sy = this.sy,
    swidth = this.width,
    sheight = this.image.height,
    dx = this.dx + game.camX,
    dy = this.dy,
    dwidth = this.width,
    dheight = this.height
  ) {
    // console.table(image);
    game.ctx.drawImage(image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
  }

  static createImage(src) {
    if (src !== undefined && src.constructor.name !== "Array") {
      var img = new Image();
      img.addEventListener("load", () => {});
      if (src === "./static/city_background_clean_long.png") {
        src = require("./static/city_background_clean_long.png");
      } else if (src === "./static/city_background_clean.png") {
        src = require("./static/city_background_clean.png");
      } else if (src === "./static/game_menu.png") {
        src = require("./static/game_menu.png");
      } else if (src === "./static/26207034.png") {
        src = require("./static/26207034.png");
      } else if (src === "./static/saw-blade.png") {
        src = require("./static/saw-blade.png");
      } else if (src === "./static/gold_coin_round_blank_1.png") {
        src = require("./static/gold_coin_round_blank_1.png");
      } else if (src === "./static/gold_coin_round_blank_2.png") {
        src = require("./static/gold_coin_round_blank_2.png");
      } else if (src === "./static/gold_coin_round_blank_3.png") {
        src = require("./static/gold_coin_round_blank_3.png");
      } else if (src === "./static/gold_coin_round_blank_4.png") {
        src = require("./static/gold_coin_round_blank_4.png");
      } else if (src === "./static/gold_coin_round_blank_5.png") {
        src = require("./static/gold_coin_round_blank_5.png");
      } else if (src === "./static/gold_coin_round_blank_6.png") {
        src = require("./static/gold_coin_round_blank_6.png");
      } else if (src === "./static/metal-spikes.png") {
        src = require("./static/metal-spikes.png");
      } else if (src === "./static/metal-spike-block.png") {
        src = require("./static/metal-spike-block.png");
      } else if (src === "./static/orb_1.png") {
        src = require("./static/orb_1.png");
      } else if (src === "./static/orb_2.png") {
        src = require("./static/orb_2.png");
      } else if (src === "./static/orb_3.png") {
        src = require("./static/orb_3.png");
      } else if (src === "./static/orb_4.png") {
        src = require("./static/orb_4.png");
      } else if (src === "./static/orb_5.png") {
        src = require("./static/orb_5.png");
      } else if (src === "./static/orb_6.png") {
        src = require("./static/orb_6.png");
      } else if (src === "./static/potion1_3.png") {
        src = require("./static/potion1_3.png");
      }
      img.src = src;

      return img;
    }
  }
}
