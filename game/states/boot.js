
'use strict';

var isoGroup, water = [];

var game;


function Boot() {
}

Boot.prototype = {
  preload: function() {
    game = this.game;
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

    var tileArray = [];
    tileArray[0] = 'water';
    tileArray[1] = 'sand';

    var cols = 5;
    var rows = 7;
    var xOffset = 100;
    var yOffset = 100;
    var tiles = [
      41,66,66,66,49,
      10,10,10,10,10,
      22,22,22,22,22,
      43,43,43,43,43,
      80,80,80,80,80,
      81,81,81,81,81,
      95,95,95,95,95,
    ];

    var size = 66;

    var i = 0;
    var tile;
    while (i < tiles.length){
      var x = ((i % cols) * size) + xOffset;
      var y = (Math.floor(i / cols) * size) + yOffset;
      var z = 0;
      if (tiles[i] == 71){z=6;}
      //add the tile
      tile = game.add.isoSprite(x, y, z, 'tileset', tiles[i], isoGroup);
      tile.anchor.set(0.5, 1);
      tile.smoothed = false;
      tile.body.moves = false;

      tile.scale.x = 1;
      tile.scale.y = 1;
      i++;
    }
  },
  update: function () {

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
