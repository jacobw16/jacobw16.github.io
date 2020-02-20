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
    pwidth = Game.randomInRange(game.screen.width / 2, 2 * game.screen.width),
    pheight = game.screen.height - py,
    pvel = 0,
    pcoordlimit = 3
  ) {
    super(px, py, pwidth, pheight, pvel, 0);
    this.uv = pvel;
    this.instantiated = false;
    this.coordinates = [];
    this.obstacles = [];
    this.landingdistance = this.width / 12;
    this.coordinatelimit = pcoordlimit;
    this.obstacledistance = this.landingdistance;
    this.obstaclewidth = Game.randomInRange(100, 200); // change so obstacle width is not constant from initialisation
    this.obstacleheight = 50;
    this.obstaclequantity = 5;
    this.id = pId;
    this.passedplatgap = false;
    this.friction = this.getFriction();
  }

  getFriction() {
    // var frictionvalues = [0.8, 0.9, 0.65, 0.4];
    var frictionvalues = [1];
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
      if (this.obstacles.length < this.obstaclequantity) {
        var random = Game.randomInRange(0, 1);
        if (random > 0.5) {
          var newobj = new Obstacle(
            i,
            this.coordinates[i],
            this.position.y - obsHeight,
            obsWidth,
            obsHeight,
            this.vel.x
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
                  game.player.height + 100
                )),
            obsWidth,
            obsHeight,
            this.vel.x
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
      this.coordinates = this.getCoords(
        this.left() + this.obstaclewidth + this.landingdistance,
        this.right() - (this.obstaclewidth + this.landingdistance),
        game.player.width + 100 + this.obstaclewidth,
        []
      );
      this.placeObstacles(this.obstacleheight, this.obstaclewidth);
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
