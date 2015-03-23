
'use strict';

var game;

function Roads(gameObj) {
  console.log("* Roads Init");
  game = gameObj;
}

Roads.prototype = {
  fixRoads: function(map, tiles){
    //give it all your tiles and it makes your roads perfect
    tiles = this.findNSProblems(map, tiles);
    tiles = this.findEWProblems(map, tiles);
    return tiles;
  },
  findNSProblems: function(map, tiles){
    var masterTiles = this.getIndices(["n", "s"]);
    var problemTiles = [];
    var i = 0;
    while (i < tiles.length){
      if (masterTiles.indexOf(tiles[i]) != -1){
        var n = i - map.dimensions.cols;
        var s = i + map.dimensions.cols;
        //there's a match, this is a "master tile, let's check its friends
        if (masterTiles.indexOf(tiles[n]) == -1){
          //there's i don't recognize what's up there
          problemTiles.push(n)
          tiles[n] = 43
        }
        if (masterTiles.indexOf(tiles[s]) == -1){
          //there's i don't recognize what's down there
          problemTiles.push(s)
          tiles[s] = 43
        }
      }
      i++;
    }
    return tiles;
  },
  findEWProblems: function(map, tiles){
    var masterTiles = this.getIndices(["e", "w"]);
    var problemTiles = [];
    var i = 0;
    while (i < tiles.length){
      if (masterTiles.indexOf(tiles[i]) != -1){
        var e = i + 1;
        var w = i - 1;
        //there's a match, this is a "master tile, let's check its friends
        if (masterTiles.indexOf(tiles[e]) == -1){
          //there's i don't recognize what's up there
          problemTiles.push(e)
          tiles[e] = 43
        }
        if (masterTiles.indexOf(tiles[w]) == -1){
          //there's i don't recognize what's down there
          problemTiles.push(w)
          tiles[w] = 43
        }
      }
      i++;
    }
    return tiles;
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
  getIndices: function(directions){
    //give it an array of directions and it will tell you which pieces fits the bill (no set required)
    var needles = [];
    var needle = {
      n: directions.indexOf("n") != -1 ? true : false,
      e: directions.indexOf("e") != -1 ? true : false,
      w: directions.indexOf("w") != -1 ? true : false,
      s: directions.indexOf("s") != -1 ? true : false
    }
    for (var key in game.tiles.roads) {
      if (game.tiles.roads[key].n == needle.n && game.tiles.roads[key].s == needle.s){
        if (game.tiles.roads[key].e == needle.e && game.tiles.roads[key].w == needle.w){
          //this piece is the piece we want
          needles.push(parseInt(key));
        }
      }
    }
    return needles;
  },
  getDirections: function(index){
    //give it an index and it will return a direction object back to you
  },
  isRoad: function(index){

  }
};

module.exports = Roads;
