
'use strict';

function Terrain() {
  console.log("terrain init");
}

Terrain.prototype = {
  generateIsland: function(map) {
    /*
    grass - 67
    water - 66
    sand - 59
    */
    var totalTiles = map.dimensions.cols * map.dimensions.rows;
    //first pass to draw water
    var i = 0;
    while (i < totalTiles){
      var x = (i % map.dimensions.cols);
      var y = Math.floor(i / map.dimensions.cols);
      if (x == 0 || y == 0){
        map.tiles[i] = 66;
      }else if (x == (map.dimensions.cols - 1)){
        map.tiles[i] = 34;
      }else if (y == (map.dimensions.rows - 1)) {
        map.tiles[i] = 27;
      }else{
        map.tiles[i] = 59;
      }
      i++;
    }
    //set the last tile to water
    map.tiles[i-1] = 68;
    return map;
    console.log("generate island called");
  }
};

module.exports = Terrain;
