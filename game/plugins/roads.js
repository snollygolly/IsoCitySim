
'use strict';

var game;

function Roads(gameObj) {
  console.log("* Roads Init");
  game = gameObj;
}

Roads.prototype = {
  fixRoads: function(map, tiles, set){
    //give it all your tiles and it makes your roads perfect
    var problemTiles = [];
    var nsProbs = this.findNSProblems(map, tiles);
    var ewProbs = this.findEWProblems(map, tiles);
    problemTiles = this.arrayUnique(nsProbs.concat(ewProbs));
    tiles = this.fixProblemTiles(map, tiles, set, problemTiles);
    return tiles;
  },
  fixProblemTiles: function(map, tiles, set, problems){
    //pass it map, tiles, and an array of problem tiles and it fixes them
    var i = 0;
    //let's work on our tiles one by one
    while (i < problems.length){
      //this is our desired object
      var needle = {
        n: false,
        e: false,
        w: false,
        s: false,
        set: set
      };
      //check to see if there's a road tile to the north
      var n = (problems[i] - map.dimensions.cols);
      if (tiles[n] != 0){
        var nX = this.getDirections(tiles[n]);
        if (nX){
          if (nX.s == true && nX.set == set){
            //this tile to the north needs a south connection (us)
            needle.n = true;
          }
        }
      }
      //check to see if there's a road tile to the south
      var s = (problems[i] + map.dimensions.cols);
      if (tiles[s] != 0){
        var sX = this.getDirections(tiles[s]);
        if (sX){
          if (sX.n == true && sX.set == set){
            //this tile to the south needs a north connection (us)
            needle.s = true;
          }
        }
      }
      //check to see if there's a road tile to the east
      var e = (problems[i] + 1);
      if (tiles[e] != 0){
        var eX = this.getDirections(tiles[e]);
        if (eX){
          if (eX.w == true && eX.set == set){
            //this tile to the east needs a west connection (us)
            needle.e = true;
          }
        }
      }
      //check to see if there's a road tile to the west
      var w = (problems[i] - 1);
      if (tiles[w] != 0){
        var wX = this.getDirections(tiles[w]);
        if (wX){
          if (wX.e == true && wX.set == set){
            //this tile to the west needs an east connection (us)
            needle.w = true;
          }
        }

      }
      //we have our needle now, let's find it!
      tiles[problems[i]] = this.getIndexFromObj(needle);
      i++;
    }
    return tiles;
  },
  findNSProblems: function(map, tiles){
    //finds problems using the n/s tile as the master tile
    var masterTiles = this.getIndices(["n", "s"]);
    var problemTiles = [];
    var i = 0;
    while (i < tiles.length){
      if (masterTiles.indexOf(tiles[i]) != -1){
        var n = i - map.dimensions.cols;
        var s = i + map.dimensions.cols;
        //there's a match, this is a "master tile, let's check its friends
        if (masterTiles.indexOf(tiles[n]) === -1){
          //there's i don't recognize what's up there
          problemTiles.push(n)
          tiles[n] = 43
        }
        if (masterTiles.indexOf(tiles[s]) === -1){
          //there's i don't recognize what's down there
          problemTiles.push(s)
          tiles[s] = 43
        }
      }
      i++;
    }
    return problemTiles;
    //return tiles;
  },
  findEWProblems: function(map, tiles){
    //finds problems using the e/w tile as the master tile
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
    return problemTiles;
    //return tiles;
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
    return this.getIndexFromObj(needle);
  },
  getIndexFromObj: function(needle){
    for (var key in game.tiles.roads) {
      if (game.tiles.roads.hasOwnProperty(key)) {
        if (this.compareJSON(game.tiles.roads[key], needle)){
          return parseInt(key);
        }
      }
    }
    console.log("! No match found for getIndexFromObj in Roads");
    console.log(JSON.stringify(needle));
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
    return game.tiles.roads[index];
  },
  isRoad: function(index){

  },
  compareJSON: function(a, b){
    if (JSON.stringify(a) === JSON.stringify(b)){
      return true;
    }else{
      return false;
    }
  },
  arrayUnique: function(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
        if(a[i] === a[j])
          a.splice(j--, 1);
      }
    }
    return a;
  }
};

module.exports = Roads;
