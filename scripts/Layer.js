import { screen, ctx, platfriction, player, camX, population } from "./main.js";
// if (player === undefined) {
//   var camX = 0;
// } else camX = -player.midpoint().x + screen.width / 2;

export default class Layer {
  constructor(
    imagefilename,
    sx = 0,
    sy = 0,
    dx = camX,
    dy = 0,
    scrollspeed = 1,
    offset = 0,
    width = screen.width,
    height = screen.height
  ) {
    this.src = imagefilename;
    this.sx = sx;
    this.sy = sy;
    this.dx = dx;
    this.dy = dy;
    this.scrollspeed = scrollspeed;
    this.width = width;
    this.height = height;
    this.pointer = offset;

    this.getX = function() {
      // pointer points to the starting x value of the image to be displayed.
      // the pointer increases by "scrollspeed" and as when the pointer
      // reaches a number higher than the screen's width, it will wrap back to the starting value
      // this creates the scrolling illusion.
      this.pointer = this.pointer % (this.image.width - screen.width);
      return this.pointer;
    };

    this.draw = function() {
      if (this.src !== undefined) {
        //checks if there is a image source passed into the function, if there is the image is drawn
        // if not a rectangle will be drawn at the specified coordinates.
        this.image = new Image();
        this.image.src = this.src;
        this.dx = camX;
        ctx.drawImage(
          this.image,
          this.getX(),
          this.sy,
          this.width,
          this.image.height,
          this.dx,
          this.dy,
          this.width,
          this.height
        );
      } else {
        ctx.fillRect(this.dx, this.dy, this.width, this.height);
      }
      //increments the pointer each frame
      
    };

    this.move = function() {
      this.pointer += this.scrollspeed * 5;
    };
  }
}
