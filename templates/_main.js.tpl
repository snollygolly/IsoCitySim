'use strict';

//global variables
window.onload = function () {
  var Generate = require('./plugins/Generate');
  var LayerManager = require('./plugins/LayerManager');
  var game = new Phaser.Game(<%= gameWidth %>, <%= gameHeight %>, Phaser.AUTO, '<%= _.slugify(projectName) %>', null, true, false);
  game.generate = new Generate();
  game.layerManager = new LayerManager(game);

  // Game States
  <% _.forEach(gameStates, function(gameState) {  %>game.state.add('<%= gameState.shortName %>', require('./states/<%= gameState.shortName %>'));
  <% }); %>

  game.state.start('preload');
};
