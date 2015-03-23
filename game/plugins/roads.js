
'use strict';

var game;

function Roads(gameObj) {
  console.log("* Roads Init");
  game = gameObj;
}

Roads.prototype = {
  fixRoads: function(tiles){
    //give it all your tiles and it makes your roads perfect
  },
  getIndex: function(directions, set){
    //give it an array of directions and it will tell you which piece fits the bill
    var i = 0;
    var needle = {
      n: directions.indexOf("n") != -1 ? true : false,
      e: directions.indexOf("e") != -1 ? true : false,
      w: directions.indexOf("w") != -1 ? true : false,
      s: directions.indexOf("s") != -1 ? true : false,
      set: set
    }
    for (var key in game.tiles.roads) {
      if (game.tiles.roads.hasOwnProperty(key)) {
        if (JSON.stringify(game.tiles.roads[key]) === JSON.stringify(needle)){
          return parseInt(key);
        }
      }
    }
    console.log("! No match found for getIndex in Roads");
    return false;
  },
  getDirections: function(index){

  }
};

module.exports = Roads;
