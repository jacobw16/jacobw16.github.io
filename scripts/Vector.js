export default class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  resultant(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  modulus() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalized() {
    return new Vector(this.x / this.modulus(), this.y / this.modulus());
  }

  dotprod(vector) {
    return (
      this.normalized().x * vector.normalized().x +
      this.normalized().y * vector.normalized().y
    );
  }

  addForce(vector) {
    // Add a vector to the current vector instance
    this.x += vector.x;
    this.y += vector.y;
  }

  scale(scalefactor) {
    this.x *= scalefactor;
    this.y *= scalefactor;
  }

  scaled(sf) {
    // return new Vector(this.x * sf, this.y * sf);
    var scalar = sf / this.modulus();
    return new Vector(this.x * scalar, this.y * scalar);
  }

  distance(vector) {
    return Math.sqrt(
      (vector.x - this.x) * (vector.x - this.x) +
        (vector.y - this.y) * (vector.y - this.y)
    );
  }
}

export function getNormal(A, B) {
  var dx = B.x - A.x;
  var dy = B.y - A.y;
  return new Vector(dy, -dx);
}

export function subtract(vectorA, vectorB) {
  return new Vector(vectorB.x - vectorA.x, vectorB.y - vectorA.y);
}
