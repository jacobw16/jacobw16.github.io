import Vector from "./Vector";
import { ctx } from "./main";

export function drawLine(from, to, colour = "green") {
  ctx.strokeStyle = colour;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

export function circle(where, colour = "rgb(0,255,0)") {
  ctx.beginPath();
  ctx.arc(where.x, where.y, 10, 0, Math.PI * 2);
  ctx.strokeStyle = colour;
  ctx.stroke();
}

export function difference(x, y) {
  return Math.abs(y - x);
}
