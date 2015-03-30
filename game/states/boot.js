
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
