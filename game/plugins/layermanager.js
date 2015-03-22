
'use strict';

function LayerManager() {
  console.log("layer init");
}

LayerManager.prototype = {
  layers: [

  ],
  addLayer: function(tileset, z, group){
    //add a layer at a specific index with name and z level
    var layer = {
      group: group,
      tileset: tileset,
      z: z,
      tiles: []
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
    console.log("getalltiles: " );
    console.log(tiles);
    return tiles;
  },
  setAllTiles: function(layers){
    //pass it a full layers array and it makes it happen
    var l = 0;
    while (l < layers.length){
      if (!this.layers[i]){
        //this layer doesn't exist
        this.addLayer(layers[l].tiles, layers[l].z, layers[l].group);
      }
      i++;
    }
  }
};

module.exports = LayerManager;
