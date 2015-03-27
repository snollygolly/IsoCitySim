
'use strict';

var game;

function Generate(gameObj) {
  console.log("* Generate Init");
  game = gameObj;
}

Generate.prototype = {
  //chunks start here
  generateChunk: function(map, tiles){
    //this generates a chunk (20x20 block) according to rules we've defined
    //this is where it happens.
    var HIGHWAY_WIDTH = game.tiles.highways.straight["n"].length + game.tiles.highways.edges["n"].length;
    //how much land undeveloped between highway and block
    var HIGHWAY_EASEMENT = 2;
    var HIGHWAY_SINGLE_WIDTH = (HIGHWAY_WIDTH + HIGHWAY_EASEMENT) / 2;
    //only half of the highway width is used on each side, that equals a full one
    var CITY_CHUNK_SPACE = map.dimensions.cols - (HIGHWAY_WIDTH + HIGHWAY_EASEMENT);
    var CITY_START = (map.dimensions.cols * HIGHWAY_SINGLE_WIDTH) + HIGHWAY_SINGLE_WIDTH;
    //road consts
    var ROAD_START_OFFSET = 4;
    var MIN_ROAD_SPLIT = 3;
    var MAX_ROAD_SPLIT = 4;
    var l = 0;
    var rect, box;
    //this is hardcoded for now, may change, may not, buildings start on 3
    while (l < 4){
      switch (l){
        case 0:
          //dirt, fill the entire chunk with dirt
          rect = this.generateRect(map.dimensions.cols, map.dimensions.rows, 83);
          tiles[l] = this.mergePartial2D(map, tiles[l], rect, 0);
          break;
        case 1:
          //grass on dirt
          rect = this.generateRect(map.dimensions.cols, map.dimensions.rows, 67);
          tiles[l] = this.mergePartial2D(map, tiles[l], rect, 0);
          break;
        case 2:
          //this spawns paved areas
          //14 because the highway takes up 3 on each edge, this will probably change
          rect = this.generateRect(CITY_CHUNK_SPACE, CITY_CHUNK_SPACE, 66);
          //starting on 63 because that's the 4,4 after highway edges
          tiles[l] = this.mergePartial2DSafe(map, tiles[l], rect, CITY_START);
          //drawing highways
          tiles[l] = this.generateHighway(map, tiles[l], 0, "s", ["e"], map.dimensions.rows);
          tiles[l] = this.generateHighway(map, tiles[l], (map.dimensions.cols - (HIGHWAY_WIDTH / 2)), "s", ["w"], map.dimensions.rows);
          tiles[l] = this.generateHighway(map, tiles[l], 0, "e", ["s"], map.dimensions.cols);
          tiles[l] = this.generateHighway(map, tiles[l], ((map.dimensions.cols * map.dimensions.rows) - (map.dimensions.cols * (HIGHWAY_WIDTH / 2))), "e", ["n"], map.dimensions.cols);
          //fix the highways
          tiles[l] = game.roads.fixHighways(map, tiles[l], "nw");
          tiles[l] = game.roads.fixHighways(map, tiles[l], "ne");
          tiles[l] = game.roads.fixHighways(map, tiles[l], "se");
          tiles[l] = game.roads.fixHighways(map, tiles[l], "sw");
          //start to spawn the roads
          var x = this.getRandomNumber((ROAD_START_OFFSET + 1), (ROAD_START_OFFSET + 2));
          while (x < (map.dimensions.cols - ROAD_START_OFFSET)){
            var index = this.getIndexFromCoords(map, tiles, x, HIGHWAY_EASEMENT)
            tiles[l] = this.generateRoad(map, tiles[l], "city_plain", index, "s", map.dimensions.rows - HIGHWAY_EASEMENT);
            x += this.getRandomNumber(MIN_ROAD_SPLIT, MAX_ROAD_SPLIT);
          }
          var y = this.getRandomNumber((ROAD_START_OFFSET + 1), (ROAD_START_OFFSET + 2));
          while (y < (map.dimensions.rows - ROAD_START_OFFSET)){
            var index = this.getIndexFromCoords(map, tiles, HIGHWAY_EASEMENT, y)
            tiles[l] = this.generateRoad(map, tiles[l], "city_plain", index, "e", map.dimensions.cols - HIGHWAY_EASEMENT);
            y += this.getRandomNumber(MIN_ROAD_SPLIT, MAX_ROAD_SPLIT);
          }
          //road magic!
          tiles[l] = game.roads.fixRoads(map, tiles[l], "city_plain");
          break;
        case 3:

          break;
      }
      l++;
    }
    return tiles;
  },
  //highways start here
  generateHighway: function(map, tiles, start, direction, half, length){
    //generates highways from lines (2d, pass in only one array)
    //lines should be expressed: {start: 1, direction: s, length: 5}
    var highway = game.tiles.highways.straight[direction];
    var edge = game.tiles.highways.edges[direction]
    var fullSlice = [edge[b], highway[0], highway[1], edge[b]];
    var i = 0;
    //for border toggle
    var b = 0;
    while (i < length){
      //flip flop b
      b = ((b == 0) ? 1 : 0);
      fullSlice = [edge[b], highway[0], highway[1], edge[b]];
      //the the direction matching logic stuff
      if (direction == "e" || direction == "w"){
        //everything is same except the offset
        var index = ((direction == "e") ? (start + i) : (start -1) );
        var c = 0;
        if (half.indexOf("n") != -1){
          tiles[index + (map.dimensions.cols * c++)] = fullSlice[0];
          tiles[index + (map.dimensions.cols * c++)] = fullSlice[1];
        }
        if (half.indexOf("s") != -1){
          tiles[index + (map.dimensions.cols * c++)] = fullSlice[2];
          tiles[index + (map.dimensions.cols * c++)] = fullSlice[3];
        }
      }else if (direction == "n" || direction == "s"){
        //everything is same except the offset
        var index = ((direction == "s") ? (start + (map.dimensions.cols * i)) : (start - (map.dimensions.cols * i)));
        var c = 0;
        if (half.indexOf("w") != -1){
          tiles[index + (c++)] = fullSlice[0];
          tiles[index + (c++)] = fullSlice[1];
        }
        if (half.indexOf("e") != -1){
          tiles[index + (c++)] = fullSlice[2];
          tiles[index + (c++)] = fullSlice[3];
        }
      }
      i++;
    }
    return tiles;
  },
  //roads start here
  generateRoad: function(map, tiles, set, start, direction, length){
    //generates roads from lines (2d, pass in only one array)
    //lines should be expressed: {start: 1, direction: s, length: 5}
    if (direction == "n" || direction == "s"){
      var road = game.roads.getIndex("ns".split(""), "city_plain");
    }else{
      var road = game.roads.getIndex("ew".split(""), "city_plain");
    }
    tiles[start] = road;

    var i = 1;
    while (i < length){
      switch (direction) {
        case "n":
          tiles[start - (map.dimensions.cols * i)] = road;
          break;
        case "e":
          tiles[start + i] = road;
          break;
        case "w":
          tiles[start - i] = road;
          break;
        case "s":
          tiles[start + (map.dimensions.cols * i)] = road;
          break;
      }
      i++;
    }
    return tiles;
  },
  //buildings starts here
  generateBuilding: function(direction, low, high){
    var colors = ["red", "grey"];
    var color = colors[this.getRandomNumber(0, colors.length -1)];
    var building = {
      bottom: game.tiles.buildings[color].bottoms[direction][this.getRandomNumber(0, game.tiles.buildings[color].bottoms[direction].length -1)],
      floors: this.getRandomNumber(low, high)
    };
    if (this.getRandomNumber(0,1) == 1){
      //this is going to be an "all" direction top
      building.top = game.tiles.buildings[color].tops["all"][this.getRandomNumber(0, game.tiles.buildings[color].tops["all"].length -1)];
    }else{
      //directional top
      if (direction == "n" || direction == "s"){
        building.top = game.tiles.buildings[color].tops["ns"][this.getRandomNumber(0, game.tiles.buildings[color].tops["ns"].length -1)];
      }else{
        building.top = game.tiles.buildings[color].tops["ew"][this.getRandomNumber(0, game.tiles.buildings[color].tops["ew"].length -1)];
      }
    }
    if (this.getRandomNumber(0,1) == 1){
      //this is going to be an "all" direction roof
      building.roof = game.tiles.buildings["all"].roofs["all"][this.getRandomNumber(0, game.tiles.buildings["all"].roofs["all"].length -1)];
    }else{
      //directional top
      building.roof = game.tiles.buildings["all"].roofs[direction][this.getRandomNumber(0, game.tiles.buildings["all"].roofs[direction].length -1)];
    }
    return this.makeBuilding(building);
  },
  makeBuilding: function(building){
    var returnArr = this.makeFilled3DArray(building.top, building.floors);
    returnArr[0][0] = building.bottom;
    returnArr.push([building.roof]);
    return returnArr;
  },
  //terrain starts here
  generateMap: function(map, fill){
    //generates a blank map based on dimensions
    var i = 0;
    var tiles = [];
    while (i < (map.dimensions.cols * map.dimensions.rows)){
      tiles[i] = fill;
      i++;
    }
    return tiles;
  },
  generateRect: function(width, height, fill){
    var r = 0;
    var rows = [];
    while (r < height){
      rows[r] = this.makeFilled2DArray(fill, width);
      r++;
    }
    return rows;
  },
  generateSliceRect: function(width, height, slice){
    //generates a rectangle based on the slice provided (hardcoded atm)
    var masterRows = [];
    var slices = game.tiles.slices[slice];
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
  },
  //misc utility functions start here
  makeFilled2DArray: function(fill, length){
    //makes a filled array: [0,0,0]
    var array = [];
    for (var i = 0; i < length; i++) {
        array[i] = fill;
    }
    return array;
  },
  makeFilled3DArray: function(fill, length){
    //makes a filled 3d array: [[0], [0]]
    //currently only makes single length arrays
    var array = [];
    for (var i = 0; i < length; i++) {
      array[i] = [fill];
    }
    return array;
  },
  mergePartial2D: function(map, tiles, partial, index){
    //will overwrite all tiles
    //takes a map, and a partial map, and merges the partial into the map
    var i = 0;
    //partial should consist of an array of arrays, one array per row
    while (i < partial.length){
      //remove items from the array
      tiles.splice(index + (map.dimensions.cols * i), partial[i].length);
      //remove items from the array
      tiles.splice.apply(tiles, [index + (map.dimensions.cols * i), 0].concat(partial[i]));
      i++;
    }
    return tiles;
  },
  mergePartial3D: function(map, tiles, partial, layer, index){
    //will overwrite all tiles
    //takes a map, and a partial map, and merges the partial into the map
    //expects 3d arrays for tiles and partial
    var l = 0;
    while (l < partial.length){
      tiles[(l + layer)] = this.mergePartial2D(map, tiles[(l + layer)], partial[l], index);
      l++;
    }
    return tiles;
  },
  //misc utility functions start here
  mergePartial2DSafe: function(map, tiles, partial, index){
    //will overwrite all tiles
    //takes a map, and a partial map, and merges the partial into the map
    var i = 0;
    //partial should consist of an array of arrays, one array per row
    while (i < partial.length){
      var j = 0;
      while (j < partial[i].length){
        if (partial[i][j] != 0){
          //there's some content here we want to merge
          tiles[index + (map.dimensions.cols * i) + j] = partial[i][j];
        }
        j++;
      }
      i++;
    }
    return tiles;
  },
  mergePartial3DSafe: function(map, tiles, partial, layer, index){
    //will overwrite all tiles
    //takes a map, and a partial map, and merges the partial into the map
    //expects 3d arrays for tiles and partial
    var l = 0;
    while (l < partial.length){
      tiles[(l + layer)] = this.mergePartial2DSafe(map, tiles[(l + layer)], [partial[l]], index);
      l++;
    }
    return tiles;
  },
  getIndexFromCoords: function(map, tiles, x, y){
    //1,1 is top left corner
    //give it the x / y of the tile you want, and it'll give you its index in the array
    var xOffset = x - 1;
    var yOffset = (y - 1) * map.dimensions.cols;
    return xOffset + yOffset;
  },
  getRandomNumber: function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

module.exports = Generate;
