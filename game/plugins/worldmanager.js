
'use strict';

var game;

function WorldManager(gameObj) {
  console.log("* WorldManager Init");
  game = gameObj;
}

WorldManager.prototype = {
  world: {
    layers: 10,
    units: 20,
    chunks: 4,
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
          layer.tileset = "city";
          layer.z = 0;
          break;
        case 2:
          layer.tileset = "building";
          layer.z = 0;
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
    //set up cardinal directions for bounds checking
    chunk.left = chunk.x;
    chunk.right = chunk.left + (this.world.units * this.world.tile_size);
    chunk.top = chunk.y;
    chunk.bottom = chunk.top + (this.world.units * this.world.tile_size);
    return {
      group: game.add.group(),
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
  cleanWorld: function(){
    var c = 0;
    while (c < this.chunks.length){
      this.cleanChunk(c);
      c++;
    }
  },
  cleanChunk: function(c){
    var i = 0;
    var arrLen = this.chunks[c].tiles[0].length;
    while (i < arrLen){
      if (this.chunks[c].tiles[2][i] != 0){
        //the top most layer has tiles, everything under it is dead
        this.chunks[c].tiles[1][i] = 0;
        this.chunks[c].tiles[0][i] = 0
      }else if (this.chunks[c].tiles[1][i] != 0){
        this.chunks[c].tiles[0][i] = 0
      }
      i++;
    }
  },
  clearWorld: function(){

  },
  clearChunk: function(e){

  },
  drawWorld: function(){
    var c = 0;
    var sprites = 0;
    while (c < this.chunks.length){
      sprites += this.drawChunk(c);
      c++;
    }
    console.log("Finished drawing world: " + sprites + " drawn!");
  },
  drawChunk: function(c){
    //tiles in the layer
    var totalSprites = 0;
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
          tile.scale.x = 1;
          tile.scale.y = 1;
          //TODO: refactor me, i can probably be made to be faster
          if (l == 0 || l == 1 || l == 2){
            if (i == 0){
              //set top of chunk
              this.chunks[c].top = tile.y - this.world.tile_size;
            }
            else if (i == (this.world.units - 1)){
              //set right of chunk
              this.chunks[c].right = tile.x - (this.world.tile_size / 2);
            }
            else if (i == (this.world.units * (this.world.units - 1))){
              //set left of chunk
              this.chunks[c].left = tile.x + (this.world.tile_size / 2);
            }
            else if (i == (this.world.units * this.world.units) - 1){
              //set bottom of chunk
              this.chunks[c].bottom = tile.y;
            }
          }
          totalSprites++;
        }
        i++;
      }
      l++;
      game.iso.simpleSort(this.chunks[c].group);
    }
    return totalSprites;
  }
};

module.exports = WorldManager;
