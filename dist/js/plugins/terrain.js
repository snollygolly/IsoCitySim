
'use strict';

function Terrain() {
  console.log("terrain init");
}

Terrain.prototype = {
  slices: {
    island:[
      [53,42,61],
      [35,59,34],
      [60,27,68]
    ],
    hill:[
      [0,10,0],
      [16,67,15],
      [0,22,0]
    ],
    paved:[
      [114,80,119],
      [87,81,88],
      [118,95,122]
    ]
  },
  generateMap: function(map, fill){
    //generates a blank map based on dimensions
    var i = 0;
    map.tiles = [];
    while (i < (map.dimensions.cols * map.dimensions.rows)){
      map.tiles[i] = fill;
      i++;
    }
    return map;
  },
  mergePartial: function(map, partial, index){
    //takes a map, and a partial map, and merges the partial into the map
    var i = 0;
    //partial should consist of an array of arrays, one array per row
    while (i < partial.length){
      //remove items from the array
      map.tiles.splice(index + (map.dimensions.cols * i), partial[i].length);
      //remove items from the array
      map.tiles.splice.apply(map.tiles, [index + (map.dimensions.cols * i), 0].concat(partial[i]));
      i++;
    }
    return map;
  },
  generateRect: function(width, height, slice){
    //generates a rectangle based on the slice provided (hardcoded atm)
    var masterRows = [];
    var slices = this.slices[slice];
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
