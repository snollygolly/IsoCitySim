
'use strict';

var game;

function TrafficManager(gameObj) {
  console.log("* TrafficManager Init");
  game = gameObj;
}

TrafficManager.prototype = {
  group: null,
  cars: [],
  startTraffic: function(){
    this.group = game.add.group();
    this.spawnCar((game.worldManager.world.tile_size * -1),((game.worldManager.world.tile_size - 10) * -1));
    this.spawnCar((game.worldManager.world.tile_size * -1),((game.worldManager.world.tile_size + 10) * -1));
    this.moveTraffic();
  },
  moveTraffic: function(){
    var i = 0;
    while (i < this.cars.length){
      console.log("moveTraffic: " + this.cars[i].x);
      this.cars[i].body.velocity.x = 100;
      i++;
    }
  },
  spawnCar: function(x,y){
    var tile = game.add.isoSprite(x, y, 0, "vehicle_utility", "police_SE.png", this.group);
    tile.anchor.set(0.5, 1);
    tile.smoothed = false;
    tile.scale.x = 1;
    tile.scale.y = 1;
    game.physics.isoArcade.enable(tile);
    this.cars.push(tile);
    game.iso.simpleSort(this.group);
  }
};

module.exports = TrafficManager;
