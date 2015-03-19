
'use strict';

function Terrain() {
  console.log("terrain init");
}

Terrain.prototype = {
  generateRect: function(width, height){
    var slices = [
      [53,42,61],
      [35,59,34],
      [60,27,68]
    ];
    var masterRows = [];
    //row index
    var r = 0;
    while (r < slices.length){
      masterRows[r] = [];
      masterRows[r][0] = slices[r][0];
      var i = 1;
      while (i < (width - 1)){
        masterRows[r][i] = slices[r][1];
        i++;
      }
      masterRows[r][i] = slices[r][2];
      r++;
    }
    //build out the final array
    var rectArr = [];
    rectArr[0] = masterRows[0];
    var r = 1;
    while (r < (height - 1)){
      rectArr[r] = masterRows[1];
      r++;
    }
    rectArr[r] = masterRows[2];
    return rectArr;
  }
};

module.exports = Terrain;
