
'use strict';

function LayerManager() {
  console.log("layer init");
}

LayerManager.prototype = {
  layers: [

  ],
  addLayer: function(name, z){
    //add a layer at a specific index with name and z level
    var layer = {
      group: {},
      name: name,
      z: z
    };
    this.layers.push(layer);
    return (this.layers.length - 1);
  },
  removeLayer: function(index){
    //remove a layer at index
    this.layers.splice(index, 1);
    return index;
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

  }
};

module.exports = LayerManager;
