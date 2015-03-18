
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
    var i = 0;
    while (i < totalTiles){
      map.tiles[i] = 66;
      i++;
    }
    return map;
    console.log("generate island called");
  }
};

module.exports = Terrain;
