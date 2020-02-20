import Vector from "./Vector";
import { game } from "./main";

export function drawLine(from, to, colour = "green") {
  game.ctx.strokeStyle = colour;
  game.ctx.beginPath();
  game.ctx.moveTo(from.x, from.y);
  game.ctx.lineTo(to.x, to.y);
  game.ctx.stroke();
}

export function circle(where, colour = "rgb(0,255,0)") {
  game.ctx.beginPath();
  game.ctx.arc(where.x, where.y, 10, 0, Math.PI * 2);
  game.ctx.strokeStyle = colour;
  game.ctx.stroke();
}

export function difference(x, y) {
  return Math.abs(y - x);
}
