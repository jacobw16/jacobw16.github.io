import Player from "./Player";
import {
  camX,
  population,
  restartGame,
  randomInRange,
  savedEnemies
} from "./main";
import Enemy from "./Enemy";

export function createPopulation(size = 250, arr) {
  for (var i = 0; i < size; i++) {
    if (savedEnemies.length === 0 || savedEnemies === undefined) {
      arr.push(new Enemy());
    } else {
      arr.push(Select(savedEnemies));
    }
  }
  return arr;
}

export function Select(pop) {
  var scoreSum = 0;
  for (var i of pop) {
    scoreSum += i.score;
  }

  var rand = randomInRange(0, scoreSum);
  var selected;
  for (var enemy of pop) {
    if (rand - enemy.score < 0) {
      selected = enemy;
      break;
    } else {
      rand -= enemy.score;
    }
  }
  var child = new Enemy();
  child.nn.model = selected.nn.copy();
  child.nn.mutate(0.05);
  return child;
}

export function getFurthestPlayer() {
  var highestscore = 0;
  var target;
  for (var p of population) {
    if (p.score > highestscore) {
      highestscore = p.score;
      target = p;
    }
  }
  return target;
}

export function managePopulation() {
  if (population.length === 0) {
    console.log("new generation");
    restartGame();
  }
}
