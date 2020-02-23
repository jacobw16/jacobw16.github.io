import AABB from "./AABB.js";
import Obstacle from "./Obstacle.js";
import { drawLine } from "./Helpers";
import { game } from "./main.js";
import Vector from "./Vector";
import { getNormal, subtract } from "./Vector.js";
import Game from "./Game.js";

export default class Platform extends AABB {
  constructor(
    pId = 0,
    px = game.screen.width / 6 + game.screen.width / 72 - game.screen.width / 2,
    py = Game.randomInRange(
      game.screen.height / 2,
      game.screen.height - game.screen.height / 8
    ),
    pwidth = Game.randomInRange(game.platformMinWidth, game.platformMaxWidth),
    pheight = game.screen.height - py,
    pvel = 0,
    pcoordlimit = 3
  ) {
    super(px, py, pwidth, pheight, pvel, 0);
    this.uv = pvel;
    this.instantiated = false;
    this.coordinates = [];
    this.obstacles = [];
    this.landingDistance = this.width / 12;
    this.coordinateLimit = pcoordlimit;
    this.obstacleDistance = this.landingDistance;
    this.obstacleWidth = Game.randomInRange(100, 200); // change so obstacle width is not constant from initialisation
    this.obstacleHeight = 50;
    this.obstacleQuantity = 5;
    this.id = pId;
    this.passedplatgap = false;
    this.friction = this.getFriction();
    this.objectDistance;
  }

  getFriction() {
    // var frictionvalues = [0.8, 0.9, 0.65, 0.4];
    var frictionvalues = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    return frictionvalues[
      Math.floor(Game.randomInRange(0, frictionvalues.length))
    ];
  }
  getCoords(xMin, xMax, d, arrayy) {
    //recursive function which finds x values that satisfy the constraints passed in.
    // a random x value between a min and max value is generated.
    // if the minimum distance between each obstacles + the generated x value
    // is bigger than the maximum possible value, that single value will be returned.
    // if not, the new distance of the generated x value addded to the minimum distance between obstacles
    // is passed back into the function with the original maximum value
    var x = Game.randomInRange(xMin, xMax);
    if (d + x >= xMax) {
      return arrayy;
    } else {
      arrayy.push(x);
      return this.getCoords(d + x, xMax, d, arrayy);
    }
  }

  isOffScreen() {
    if (this.right() <= game.camX) {
      return true;
    } else return false;
  }

  placeObstacles(obsHeight, obsWidth) {
    for (var i = 0; i < this.coordinates.length; i++) {
      //loops through each generated coordinate and creates an obstacle object.
      if (this.obstacles.length < this.obstacleQuantity) {
        var random = Game.randomInRange(0, 1);
        if (random > 0.5) {
          var newobj = new Obstacle(
            i,
            this.coordinates[i],
            this.position.y - obsHeight,
            obsWidth,
            obsHeight,
            this.vel.x,
            "./static/metal-spikes.png",
            256,
            64,
            true
          );
          // newobj.position.x -= newobj.width;
        } else if (random < 0.5) {
          var newobj = new Obstacle(
            i,
            this.coordinates[i],
            this.position.y -
              (obsHeight +
                Game.randomInRange(
                  game.player.height / 2,
                  game.player.height + screen.height / 16
                )),
            obsWidth,
            obsHeight,
            this.vel.x,
            "./static/metal-spike-block.png",
            256,
            128
          );
          // newobj.position.x -= newobj.width;
        }

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

    if (this.coordinates.length === 0 && this.instantiated && this.id !== 0) {
      //generates obstacles for instantiated platforms.
      var min = this.left() + this.obstacleWidth + this.landingDistance;
      var max = this.right() - (this.obstacleWidth + this.landingDistance);
      this.objectDistance = game.player.width + 100 + this.obstacleWidth;
      this.coordinates = this.getCoords(min, max, this.objectDistance, []);
      this.coordinates = this.coordinates.sort();
      if (this.coordinates[0] - min > this.objectDistance) {
        this.coordinates = this.getCoords(
          min,
          this.coordinates[0],
          this.objectDistance,
          this.coordinates
        );
      }
      this.placeObstacles(this.obstacleHeight, this.obstacleWidth);
    }
  }

  move() {
    this.vel.x = this.uv * game.gamespeed * game.platfriction;
    for (var i of this.obstacles) {
      i.move();
    }
    this.instantiated = true;
    super.move();
  }
}
