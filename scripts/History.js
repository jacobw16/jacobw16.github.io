import { startTime } from "./main";
export default class History {
  //This class is my implementation of a stack that is currently
  // used only to check values in the previous frame(s).

  constructor(maxhistory) {
    this.stack = [];
    //defines how many frames of historic values should be stored.
    this.maxhistory = 200;
  }
  add(obj) {
    if (this.stack.length < this.maxhistory) {
      //Checks if the length of the stack exceeds the maximum history size.
      this.stack.push([obj, new Date(), new Date() - startTime]);
    } else {
      this.stack.shift();
      this.stack.push([obj, new Date(), new Date() - startTime]);
    }
  }
  peek() {
    // returns the last item added to the stack without removing it.
    return this.stack[this.stack.length - 1];
  }

  pop() {
    return this.stack.pop();
  }
}
