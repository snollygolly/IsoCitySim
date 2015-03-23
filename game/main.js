'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'isocitysim', null, true, false);
  var Roads = require('./plugins/Roads');
  var Generate = require('./plugins/Generate');
  var LayerManager = require('./plugins/LayerManager');
  game.tiles = require('./tiles.json');
  game.roads = new Roads(game);
  game.generate = new Generate(game);
  game.layerManager = new LayerManager(game);

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('preload');
};
