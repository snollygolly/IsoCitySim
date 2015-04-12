
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
    //this.group = game.add.group();
    this.group = game.worldManager.chunks[0].group;
    this.spawnCar(0, 350, "SE");
    this.spawnCar(0,10, "SE");
    this.spawnCar(0,-10, "SE");

    this.spawnCar(280, 0, "SW");
    this.spawnCar(350, 0, "SW");
    this.spawnCar(420, 0, "SW");
    this.moveTraffic();
  },
  moveTraffic: function(){
    var i = 0;
    while (i < this.cars.length){
      this.stopTraffic(i);
      var velocity = game.generate.getRandomNumber(80,125);
      switch (this.cars[i].meta.direction){
        case "N":
          this.cars[i].body.velocity.x = -velocity;
          this.cars[i].body.velocity.y = -velocity;
          break;
        case "NE":
          this.cars[i].body.velocity.y = -velocity;
          break;
        case "E":
          this.cars[i].body.velocity.x = velocity;
          this.cars[i].body.velocity.y = -velocity;
          break;
        case "SE":
          this.cars[i].body.velocity.x = velocity;
          break;
        case "S":
          this.cars[i].body.velocity.x = velocity;
          this.cars[i].body.velocity.y = velocity;
          break;
        case "SW":
          this.cars[i].body.velocity.y = velocity;
          break;
        case "W":
          this.cars[i].body.velocity.x = -velocity;
          this.cars[i].body.velocity.y = velocity;
          break;
        case "NW":
          this.cars[i].body.velocity.x = -velocity;
          break;
      }
      i++;
    }
    game.physics.isoArcade.collide(this.group);
  },
  stopTraffic: function(i){
    this.cars[i].body.velocity.x = 0;
    this.cars[i].body.velocity.y = 0;
  },
  spawnCar: function(x,y, direction){
    var tile = game.add.isoSprite(x, y, (game.worldManager.world.tile_size_z * 2), "vehicle_utility", "police_" + direction + ".png", this.group);
    tile.anchor.set(0.5, 1);
    tile.smoothed = false;
    tile.scale.x = 1;
    tile.scale.y = 1;
    tile.meta = {};
    tile.meta.direction = direction;
    game.physics.isoArcade.enable(tile);
    //tile.body.drag.set(100, 100, 0);
    tile.body.bounce.set(1, 1, 0.2);
    this.cars.push(tile);
  }
};

module.exports = TrafficManager;
