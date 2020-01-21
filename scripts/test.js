function randomInRange(min, max) {
return Math.random() * (max - min) + min;
}

var fruits = [
    {name: "mango", score: 5},
    {name: "blueberry", score: 3},
    {name: "cherry", score: 1},
    {name: "melon", score: 7},
    {name: "apple", score: 1}
  
  ];
  
    var sum = 0;
    for (var i =0; i<fruits.length;i++){
      sum += fruits[i].score;
    }
    
    for(var j=0;j<fruits.length;j++){
      fruits[j].count=0;
      fruits[j].prob = fruits[j].score/sum;
    }  
     for(var k =0; k<10000; k++){
       var fruit = pickOne(fruits);
       fruit.count++;
     }
     console.log(fruits);

  
  function pickOne(list) {
    var r = randomInRange(0,sum);
    for (var i of list) {
      if (r - i.score < 0) {
        return i;
      } else {
        r -= i.score;
      }
    }
  }