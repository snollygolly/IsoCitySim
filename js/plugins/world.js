
'use strict';

var game;

function LayerManager(gameObj) {
  console.log("* LayerManager Init");
  game = gameObj;
}

LayerManager.prototype = {
  layers: [

  ],
  group: null,
  addLayer: function(tileset, tiles, z){
    //add a layer at a specific index with name and z level
    //group: game.add.group(),
    var layer = {
      group: this.group,
      tileset: tileset,
      z: z,
      tiles: tiles
    };
    layer.group.enableBody = true;
    layer.group.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;
    this.layers.push(layer);
    return (this.layers.length - 1);
  },
  removeLayer: function(index){
    //remove a layer at index
    this.layers.splice(index, 1);
    return this.layers;
  },
  checkLayerDepth: function(index, layers){
    //checks to see if an array can fit at this index, creates the layers needed
    var i = index;
    while (i < (layers.length + index)){
      if (!this.layers[i]){
        //this layer doesn't exist
        return false;
      }
      i++;
    }
    return true;
  },
  getLayers: function(){
    //get a list of all layers
    return this.layers;
  },
  swapLayers: function(one, two){
    //swap layer one and two in index position
    var temp = this.layers[one];
    this.layers[one] = this.layers[two];
    this.layers[two] = temp;
    return this.layers;
  },
  hideLayer: function(index){

  },
  showLayer: function(index){

  },
  getAllTiles: function(){
    var i = 0;
    var tiles = [];
    while (i < this.layers.length){
      tiles[i] = this.layers[i].tiles;
      i++;
    }
    return tiles;
  },
  setAllTiles: function(tiles){
    //pass it a full layers array and it makes it happen
    var l = 0;
    while (l < tiles.length){
      this.layers[l].tiles = tiles[l];
      l++;
    }
  }
};

module.exports = LayerManager;
