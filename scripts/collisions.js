import { ctx, player, surfacearray } from "./main.js";
import Vector from "./Vector";
import { drawLine, difference, circle } from "./Helpers.js";

export function sweptAABB(aabb1, object) {
  var c1 = findIntersect(
    aabb1.bottomright(),
    aabb1.bottomright().resultant(aabb1.vel),
    object.bottomleft(),
    object.topleft(),
    object
  );

  if (!c1 === false && c1 !== undefined) {
    return {
      val: true,
      intersection: c1,
      loc: "left side",
      objtype: object.constructor.name
    };
  }

  var c2 = findIntersect(
    aabb1.bottomright(),
    aabb1.bottomright().resultant(aabb1.vel),
    object.topleft(),
    object.topright(),
    object
  );

  if (!c2 === false && !c2 !== undefined) {
    return {
      val: true,
      intersection: c2,
      loc: "top",
      objtype: object.constructor.name
    };
  }

  var c3 = findIntersect(
    aabb1.bottomright(),
    aabb1.bottomright().resultant(aabb1.vel),
    object.topright(),
    object.bottomright(),
    object
  );

  if (!c3 === false && c3 !== undefined) {
    return {
      val: true,
      intersection: c3,
      loc: "right side",
      objtype: object.constructor.name
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
  drawLine(p3, p4, "yellow");

  if (den === 0) {
    return false;
  }
  var fx = (x - p1.x) / (p2.x - p1.x);
  var fy = (y - p1.y) / (p2.y - p1.y);

  var fx2 = (x - p3.x) / (p4.x - p3.x);
  var fy2 = (y - p3.y) / (p4.y - p3.y);

  // if (
  //   ((fx >= 0 && fx <= 1) || (fy >= 0 && fy <= 1)) &&
  //   ((fx2 >= 0 && fx2 <= 1) || (fy2 >= 0 && fy2 <= 1))
  // ) {
  //   //should return fx/fy/fx2/fy2 rather than just fx

  //   return { point: new Vector(x, y), t: fx };
  // } else return false;

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

export function detectCollision(player, platform) {
  var result = sweptAABB(player, platform);
  if (result === undefined) return false;
  return result;
}

export function resolveCollision(player, object, result) {
  if (result.loc === "top") {
    player.vel.y *= result.intersection.t;
    player.vel.y -= 0.1;
    player.position.y += player.vel.y;
    player.vel.y = 0;
  }

  if (result.loc === "left side") {
    player.vel.x *= result.intersection.t;
  }
}
