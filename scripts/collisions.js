import Vector from "./Vector";
import { game } from "./main";
import { drawLine } from "./Helpers";

export function sweptAABB(cornervector, object, aabb1 = game.player) {
  if (cornervector.constructor.name !== "Vector") console.trace();
  if (arguments[3] !== undefined) {
    // if the function is given a 4th parameter it is assigned as the velocity to check.
    var vel = arguments[3];
  } else {
    var vel = aabb1.vel;
  }

  // each check (c1, c2, c3, c4) takes 5 paraameters, the first being the start point of the first line, 2nd parameter is the
  // end point of the first line, 3rd is the start point of the second line and 4th is the end point of the second line.
  // the 5th parameter is the object which collisions are checked against, this is used to identify where collisions where detected in other parts of the code.
  var c1 = findIntersect(
    cornervector,
    cornervector.resultant(vel),
    object.bottomleft(),
    object.topleft(),
    object
  );

  // the findIntersect() function returns an object containing the result of the collision (true or false), the intersection point at which they meet,
  // the side of the AABB that the collision was found at and the type of object (e.g player, platform, obstacle) it also returns the original object that collisions were checked on.

  if (!c1 === false && c1 !== undefined) {
    return {
      val: true,
      intersection: c1,
      loc: "left side",
      objtype: object.constructor.name,
      object: object
    };
  }

  var c2 = findIntersect(
    cornervector,
    cornervector.resultant(vel),
    object.topleft(),
    object.topright(),
    object
  );

  if (!c2 === false && !c2 !== undefined) {
    return {
      val: true,
      intersection: c2,
      loc: "top",
      objtype: object.constructor.name,
      object: object
    };
  }

  var c3 = findIntersect(
    cornervector,
    cornervector.resultant(vel),
    object.topright(),
    object.bottomright(),
    object
  );

  if (!c3 === false && c3 !== undefined) {
    return {
      val: true,
      intersection: c3,
      loc: "right side",
      objtype: object.constructor.name,
      object: object
    };
  }

  var c4 = findIntersect(
    cornervector,
    cornervector.resultant(vel),
    object.bottomleft(),
    object.bottomright(),
    object
  );

  if (!c4 === false && c4 !== undefined) {
    return {
      val: true,
      intersection: c4,
      loc: "bottom",
      objtype: object.constructor.name,
      object: object
    };
  } else return { val: false };
}

export function findIntersect(p1, p2, p3, p4, object) {
  // lines in form Ax +By = C
  // defines line 1: a1x + b1y = c1 and line 2: a2x + b2y = c2.
  // this function finds the intersection between 2 lines
  // by equating the lines and rearanging for x and y the point of intersection is found.
  var a1 = p2.y - p1.y,
    b1 = p1.x - p2.x,
    c1 = a1 * p1.x + b1 * p1.y,
    a2 = p4.y - p3.y,
    b2 = p3.x - p4.x,
    c2 = a2 * p3.x + b2 * p3.y,
    den = a1 * b2 - a2 * b1,
    x = (c1 * b2 - c2 * b1) / den,
    y = (c2 * a1 - a2 * c1) / den;
  // drawLine(p1, p2, "green");
  // drawLine(p3, p4, "yellow");

  if (den === 0) {
    return false;
  }

  //fx and fy are the fraction/decimal of the velocity at which the collision was detected.
  var fx = (x - p1.x) / (p2.x - p1.x);
  var fy = (y - p1.y) / (p2.y - p1.y);

  var fx2 = (x - p3.x) / (p4.x - p3.x);
  var fy2 = (y - p3.y) / (p4.y - p3.y);

  // only values of fx and fy that are between 1 and 0 are accepted as this means that the collision happened within 1 frame of position change (velocity).
  //if values out of the range 1 and 0 were accepted, collisions would be found for the whole line equation of the velocity rather than
  //just the segement representing how much the player moves per frame.
  if (
    fx >= 0 &&
    fx <= 1 &&
    ((fx2 >= 0 && fx2 <= 1) || (fy2 >= 0 && fy2 <= 1))
  ) {
    return { point: new Vector(x, y), t: fx };
  }

  if (
    fy >= 0 &&
    fy <= 1 &&
    ((fx2 >= 0 && fx2 <= 1) || (fy2 >= 0 && fy2 <= 1))
  ) {
    return { point: new Vector(x, y), t: fy };
  } else return false;
}

export function detectCollision(corner, platform, aabb1) {
  // console.log(platform);

  //calls the continuous collision detection function above.
  var result = sweptAABB(corner, platform, aabb1);
  if (result === undefined) return false;
  return result;
}

export function resolveCollision(player, object, result, corner = "bottom") {
  if (result.loc === "top" && corner === "bottom") {
    // player's velocity is multiplied by the t value of the intersection.
    // which indicates the fraction of velocity needed to be added so the player will move to the object but not past it .
    player.vel.y *= result.intersection.t;
    player.vel.y -= 0.1;
    player.position.y += player.vel.y;
    //velocity set to 0 after the collision so player cannot keep moving through the wall it collided with.
    player.vel.y = 0;
    player.collided = true;
    //saves this collision as the player's most recent collision.
    player.lastcollision = result;
  }
  if (result.loc === "bottom") {
    // player's velocity is multiplied by the t value of the intersection.
    // which indicates the fraction of velocity needed to be added so the player will move to the object but not past it .
    player.vel.y *= result.intersection.t;
    player.vel.y += 0.1;
    player.position.y += player.vel.y;
    player.vel.y = 0;
  }

  if (result.loc === "left side" && object.floorspike !== false) {
    // collision response for all objects other than floating platforms.
    player.vel.x *= result.intersection.t;
    player.vel.x -= 0.1;
    player.position.x += player.vel.x;
    player.vel.x = 0;
  }

  if (object.floorspike !== undefined && object.floorspike === false) {
    //specific collision response for floating platforms.
    //player is slowed by half their velocity if they hit the sides or bottom.
    if (result.loc === "left side") {
      player.position.x += player.vel.x * result.intersection.t - 0.1;
      player.vel.x /= 2;
    }

    if (result.loc === "bottom") {
      player.vel.x /= 2;
    }
  }
}
