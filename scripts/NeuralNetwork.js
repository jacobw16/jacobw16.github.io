import { game } from "./main";
import _ from "lodash";
import Game from "./Game.js";

// import * as tf from "@tensorflow/tfjs";
// import * as tfvis from "@tensorflow/tfjs-vis";
//import { activation } from "@tensorflow/tfjs-layers/dist/exports_layers";

export default class NeuralNet {
  constructor(inNodes, hidNodes, outNodes) {
    if (arguments.length === 1) {
      this.model = arguments[0].copy();
      this.inNodes = arguments[0].inNodes;
      this.hidNodes = arguments[0].hidNodes;
      this.outNodes = arguments[0].outNodes;
    } else {
      this.model = NeuralNet.createModel(inNodes, hidNodes, outNodes);
      this.inNodes = inNodes;
      this.hidNodes = hidNodes;
      this.outNodes = outNodes;
    }
  }

  static createModel(inNodes, hidNodes, outNodes) {
    return tf.tidy(() => {
      const model = tf.sequential();
      //add hidden layer
      model.add(
        tf.layers.dense({
          units: hidNodes,
          inputShape: [inNodes],
          activation: "sigmoid"
        })
      );
      //add output layer
      model.add(
        tf.layers.dense({
          units: outNodes,
          activation: "softmax"
        })
      );
      return model;
    });
  }

  output(inputarr) {
    return tf.tidy(() => {
      const input = tf.tensor2d([inputarr]);
      const result = this.model.predict(input);
      return result;
    });
  }

  mutate(rate) {
    tf.tidy(() => {
      var weights = this.model.getWeights();
      var newweights = [];
      for (var arr of weights) {
        var shape = arr.shape;
        var values = arr.dataSync().slice();
        for (var j of values) {
          if (Math.random() < rate) {
            j += Game.randomInRange(-0.1, 0.1);
          }
        }
        var newarr = tf.tensor(values, shape);
        newweights.push(newarr);
      }
      this.model.setWeights(newweights);
    });
  }

  copy() {
    return tf.tidy(() => {
      var model = NeuralNet.createModel(
        this.inNodes,
        this.hidNodes,
        this.outNodes
      );
      var weights = [];
      for (var i of this.model.getWeights()) {
        weights.push(i.clone());
      }
      model.setWeights(weights);
      return model;
    });
    // return _.cloneDeep(this.model);
  }
}
