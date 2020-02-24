import Vector from "./Vector";
import { game } from "./main";

export function sweptAABB(cornervector, object, aabb1 = game.player) {
  if (cornervector.constructor.name !== "Vector") console.trace();
  var c1 = findIntersect(
    cornervector,
    cornervector.resultant(aabb1.vel),
    object.bottomleft(),
    object.topleft(),
    object
  );

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
    cornervector.resultant(aabb1.vel),
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
    cornervector.resultant(aabb1.vel),
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
    cornervector.resultant(aabb1.vel),
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
  var fx = (x - p1.x) / (p2.x - p1.x);
  var fy = (y - p1.y) / (p2.y - p1.y);

  var fx2 = (x - p3.x) / (p4.x - p3.x);
  var fy2 = (y - p3.y) / (p4.y - p3.y);

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

export function detectCollision(corner, platform) {
  // console.log(platform);
  var result = sweptAABB(corner, platform);
  if (result === undefined) return false;
  return result;
}

export function resolveCollision(player, object, result, corner = "bottom") {
  if (result.loc === "top" && corner === "bottom") {
    player.vel.y *= result.intersection.t;
    player.vel.y -= 0.1;
    player.position.y += player.vel.y;
    player.vel.y = 0;

    player.colour = "green";
    player.collided = true;
    player.lastcollision = result;
  }
  if (result.loc === "bottom") {
    player.vel.y *= result.intersection.t;
    player.vel.y += 0.1;
    player.position.y += player.vel.y;
    player.vel.y = 0;
  }

  if (result.loc === "left side" && object.floorspike !== false) {
    player.vel.x *= result.intersection.t;
    player.vel.x -= 0.1;
    player.position.x += player.vel.x;
    player.vel.x = 0;
  }

  if (object.floorspike !== undefined && object.floorspike === false) {
    if (result.loc === "left side") {
      player.position.x += player.vel.x * result.intersection.t - 0.1;
      player.vel.x /= 2;
    }

    if (result.loc === "bottom") {
      player.vel.x /= 2;
    }
  }
}
