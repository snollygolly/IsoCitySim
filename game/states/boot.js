
'use strict';

var isoGroup = [];

var game;
var map = {};
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
  map.tiles = [];
  map.dimensions = {};
  map.dimensions.cols = 20;
  map.dimensions.rows = 20;
}

Boot.prototype = {
  preload: function() {
    game = this.game;
    game.world.setBounds(0, 0, ((size * 2) * map.dimensions.cols), ((size * 2) * map.dimensions.rows));
    //generate the terrain
    map = game.terrain.generateMap(map, 67);
    var rect = game.terrain.generateRect(5, 5, "paved");
    map = game.terrain.mergePartial(map, rect, 5);
    //other stuff?
    game.time.advancedTiming = true;
    game.debug.renderShadow = false;
    game.stage.disableVisibilityChange = true;

    game.plugins.add(new Phaser.Plugin.Isometric(game));

    game.load.atlasXML('tileset', 'assets/landscapeTiles_sheet.png', 'assets/landscapeTiles_sheet.xml');

    game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
    game.iso.anchor.setTo(0.5, 0.1);
  },
  create: function() {
    isoGroup = game.add.group();

    // we won't really be using IsoArcade physics, but I've enabled it anyway so the debug bodies can be seen
    isoGroup.enableBody = true;
    isoGroup.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;



    var i = 0;
    var tile;
    while (i < map.tiles.length){
      var x = ((i % map.dimensions.cols) * size) + xOffset;
      var y = (Math.floor(i / map.dimensions.cols) * size) + yOffset;
      var z = 0;
      //add the tile
      tile = game.add.isoSprite(x, y, z, 'tileset', map.tiles[i], isoGroup);
      tile.anchor.set(0.5, 1);
      tile.smoothed = false;
      tile.body.moves = false;

      tile.scale.x = 1;
      tile.scale.y = 1;
      i++;
    }
    cursors = game.input.keyboard.createCursorKeys();
  },
  update: function () {
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
    isoGroup.forEach(function (tile) {
        //game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
    });
    game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
    // game.debug.text(Phaser.VERSION, 2, game.world.height - 2, "#ffff00");
  }
};

module.exports = Boot;
