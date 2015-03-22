'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(<%= gameWidth %>, <%= gameHeight %>, Phaser.AUTO, '<%= _.slugify(projectName) %>', null, true, false);
  var Generate = require('./plugins/Generate');
  var LayerManager = require('./plugins/LayerManager');
  game.tiles = require('./tiles.json');
  game.generate = new Generate(game);
  game.layerManager = new LayerManager(game);

  // Game States
  <% _.forEach(gameStates, function(gameState) {  %>game.state.add('<%= gameState.shortName %>', require('./states/<%= gameState.shortName %>'));
  <% }); %>

  game.state.start('preload');
};
