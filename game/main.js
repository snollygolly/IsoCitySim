'use strict';

//global variables
window.onload = function () {
  var Generate = require('./plugins/Generate');
  var LayerManager = require('./plugins/LayerManager');
  var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'isocitysim', null, true, false);
  game.generate = new Generate();
  game.layerManager = new LayerManager();

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('preload');
};
