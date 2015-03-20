'use strict';

//global variables
window.onload = function () {
  var Terrain = require('./plugins/Terrain');
  var LayerManager = require('./plugins/LayerManager');
  var game = new Phaser.Game(<%= gameWidth %>, <%= gameHeight %>, Phaser.AUTO, '<%= _.slugify(projectName) %>', null, true, false);
  game.terrain = new Terrain();
  game.layerManager = new LayerManager();

  // Game States
  <% _.forEach(gameStates, function(gameState) {  %>game.state.add('<%= gameState.shortName %>', require('./states/<%= gameState.shortName %>'));
  <% }); %>

  game.state.start('preload');
};
