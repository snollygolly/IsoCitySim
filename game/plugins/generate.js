
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
    //building consts
    //density, 1 out of X building tiles will be a Y
    var PARK_DENSITY = 12;
    var WALL_DENSITY = 12;
    //this will get it's own section i think
    var heart = {
      z_min: 2,
      z_max: 6,
      radius: 3
    };
    //calculate some values
    heart.x = this.getRandomNumber((HIGHWAY_SINGLE_WIDTH + heart.radius), (map.dimensions.cols - HIGHWAY_SINGLE_WIDTH) - heart.radius);
    heart.y = this.getRandomNumber((HIGHWAY_SINGLE_WIDTH + heart.radius), (map.dimensions.rows - HIGHWAY_SINGLE_WIDTH) - heart.radius);
    heart.x_min = heart.x - heart.radius;
    heart.x_max = heart.x + heart.radius;
    heart.y_min = heart.y - heart.radius;
    heart.y_max = heart.y + heart.radius;
    //start the looping for layers
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
            var index = this.getIndexFromCoords(map, x, HIGHWAY_EASEMENT)
            tiles[l] = this.generateRoad(map, tiles[l], "city_plain", index, "s", map.dimensions.rows - HIGHWAY_EASEMENT);
            //cap the highways
            tiles[l] = game.roads.joinRoadHighway(map, tiles[l], x, HIGHWAY_EASEMENT, "n");
            tiles[l] = game.roads.joinRoadHighway(map, tiles[l], x, map.dimensions.rows - 1, "s");
            x += this.getRandomNumber(MIN_ROAD_SPLIT, MAX_ROAD_SPLIT);
          }
          var y = this.getRandomNumber((ROAD_START_OFFSET + 1), (ROAD_START_OFFSET + 2));
          while (y < (map.dimensions.rows - ROAD_START_OFFSET)){
            var index = this.getIndexFromCoords(map, HIGHWAY_EASEMENT, y)
            tiles[l] = this.generateRoad(map, tiles[l], "city_plain", index, "e", map.dimensions.rows - HIGHWAY_EASEMENT);
            //cap the highways
            tiles[l] = game.roads.joinRoadHighway(map, tiles[l], HIGHWAY_EASEMENT, y, "w");
            tiles[l] = game.roads.joinRoadHighway(map, tiles[l], map.dimensions.cols - 1, y, "e");
            y += this.getRandomNumber(MIN_ROAD_SPLIT, MAX_ROAD_SPLIT);
          }
          //road magic!
          tiles[l] = game.roads.fixRoads(map, tiles[l], "city_plain");
          break;
        case 3:
          //start to generate buildings
          var ewTiles = game.roads.getIndices(["e", "w"]);
          var nsTiles = game.roads.getIndices(["n", "s"]);
          var i = 0;
          var cType, index;
          while (i < tiles[l].length){
            //randomly place features
            if (tiles[l-1][i] == 66 && this.getRandomNumber(1,PARK_DENSITY) == 1){
              //this will be a park
              tiles[l-1][i] = game.tiles.parks[this.getRandomNumber(0,game.tiles.parks.length - 1)];
            }else{
              //we aren't drawing a park
              if(this.getRandomNumber(1,WALL_DENSITY) == 1){
                //we are drawing a wall
                cType = "wall";
              }else{
                cType = "building"
              }
              if (tiles[l-1][i] != 66) {
                //find eligible directories
                var eligibleDirs = [];
                if (ewTiles.indexOf(tiles[l-1][i]) != -1 && tiles[l-1][i - map.dimensions.cols] == 66 && tiles[l][i - map.dimensions.cols] === 0){eligibleDirs.push("s");}
                if (nsTiles.indexOf(tiles[l-1][i]) != -1 && tiles[l-1][i + 1] == 66 && tiles[l][i + 1] === 0){eligibleDirs.push("w");}
                if (ewTiles.indexOf(tiles[l-1][i]) != -1 && tiles[l-1][i + map.dimensions.cols] == 66 && tiles[l][i + map.dimensions.cols] === 0){eligibleDirs.push("n");}
                if (nsTiles.indexOf(tiles[l-1][i]) != -1 && tiles[l-1][i - 1] == 66 && tiles[l][i - 1] === 0){eligibleDirs.push("e");}
                //check to see what to do (draw the buildings)
                if (eligibleDirs.indexOf("s") != -1){
                  //match the north side of the road
                  index = i - map.dimensions.cols;
                  if (cType == "building"){
                    var coords = this.getCoordsFromIndex(map, index);
                    box = game.generate.generateBuilding("s", coords, heart);
                    tiles = game.generate.mergePartial3DSafe(map, tiles, box, l, index);
                  }else if (cType == "wall"){
                    tiles[l-1][index] = game.tiles.walls.s[this.getRandomNumber(0, (game.tiles.walls.s.length - 1))];
                  }
                }
                if (eligibleDirs.indexOf("e") != -1){
                  //match the west side of the road
                  index = i - 1;
                  if (cType == "building"){
                    var coords = this.getCoordsFromIndex(map, index);
                    box = game.generate.generateBuilding("e", coords, heart);
                    tiles = game.generate.mergePartial3DSafe(map, tiles, box, l, index);
                  }else if (cType == "wall"){
                    tiles[l-1][index] = game.tiles.walls.e[this.getRandomNumber(0, (game.tiles.walls.e.length - 1))];
                  }
                }
                if (eligibleDirs.indexOf("w") != -1){
                  //match the east side of the road
                  index = i + 1;
                  if (cType == "building"){
                    var coords = this.getCoordsFromIndex(map, index);
                    box = game.generate.generateBuilding("w", coords, heart);
                    tiles = game.generate.mergePartial3DSafe(map, tiles, box, l, index);
                  }else if (cType == "wall"){
                    tiles[l-1][index] = game.tiles.walls.w[this.getRandomNumber(0, (game.tiles.walls.w.length - 1))];
                  }
                }
                if (eligibleDirs.indexOf("n") != -1){
                  //match the south side of the road
                  index = i + map.dimensions.cols;
                  if (cType == "building"){
                    var coords = this.getCoordsFromIndex(map, index);
                    box = game.generate.generateBuilding("n", coords, heart);
                    tiles = game.generate.mergePartial3DSafe(map, tiles, box, l, index);
                  }else if (cType == "wall"){
                    tiles[l-1][index] = game.tiles.walls.n[this.getRandomNumber(0, (game.tiles.walls.n.length - 1))];
                  }
                }
              }
            }
            i++;
          }
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
      //b = ((b == 0) ? 1 : 0);
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
  generateBuilding: function(direction, coords, heart){
    //test stuff with auto types and height
    var type;
    var low = heart.z_min;
    var high = heart.z_max;
    if (coords.x >= heart.x_min && coords.x <= heart.x_max && coords.y >= heart.y_min && coords.y <= heart.y_max){
      //this is going to be a commercial building
      type = "commercial";
      //figure out the distance to the heart (int = intensity)
      var int_p = 1 / (heart.radius + 1);
      var int_m_x = Math.abs(coords.x - heart.x);
      var int_m_y = Math.abs(coords.y - heart.y);
      var int_m = (int_m_x + int_m_y) / 2;
      var int = 1 - (int_m * int_p);
      var z_mod = ((high - low) * int);
      high = Math.floor(z_mod + low);
      low = (((high - 1) < low) ? low : (high - 1));
    }else{
      //this is a residential building
      type = "residential";
      low = 1;
      high = 2;
    }
    //end test
    var colors = ["red", "grey", "brown", "beige"];
    var color = colors[this.getRandomNumber(0, colors.length -1)];
    var building = null;
    //while we don't find a suitable color...
    while (building === null){
      //try to find a suitable color
      if (game.tiles.buildings[type][color].bottoms[direction].length != 0){
        var building = {
          bottom: game.tiles.buildings[type][color].bottoms[direction][this.getRandomNumber(0, game.tiles.buildings[type][color].bottoms[direction].length -1)],
          floors: this.getRandomNumber(low, high)
        };
      }else{
        //if we didn't find a suitable color, shuffle the colors
        color = colors[this.getRandomNumber(0, colors.length -1)];
      }
    }
    //directional top
    if (direction == "n" || direction == "s"){
      building.top = game.tiles.buildings[type][color].tops["ns"][this.getRandomNumber(0, game.tiles.buildings[type][color].tops["ns"].length -1)];
    }else{
      building.top = game.tiles.buildings[type][color].tops["ew"][this.getRandomNumber(0, game.tiles.buildings[type][color].tops["ew"].length -1)];
    }
    //pick a roof
    if (this.getRandomNumber(0,1) == 1 && game.tiles.buildings[type]["all"].roofs["all"].length != 0){
      //this is going to be an "all" direction roof
      building.roof = game.tiles.buildings[type]["all"].roofs["all"][this.getRandomNumber(0, game.tiles.buildings[type]["all"].roofs["all"].length -1)];
    }else{
      //directional top
      building.roof = game.tiles.buildings[type]["all"].roofs[direction][this.getRandomNumber(0, game.tiles.buildings[type]["all"].roofs[direction].length -1)];
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
  getCoordsFromIndex: function(map, index){
    //1,1 is top left corner
    //give it the index of the tile you want and get the x,y coords
    var y = Math.floor(index / map.dimensions.rows);
    var x = index - (y * map.dimensions.cols);
    return {
      x: x + 1,
      y: y + 1
    };
  },
  getIndexFromCoords: function(map, x, y){
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
