'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(<%= gameWidth %>, <%= gameHeight %>, Phaser.AUTO, '<%= _.slugify(projectName) %>', null, false, false);
  var Roads = require('./plugins/Roads');
  var Generate = require('./plugins/Generate');
  var WorldManager = require('./plugins/WorldManager');
  var TrafficManager = require('./plugins/TrafficManager');
  game.tiles = require('./tiles.json');
  game.roads = new Roads(game);
  game.generate = new Generate(game);
  game.worldManager = new WorldManager(game);
  game.trafficManager = new TrafficManager(game);

  // Game States
  <% _.forEach(gameStates, function(gameState) {  %>game.state.add('<%= gameState.shortName %>', require('./states/<%= gameState.shortName %>'));
  <% }); %>

  game.state.start('preload');
};
