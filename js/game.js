(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'isocitysim', null, true, false);
  var Roads = require('./plugins/Roads');
  var Generate = require('./plugins/Generate');
  var WorldManager = require('./plugins/WorldManager');
  game.tiles = require('./tiles.json');
  game.roads = new Roads(game);
  game.generate = new Generate(game);
  game.worldManager = new WorldManager(game);

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('preload');
};

},{"./plugins/Generate":2,"./plugins/Roads":3,"./plugins/WorldManager":4,"./states/boot":5,"./states/gameover":6,"./states/menu":7,"./states/play":8,"./states/preload":9,"./tiles.json":10}],2:[function(require,module,exports){

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
    var CITY_CHUNK_SPACE = map.units - (HIGHWAY_WIDTH + HIGHWAY_EASEMENT);
    var CITY_START = (map.units * HIGHWAY_SINGLE_WIDTH) + HIGHWAY_SINGLE_WIDTH;
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
      radius: 2
    };
    //calculate some values
    heart.x = this.getRandomNumber((HIGHWAY_SINGLE_WIDTH + heart.radius), (map.units - HIGHWAY_SINGLE_WIDTH) - heart.radius);
    heart.y = this.getRandomNumber((HIGHWAY_SINGLE_WIDTH + heart.radius), (map.units - HIGHWAY_SINGLE_WIDTH) - heart.radius);
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
          rect = this.generateRect(map.units, map.units, 83);
          tiles[l] = this.mergePartial2D(map, tiles[l], rect, 0);
          break;
        case 1:
          //grass on dirt
          rect = this.generateRect(map.units, map.units, 67);
          tiles[l] = this.mergePartial2D(map, tiles[l], rect, 0);
          break;
        case 2:
          //this spawns paved areas
          //14 because the highway takes up 3 on each edge, this will probably change
          rect = this.generateRect(CITY_CHUNK_SPACE, CITY_CHUNK_SPACE, 66);
          //starting on 63 because that's the 4,4 after highway edges
          tiles[l] = this.mergePartial2DSafe(map, tiles[l], rect, CITY_START);
          //drawing highways
          tiles[l] = this.generateHighway(map, tiles[l], 0, "s", ["e"], map.units);
          tiles[l] = this.generateHighway(map, tiles[l], (map.units - (HIGHWAY_WIDTH / 2)), "s", ["w"], map.units);
          tiles[l] = this.generateHighway(map, tiles[l], 0, "e", ["s"], map.units);
          tiles[l] = this.generateHighway(map, tiles[l], ((map.units * map.units) - (map.units * (HIGHWAY_WIDTH / 2))), "e", ["n"], map.units);
          //fix the highways
          tiles[l] = game.roads.fixHighways(map, tiles[l], "nw");
          tiles[l] = game.roads.fixHighways(map, tiles[l], "ne");
          tiles[l] = game.roads.fixHighways(map, tiles[l], "se");
          tiles[l] = game.roads.fixHighways(map, tiles[l], "sw");
          //start to spawn the roads
          var x = this.getRandomNumber((ROAD_START_OFFSET + 1), (ROAD_START_OFFSET + 2));
          while (x < (map.units - ROAD_START_OFFSET)){
            var index = this.getIndexFromCoords(map, x, HIGHWAY_EASEMENT)
            tiles[l] = this.generateRoad(map, tiles[l], "city_plain", index, "s", map.units - HIGHWAY_EASEMENT);
            //cap the highways
            tiles[l] = game.roads.joinRoadHighway(map, tiles[l], x, HIGHWAY_EASEMENT, "n");
            tiles[l] = game.roads.joinRoadHighway(map, tiles[l], x, map.units - 1, "s");
            x += this.getRandomNumber(MIN_ROAD_SPLIT, MAX_ROAD_SPLIT);
          }
          var y = this.getRandomNumber((ROAD_START_OFFSET + 1), (ROAD_START_OFFSET + 2));
          while (y < (map.units - ROAD_START_OFFSET)){
            var index = this.getIndexFromCoords(map, HIGHWAY_EASEMENT, y)
            tiles[l] = this.generateRoad(map, tiles[l], "city_plain", index, "e", map.units - HIGHWAY_EASEMENT);
            //cap the highways
            tiles[l] = game.roads.joinRoadHighway(map, tiles[l], HIGHWAY_EASEMENT, y, "w");
            tiles[l] = game.roads.joinRoadHighway(map, tiles[l], map.units - 1, y, "e");
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
                //find eligible directions
                var eligibleDirs = [];
                if (ewTiles.indexOf(tiles[l-1][i]) != -1 && tiles[l-1][i - map.units] == 66){eligibleDirs.push("s");}
                if (nsTiles.indexOf(tiles[l-1][i]) != -1 && tiles[l-1][i + 1] == 66){eligibleDirs.push("w");}
                if (ewTiles.indexOf(tiles[l-1][i]) != -1 && tiles[l-1][i + map.units] == 66){eligibleDirs.push("n");}
                if (nsTiles.indexOf(tiles[l-1][i]) != -1 && tiles[l-1][i - 1] == 66){eligibleDirs.push("e");}
                //check to see what to do (draw the buildings)
                if (eligibleDirs.indexOf("s") != -1){
                  //match the north side of the road
                  index = i - map.units;
                  if (tiles[l][index] == 0){
                    if (cType == "building"){
                      var coords = this.getCoordsFromIndex(map, index);
                      box = game.generate.generateBuilding("s", coords, heart);
                      tiles = game.generate.mergePartial3DSafe(map, tiles, box, l, index);
                    }else if (cType == "wall"){
                      tiles[l-1][index] = game.tiles.walls.s[this.getRandomNumber(0, (game.tiles.walls.s.length - 1))];
                    }
                  }
                }
                if (eligibleDirs.indexOf("e") != -1){
                  //match the west side of the road
                  index = i - 1;
                  if (tiles[l][index] == 0){
                    if (cType == "building"){
                      var coords = this.getCoordsFromIndex(map, index);
                      box = game.generate.generateBuilding("e", coords, heart);
                      tiles = game.generate.mergePartial3DSafe(map, tiles, box, l, index);
                    }else if (cType == "wall"){
                      tiles[l-1][index] = game.tiles.walls.e[this.getRandomNumber(0, (game.tiles.walls.e.length - 1))];
                    }
                  }
                }
                if (eligibleDirs.indexOf("w") != -1){
                  //match the east side of the road
                  index = i + 1;
                  if (tiles[l][index] == 0){
                    if (cType == "building"){
                      var coords = this.getCoordsFromIndex(map, index);
                      box = game.generate.generateBuilding("w", coords, heart);
                      tiles = game.generate.mergePartial3DSafe(map, tiles, box, l, index);
                    }else if (cType == "wall"){
                      tiles[l-1][index] = game.tiles.walls.w[this.getRandomNumber(0, (game.tiles.walls.w.length - 1))];
                    }
                  }
                }
                if (eligibleDirs.indexOf("n") != -1){
                  //match the south side of the road
                  index = i + map.units;
                  if (tiles[l][index] == 0){
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
          tiles[index + (map.units * c++)] = fullSlice[0];
          tiles[index + (map.units * c++)] = fullSlice[1];
        }
        if (half.indexOf("s") != -1){
          tiles[index + (map.units * c++)] = fullSlice[2];
          tiles[index + (map.units * c++)] = fullSlice[3];
        }
      }else if (direction == "n" || direction == "s"){
        //everything is same except the offset
        var index = ((direction == "s") ? (start + (map.units * i)) : (start - (map.units * i)));
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
          tiles[start - (map.units * i)] = road;
          break;
        case "e":
          tiles[start + i] = road;
          break;
        case "w":
          tiles[start - i] = road;
          break;
        case "s":
          tiles[start + (map.units * i)] = road;
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
    while (i < (map.units * map.units)){
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
      tiles.splice(index + (map.units * i), partial[i].length);
      //remove items from the array
      tiles.splice.apply(tiles, [index + (map.units * i), 0].concat(partial[i]));
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
          tiles[index + (map.units * i) + j] = partial[i][j];
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
    var y = Math.floor(index / map.units);
    var x = index - (y * map.units);
    return {
      x: x + 1,
      y: y + 1
    };
  },
  getIndexFromCoords: function(map, x, y){
    //1,1 is top left corner
    //give it the x / y of the tile you want, and it'll give you its index in the array
    var xOffset = x - 1;
    var yOffset = (y - 1) * map.units;
    return xOffset + yOffset;
  },
  getRandomNumber: function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

module.exports = Generate;

},{}],3:[function(require,module,exports){

'use strict';

var game;

function Roads(gameObj) {
  console.log("* Roads Init");
  game = gameObj;
}

Roads.prototype = {
  fixRoads: function(map, tiles, set){
    //give it all your tiles and it makes your roads perfect
    //Road Magic!
    var problemTiles = [];
    var nsProbs = this.findNSProblems(map, tiles);
    var ewProbs = this.findEWProblems(map, tiles);
    problemTiles = this.arrayUnique(nsProbs.concat(ewProbs));
    //tiles = this.displayProblemTiles(tiles, problemTiles);
    //return tiles;
    tiles = this.fixProblemTiles(map, tiles, set, problemTiles);
    return tiles;
  },
  fixHighways: function(map, tiles, corner){
    //give it the tiles, the corner this join happens in, puts some corners on your highway
    //i wish this was more magical, like road magic.  *sigh*.
    switch (corner){
      case "nw":
        var cornerX = 2;
        var cornerY = 2;
        //fix the corner roads
        tiles[game.generate.getIndexFromCoords(map, cornerX - 1, cornerY - 1)] = game.tiles.highways.open;
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY - 1)] = game.tiles.highways.straight.w[1];
        tiles[game.generate.getIndexFromCoords(map, cornerX - 1, cornerY)] = game.tiles.highways.straight.n[1];
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY)] = game.tiles.highways.corner;
        //fix edge caps
        tiles[game.generate.getIndexFromCoords(map, cornerX + 1, cornerY)] = game.tiles.highways.edge_caps.w;
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY + 1)] = game.tiles.highways.edge_caps.n;
        break;
      case "ne":
        var cornerX = map.units - 1;
        var cornerY = 2;
        //fix the corner roads
        tiles[game.generate.getIndexFromCoords(map, cornerX + 1, cornerY - 1)] = game.tiles.highways.open;
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY - 1)] = game.tiles.highways.straight.w[1];
        tiles[game.generate.getIndexFromCoords(map, cornerX + 1, cornerY)] = game.tiles.highways.straight.s[0];
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY)] = game.tiles.highways.corner;
        //fix edge caps
        tiles[game.generate.getIndexFromCoords(map, cornerX - 1, cornerY)] = game.tiles.highways.edge_caps.e;
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY + 1)] = game.tiles.highways.edge_caps.n;
        break;
      case "se":
        var cornerX = map.units - 1;
        var cornerY = map.units - 1;
        //fix the corner roads
        tiles[game.generate.getIndexFromCoords(map, cornerX + 1, cornerY + 1)] = game.tiles.highways.open;
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY + 1)] = game.tiles.highways.straight.e[0];
        tiles[game.generate.getIndexFromCoords(map, cornerX + 1, cornerY)] = game.tiles.highways.straight.n[0];
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY)] = game.tiles.highways.corner;
        //fix edge caps
        tiles[game.generate.getIndexFromCoords(map, cornerX - 1, cornerY)] = game.tiles.highways.edge_caps.e;
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY - 1)] = game.tiles.highways.edge_caps.s;
        break;
      case "sw":
        var cornerX = 2;
        var cornerY = map.units - 1;
        //fix the corner roads
        tiles[game.generate.getIndexFromCoords(map, cornerX - 1, cornerY + 1)] = game.tiles.highways.open;
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY + 1)] = game.tiles.highways.straight.w[0];
        tiles[game.generate.getIndexFromCoords(map, cornerX - 1, cornerY)] = game.tiles.highways.straight.s[1];
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY)] = game.tiles.highways.corner;
        //fix edge caps
        tiles[game.generate.getIndexFromCoords(map, cornerX + 1, cornerY)] = game.tiles.highways.edge_caps.w;
        tiles[game.generate.getIndexFromCoords(map, cornerX, cornerY - 1)] = game.tiles.highways.edge_caps.s;
        break;
    }
    return tiles;
  },
  joinRoadHighway: function(map, tiles, x, y, direction){
    //joins together highways and roads
    switch (direction){
      case "n":
        //set join piece
        tiles[game.generate.getIndexFromCoords(map, x, y - 1)] = game.tiles.highways.joins.s;
        //caps
        tiles[game.generate.getIndexFromCoords(map, x - 1, y)] = game.tiles.highways.edge_caps.e;
        tiles[game.generate.getIndexFromCoords(map, x + 1, y)] = game.tiles.highways.edge_caps.w;
        break;
      case "e":
        //set join piece
        tiles[game.generate.getIndexFromCoords(map, x + 1, y)] = game.tiles.highways.joins.w;
        //caps
        tiles[game.generate.getIndexFromCoords(map, x, y - 1)] = game.tiles.highways.edge_caps.s;
        tiles[game.generate.getIndexFromCoords(map, x, y + 1)] = game.tiles.highways.edge_caps.n;
        break;
      case "w":
        //set join piece
        tiles[game.generate.getIndexFromCoords(map, x - 1, y)] = game.tiles.highways.joins.e;
        //caps
        tiles[game.generate.getIndexFromCoords(map, x, y + 1)] = game.tiles.highways.edge_caps.n;
        tiles[game.generate.getIndexFromCoords(map, x, y - 1)] = game.tiles.highways.edge_caps.s;
        break;
      case "s":
        //set join piece
        tiles[game.generate.getIndexFromCoords(map, x, y + 1)] = game.tiles.highways.joins.n;
        //caps
        tiles[game.generate.getIndexFromCoords(map, x - 1, y)] = game.tiles.highways.edge_caps.e;
        tiles[game.generate.getIndexFromCoords(map, x + 1, y)] = game.tiles.highways.edge_caps.w;
        break;
    }
    return tiles;
  },
  displayProblemTiles: function(tiles, problems){
    var i = 0;
    while (i < problems.length){
      tiles[problems[i]] = 43;
      i++;
    }
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
      var n = (problems[i] - map.units);
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
      var s = (problems[i] + map.units);
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
      var index = this.getIndexFromObj(needle);
      if (index != false){
        //we found a match
        tiles[problems[i]] = index;
        if (needle.n === true){tiles[n] = this.getIndex("ns", "city_intersection");}
        if (needle.e === true){tiles[e] = this.getIndex("ew", "city_intersection");}
        if (needle.w === true){tiles[w] = this.getIndex("ew", "city_intersection");}
        if (needle.s === true){tiles[s] = this.getIndex("ns", "city_intersection");}
      }
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
        var n = i - map.units;
        var s = i + map.units;
        //there's a match, this is a "master tile, let's check its friends
        if (masterTiles.indexOf(tiles[n]) === -1){
          //there's i don't recognize what's up there
          problemTiles.push(n)
        }
        if (masterTiles.indexOf(tiles[s]) === -1){
          //there's i don't recognize what's down there
          problemTiles.push(s)
        }
      }
      i++;
    }
    return problemTiles;
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
        }
        if (masterTiles.indexOf(tiles[w]) == -1){
          //there's i don't recognize what's down there
          problemTiles.push(w)
        }
      }
      i++;
    }
    return problemTiles;
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
    //console.log(JSON.stringify(needle));
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

},{}],4:[function(require,module,exports){

'use strict';

var game;

function WorldManager(gameObj) {
  console.log("* WorldManager Init");
  game = gameObj;
}

WorldManager.prototype = {
  world: {
    layers: 10,
    units: 15,
    chunks: 2,
    tile_size: 74,
    tile_size_z: 32
  },
  layers: [

  ],
  chunks: [

  ],
  buildLayers: function(layers){
    var l = 0;
    while (l < layers){
      var layer = {};
      switch (l){
        case 0:
          layer.tileset = "landscape";
          layer.z = 0;
          break;
        case 1:
          layer.tileset = "landscape";
          layer.z = this.world.tile_size_z * 1;
          break;
        case 2:
          layer.tileset = "city";
          layer.z = this.world.tile_size_z * 1;
          break;
        case 3:
          layer.tileset = "building";
          layer.z = this.world.tile_size_z * 1;
          break;
        default:
          layer.tileset = "building";
          layer.z = (this.world.tile_size_z * (l - 1)) + 10;
          break;
      }
      this.layers.push(layer);
      l++;
    }
  },
  createWorld: function(tiles){
    //add a layer at a specific index with name and z level
    this.buildLayers(this.world.layers);
    var c = 0;
    var chunk;
    while (c < Math.pow(this.world.chunks, 2)){
      chunk = this.createChunk(c, tiles);
      this.chunks.push(chunk);
      c++;
    }
  },
  createChunk: function(c, tiles){
    var chunk = {};
    chunk.x = (this.world.units * this.world.tile_size) * (c % this.world.chunks);
    chunk.y = (this.world.units * this.world.tile_size) * (Math.floor(c / this.world.chunks));
    var group = game.add.group();
    group.enableBody = true;
    group.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;
    return {
      group: group,
      chunk: chunk,
      tiles: this.createTiles(tiles)
    };
  },
  createTiles: function(tiles){
    var i = 0;
    var returnTiles = [];
    while (i < this.layers.length){
      returnTiles.push(tiles);
      i++;
    }
    return returnTiles;
  },
  getAllTiles: function(chunk){
    var i = 0;
    var tiles = [];
    while (i < this.chunks[chunk].tiles.length){
      tiles[i] = this.chunks[chunk].tiles[i];
      i++;
    }
    return JSON.parse(JSON.stringify(tiles));
  },
  setAllTiles: function(chunk, tiles){
    //pass it a full layers array and it makes it happen
    var l = 0;
    while (l < this.chunks[chunk].tiles.length){
      this.chunks[chunk].tiles[l] = tiles[l];
      l++;
    }
  },
  clearWorld: function(){

  },
  clearChunk: function(e){

  },
  drawWorld: function(){
    var c = 0;
    while (c < this.chunks.length){
      this.drawChunk(c);
      c++;
    }
  },
  drawChunk: function(c){
    //tiles in the layer
    var i;
    //layers in the map
    var l = 0;
    var tile;
    //draw each layer, starting at 0
    while (l < this.chunks[c].tiles.length){
      //draw each tile in each layer
      i = 0;
      while (i < this.chunks[c].tiles[l].length){
        var x = ((i % this.world.units) * this.world.tile_size) + this.chunks[c].chunk.x;
        var y = (Math.floor(i / this.world.units) * this.world.tile_size) + this.chunks[c].chunk.y;
        var z = this.layers[l].z;
        //add the tile
        if (this.chunks[c].tiles[l][i] != 0){
          tile = game.add.isoSprite(x, y, z, this.layers[l].tileset, this.chunks[c].tiles[l][i], this.chunks[c].group);
          tile.anchor.set(0.5, 1);
          tile.smoothed = false;
          tile.body.moves = false;

          tile.scale.x = 1;
          tile.scale.y = 1;
        }
        i++;
      }
      l++;
      game.iso.simpleSort(this.chunks[c].group);
    }
  }
};

module.exports = WorldManager;

},{}],5:[function(require,module,exports){

'use strict';

var game;
var cursors;

function Boot() {

}

Boot.prototype = {
  preload: function() {
    game = this.game;
    //generate the world
    var wPx = game.worldManager.world.chunks * (game.worldManager.world.units * 132);
    var hPx = game.worldManager.world.chunks * (game.worldManager.world.units * 74);
    game.world.setBounds(0, 0, wPx, hPx);
    game.camera.x = (wPx / 2) - (1024 / 2);
    game.camera.y = (hPx / 2) - (768 / 2);
    //generate all the layers
    game.worldManager.createWorld(game.generate.generateMap(game.worldManager.world, 0));
    //build the chunk!
    var c = 0;
    while (c < game.worldManager.chunks.length){
      var tiles = game.worldManager.getAllTiles(c);
      tiles = game.generate.generateChunk(game.worldManager.world, tiles);
      game.worldManager.setAllTiles(c, tiles);
      c++;
    }

    //other stuff?
    game.time.advancedTiming = true;
    game.debug.renderShadow = false;
    game.stage.disableVisibilityChange = true;
    //set up plugins and game
    game.plugins.add(new Phaser.Plugin.Isometric(game));
    game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
    game.iso.anchor.setTo(0.5, 0.2);
  },
  create: function() {
    game.worldManager.drawWorld();
    cursors = game.input.keyboard.createCursorKeys();
  },
  update: function () {
    //this is how scaling is done, but this code is super rough
    //isoGroup.scale.setTo(2,2);
    if (cursors.right.isDown){
      game.camera.x += 10;
    }
    if (cursors.left.isDown){
      game.camera.x -= 10;
    }
    if (cursors.down.isDown){
      game.camera.y += 10;
    }
    if (cursors.up.isDown){
      game.camera.y -= 10;
    }
  },
  render: function () {
    /*
    isoGroup.forEach(function (tile) {
        //game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
    });
    */
    game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
    // game.debug.text(Phaser.VERSION, 2, game.world.height - 2, "#ffff00");
  }
};

module.exports = Boot;

},{}],6:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX,100, 'Game Over!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX, 200, 'You Win!', { font: '32px Arial', fill: '#ffffff', align: 'center'});
    this.congratsText.anchor.setTo(0.5, 0.5);

    this.instructionText = this.game.add.text(this.game.world.centerX, 300, 'Click To Play Again', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionText.anchor.setTo(0.5, 0.5);
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;

},{}],7:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.sprite = this.game.add.sprite(this.game.world.centerX, 138, 'yeoman');
    this.sprite.anchor.setTo(0.5, 0.5);

    this.titleText = this.game.add.text(this.game.world.centerX, 300, '\'Allo, \'Allo!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.instructionsText = this.game.add.text(this.game.world.centerX, 400, 'Click anywhere to play "Click The Yeoman Logo"', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionsText.anchor.setTo(0.5, 0.5);

    this.sprite.angle = -20;
    this.game.add.tween(this.sprite).to({angle: 20}, 1000, Phaser.Easing.Linear.NONE, true, 0, 1000, true);
  },
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};

