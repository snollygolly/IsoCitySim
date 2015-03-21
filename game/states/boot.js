
'use strict';

var game;
var map = {};
var layer;
var cursors;

var xOffset;
var yOffset;

var size;

function Boot() {
  //set up the map
  xOffset = 100;
  yOffset = 100;
  //set up tile size
  size = 72;

  map = {};
  map.dimensions = {};
  map.dimensions.cols = 5;
  map.dimensions.rows = 5;
}

Boot.prototype = {
  preload: function() {
    game = this.game;
    game.world.setBounds(0, 0, ((size * 2) * map.dimensions.cols), ((size * 2) * map.dimensions.rows));
    //generate the base layer
    var layer = game.layerManager.addLayer("base", 0);
    game.layerManager.layers[layer].group = game.add.group();
    game.layerManager.layers[layer].group.enableBody = true;
    game.layerManager.layers[layer].group.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;
    //generate the terrain
    game.layerManager.layers[layer].tiles = game.terrain.generateMap(map, 67);

    var rect = game.terrain.generateSliceRect(5, 5, "hill");
    game.layerManager.layers[layer].tiles = game.terrain.mergePartial(map, game.layerManager.layers[layer].tiles, rect, 0);

    //other stuff?
    game.time.advancedTiming = true;
    game.debug.renderShadow = false;
    game.stage.disableVisibilityChange = true;

    game.plugins.add(new Phaser.Plugin.Isometric(game));

    game.load.atlasXML('landscapeTiles', 'assets/landscapeTiles_sheet.png', 'assets/landscapeTiles_sheet.xml');

    game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
    game.iso.anchor.setTo(0.5, 0.1);
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
        var x = ((i % map.dimensions.cols) * size) + xOffset;
        var y = (Math.floor(i / map.dimensions.cols) * size) + yOffset;
        var z = game.layerManager.layers[l].z;
        //add the tile
        tile = game.add.isoSprite(x, y, z, 'landscapeTiles', tiles[l][i], game.layerManager.layers[l].group);
        tile.anchor.set(0.5, 1);
        tile.smoothed = false;
        tile.body.moves = false;

        tile.scale.x = 1;
        tile.scale.y = 1;
        i++;
      }
      l++;
    }
  }
};

module.exports = Boot;
