import Rectangle from "./Rectangle.js";
import Obstacle from "./Obstacle.js";
import { drawLine } from "./Helpers";
import {
  screen,
  player,
  randomInRange,
  platfriction,
  gamespeed,
  camX,
  population
} from "./main.js";
import Vector from "./Vector";
import { getNormal, subtract } from "./Vector.js";

export default class Platform extends Rectangle {
  constructor(
    pId = 0,
    px = screen.width / 6 + screen.width / 72 - screen.width / 2,
    py = randomInRange(screen.height / 2, screen.height - screen.height / 8),
    pwidth = randomInRange(screen.width / 2, screen.width),
    pheight = screen.height - py,
    pvel = 0,
    pcoordlimit = 3
  ) {
    super(px, py, pwidth, pheight, pvel, 0);
    this.u = pvel;
    this.instantiated = false;
    this.coordinates = [];
    this.obstacles = [];
    this.landingdistance = this.width / 12;
    this.coordinatelimit = pcoordlimit;
    this.obstacledistance = this.landingdistance;
    this.obstaclewidth = 100;
    this.obstacleheight = 50;
    this.obstaclequantity = 1;
    this.id = pId;
    this.passedplatgap = false;
  }

  getCoords(xMin, xMax, d, arrayy) {
    //recursive function which finds x values that satisfy the constraints passed in.
    // a random x value between a min and max value is generated.
    // if the minimum distance between each obstacles + the generated x value
    // is bigger than the maximum possible value, that single value will be returned.
    // if not, the new distance of the generated x value addded to the minimum distance between obstacles
    // is passed back into the function with the original maximum value
    var x = randomInRange(xMin, xMax);
    if (d + x >= xMax) {
      return arrayy;
    } else {
      arrayy.push(x);
      return this.getCoords(d + x, xMax, d, arrayy);
    }
  }

  isOffScreen() {
    if (this.right() <= camX) {
      return true;
    } else return false;
  }

  placeObstacles(obsHeight, obsWidth) {
    for (var i = 0; i < this.coordinates.length; i++) {
      //loops through each generated coordinate and creates an obstacle object.
      if (this.obstacles.length < this.obstaclequantity  && this.id !== 0) {
        var newobj = new Obstacle(
          i,
          this.coordinates[i],
          this.position.y - obsHeight,
          obsWidth,
          obsHeight,
          this.vel.x
        );
        newobj.position.x -= newobj.width;
        this.obstacles.push(newobj);
      } else {
        break;
      }
    }
  }

  draw() {
    super.draw();

    for (var i of this.obstacles) {
      i.draw();
    }

    if (this.coordinates.length === 0 && this.instantiated) {
      //generates obstacles for instantiated platforms.
      this.coordinates = this.getCoords(
        this.left() + this.obstaclewidth + this.landingdistance,
        this.right() - this.obstaclewidth + this.landingdistance,
        population[0].width + 100,
        []
      );
      this.placeObstacles(this.obstacleheight, this.obstaclewidth);
    }
  }

  move() {
    this.vel.x = this.u * gamespeed * platfriction;
    for (var i of this.obstacles) {
      i.move();
    }
    this.instantiated = true;
    super.move();
  }
}