module.exports = Menu;

},{}],8:[function(require,module,exports){

  'use strict';
  function Play() {}
  Play.prototype = {
    create: function() {

    },
    update: function() {

    }
  };

  module.exports = Play;

},{}],9:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    console.log("* Preload Init");
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.atlasXML('landscape', 'assets/landscapeTiles_sheet.png', 'assets/landscapeTiles_sheet.xml');
    this.load.atlasXML('building', 'assets/buildingTiles_sheet.png', 'assets/buildingTiles_sheet.xml');
    this.load.atlasXML('city', 'assets/cityTiles_sheet.png', 'assets/cityTiles_sheet.xml');

  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('boot');
    }else{
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}],10:[function(require,module,exports){
module.exports={
  "slices": {
    "island":[
      [53,42,61],
      [35,59,34],
      [60,27,68]
    ],
    "hill":[
      [0,10,0],
      [16,67,15],
      [0,22,0]
    ],
    "paved":[
      [114,80,119],
      [87,81,88],
      [118,95,122]
    ],
    "grass_road":[
      [123,74,126],
      [82,0,82],
      [125,74,127]
    ],
    "city_road":[
      [122,73,125],
      [81,0,81],
      [124,73,126]
    ]
  },
  "highways": {
    "open": 80,
    "corner": 59,
    "edges": {
      "n": [75,54],
      "e": [83,62],
      "w": [83,62],
      "s": [75,54]
    },
    "edge_caps":{
      "n": 61,
      "e": 69,
      "w": 68,
      "s": 76
    },
    "joins": {
      "n": 93,
      "e": 101,
      "w": 100,
      "s": 107
    },
    "straight": {
      "n": [86,87],
      "e": [79,94],
      "w": [79,94],
      "s": [86,87]
    }
  },
  "roads": {
    "89": {
      "n": true,
      "e": true,
      "w": true,
      "s": true,
      "set": "city_plain"
    },
    "96": {
      "n": false,
      "e": true,
      "w": true,
      "s": true,
      "set": "city_plain"
    },
    "88": {
      "n": true,
      "e": false,
      "w": true,
      "s": true,
      "set": "city_plain"
    },
    "103": {
      "n": true,
      "e": true,
      "w": true,
      "s": false,
      "set": "city_plain"
    },
    "95": {
      "n": true,
      "e": true,
      "w": false,
      "s": true,
      "set": "city_plain"
    },
    "122":{
      "n": false,
      "e": true,
      "w": false,
      "s": true,
      "set": "city_plain"
    },
    "125":{
      "n": false,
      "e": false,
      "w": true,
      "s": true,
      "set": "city_plain"
    },
    "124":{
      "n": true,
      "e": true,
      "w": false,
      "s": false,
      "set": "city_plain"
    },
    "126":{
      "n": true,
      "e": false,
      "w": true,
      "s": false,
      "set": "city_plain"
    },
    "73":{
      "n": false,
      "e": true,
      "w": true,
      "s": false,
      "set": "city_plain"
    },
    "81":{
      "n": true,
      "e": false,
      "w": false,
      "s": true,
      "set": "city_plain"
    },
    "56":{
      "n": true,
      "e": false,
      "w": false,
      "s": true,
      "set": "city_intersection"
    },
    "64":{
      "n": false,
      "e": true,
      "w": true,
      "s": false,
      "set": "city_intersection"
    }
  },
  "parks":[43,51,59,67],
  "walls":{
    "n": [12,23],
    "e": [8,17],
    "s": [7,16],
    "w": [4,11],
  },
  "buildings": {
    "residential":{
      "red":{
        "bottoms": {
          "n": [92],
          "e": [36],
          "s": [30],
          "w": [106],
        },
        "tops": {
          "ns": [45,52],
          "ew": [49,54]
        }
      },
      "grey":{
        "bottoms": {
          "n": [85],
          "e": [42],
          "s": [37],
          "w": [85],
        },
        "tops": {
          "ns": [50,55],
          "ew": [53,56]
        }
      },
      "brown":{
        "bottoms": {
          "n": [131],
          "e": [21],
          "s": [14],
          "w": [131],
        },
        "tops": {
          "ns": [32,43],
          "ew": [38,47]
        }
      },
      "beige":{
        "bottoms": {
          "n": [130],
          "e": [29],
          "s": [22],
          "w": [130],
        },
        "tops": {
          "ns": [39,48],
          "ew": [44,51]
        }
      },
      "all":{
        "roofs": {
          "n": [59,64,66,73,75,77,89,91,105],
          "e": [61,68,70,80,82,84,96,112],
          "s": [58,63,65,72,74,76,88,90,104],
          "w": [57,60,62,67,69,71,81,83,97,98],
          "all": []
        }
      }
    },
    "commercial":{
      "red":{
        "bottoms": {
          "n": [33,46,92],
          "e": [1,9,17,26,41,99],
          "s": [2,10,18,34,113,123],
          "w": [25,40,106],
        },
        "tops": {
          "ns": [16,23],
          "ew": [16,23]
        }
      },
      "grey":{
        "bottoms": {
          "n": [19,35,85,114],
          "e": [3,12,28,93,100,107,116,124],
          "s": [4,20,101,108,109,115,117,125],
          "w": [11,27,122],
        },
        "tops": {
          "ns": [24,31],
          "ew": [24,31]
        }
      },
      "brown":{
        "bottoms": {
          "n": [131],
          "e": [],
          "s": [],
          "w": [131],
        },
        "tops": {
          "ns": [7,129],
          "ew": [7,129]
        }
      },
      "beige":{
        "bottoms": {
          "n": [130],
          "e": [],
          "s": [],
          "w": [130],
        },
        "tops": {
          "ns": [8,15],
          "ew": [8,15]
        }
      },
      "all":{
        "roofs": {
          "n": [87,103],
          "e": [94,110],
          "s": [86,102],
          "w": [79,95],
          "all": [5,6,13,111,118,119,120,121,127,128]
        }
      }
    }
  }
}

},{}]},{},[1])