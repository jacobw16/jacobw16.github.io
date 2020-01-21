import Player from "./Player.js";
import NeuralNet from  "./NeuralNetwork.js";
import {population, deltatime, screen, surfacearray, savedEnemies} from "./main.js"
export default class Enemy extends Player {
    constructor(){
        super();
        this.nn = new NeuralNet(5, 16, 2);
        this.outputvalues;
    }

    update(){
        this.vel.x = this.initvel;
        //increase landing distance and platform distance with speed.
        // this.initvel *= 1.001;
        this.fall();
        this.handleCollisions(surfacearray);
        this.position.y += this.vel.y;
        this.position.x += this.vel.x;
        this.makeDecision();
        this.updateScore(deltatime);

        if (this.top() >= screen.height) {
            savedEnemies.push(population.splice(population.indexOf(this), 1)[0]);

          }

    }

    makeDecision() {
        var inputs = [];
        //get inputs: xvel, currentx, xpos of nearest obstacle, xend of current platform, xstart of next platform
        var currentplatform; // = surfacearray[0];
        var nextplatform; //= surfacearray[1];


        // set first input as right x coordinate of player.
        inputs[0] = this.right();

        //set 2nd input as player's horizontal velocity.
        inputs[1] = this.vel.x;

        // set 3rd input as left x coordinate of nearest obstacle.
        if (!surfacearray === undefined){
          var currentDist = surfacearray[1].obstacles.position.x - this.position.x;
        } else{
          currentDist = 0;
        }
        inputs[2] = null;

        //Loop through all platforms
        for (var plat of surfacearray) {
          //find the platform that the player is currently on.
          if (
            this.left() >= plat.left() &&
            this.right() <= plat.right() &&
            plat.instantiated
          ) {
            //set current platform to the platform that satisfies conditions.
            currentplatform = plat;
          }

          if (plat.obstacles.length > 0){
            for (var obstacle of plat.obstacles) {
              var dist = obstacle.position.x - this.position.x;
              if (dist < currentDist && dist >= 0) {
                //store obstacle position if it is the current closest in the search
                currentDist = dist;
                inputs[2] = obstacle.position.x;
              }
            }
          }
        }


        nextplatform = surfacearray[surfacearray.indexOf(currentplatform) + 1];
        if (currentplatform === undefined) {
          currentplatform = 0;
          inputs[3] = 0;
        } else {
          inputs[3] = currentplatform.right();
          if (currentplatform.id !== 0){
          inputs[2] = null; //currentplatform.obstacles[0].left();
        }
      }



        if (nextplatform === undefined) {
          nextplatform = surfacearray[0];
        }

        if (nextplatform === 0) {
          inputs[4] = 0;
        } else {
          inputs[4] = null;//nextplatform.left();
        }
        // console.clear();
        // console.log(inputs);
        var result = this.nn.output(inputs);
        this.outputvalues = result.dataSync();

        if (result.dataSync()[0] > result.dataSync()[1]) {
          this.jump();
        }
        }
      }
