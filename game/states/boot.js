
'use strict';

var game;
var map = {};
var layer;
var cursors;

var size;
var size_z;

function Boot() {
  //set up the map
  //set up tile size
  size = 74;
  size_z = 32;

  map = {};
  //yes, i know all the sizing and z coords are crazy wacky
  //do i know why these numbers seem to work? no
  //do they work though? yes
  //should i figure out why they are what they are? meh
  map.layers = [
    {
      tileset: "landscape",
      z: 0
    },
    {
      tileset: "landscape",
      z: size_z * 1
    },
    {
      tileset: "city",
      z: size_z * 1
    },
    {
      tileset: "building",
      z: size_z * 1
    },
    {
      tileset: "building",
      z: (size_z * 3) + 10
    },
    {
      tileset: "building",
      z: (size_z * 4) + 10
    },
    {
      tileset: "building",
      z: (size_z * 5) + 10
    },
    {
      tileset: "building",
      z: (size_z * 6) + 10
    },
    {
      tileset: "building",
      z: (size_z * 7) + 10
    },
    {
      tileset: "building",
      z: (size_z * 8) + 10
    }
  ];
  map.dimensions = {
    cols: 20,
    rows: 20
  };
}

Boot.prototype = {
  preload: function() {
    game = this.game;
    //set up groups
    game.layerManager.group = game.add.group();
    //generate the world
    game.world.setBounds(0, 0, (map.dimensions.cols * 132), (map.dimensions.rows * 74));
    game.camera.x = ((map.dimensions.cols * 132) / 2) - (1024 / 2);
    game.camera.y = ((map.dimensions.rows * 70) / 2) - (768 / 2);
    //generate all the layers
    var l = 0;
    while (l < map.layers.length){
      layer = game.layerManager.addLayer(map.layers[l].tileset, game.generate.generateMap(map, 0), map.layers[l].z);
      l++;
    }

    //build the chunk!
    game.layerManager.setAllTiles(game.generate.generateChunk(map, game.layerManager.getAllTiles()));


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
    this.drawMap(map, game.layerManager.getAllTiles());
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
  },
  clearMap: function(){

  },
  drawMap: function(map, tiles){
    //tiles in the layer
    var i;
    //layers in the map
    var l = 0;
    var tile;
    //draw each layer, starting at 0
    while (l < game.layerManager.layers.length){
      //draw each tile in each layer
      i = 0;
      while (i < tiles[l].length){
        var x = ((i % map.dimensions.cols) * size);
        var y = (Math.floor(i / map.dimensions.cols) * size);
        var z = game.layerManager.layers[l].z;
        //add the tile
        if (tiles[l][i] != 0){
          tile = game.add.isoSprite(x, y, z, game.layerManager.layers[l].tileset, tiles[l][i], game.layerManager.layers[l].group);
          tile.anchor.set(0.5, 1);
          tile.smoothed = false;
          tile.body.moves = false;

          tile.scale.x = 1;
          tile.scale.y = 1;
        }
        i++;
      }
      l++;
      game.iso.simpleSort(game.layerManager.group);
    }
  }
};

module.exports = Boot;
