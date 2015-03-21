(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var Terrain = require('./plugins/Terrain');
  var LayerManager = require('./plugins/LayerManager');
  var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'isocitysim', null, true, false);
  game.terrain = new Terrain();
  game.layerManager = new LayerManager();

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('preload');
};

},{"./plugins/LayerManager":2,"./plugins/Terrain":3,"./states/boot":4,"./states/gameover":5,"./states/menu":6,"./states/play":7,"./states/preload":8}],2:[function(require,module,exports){

'use strict';

function LayerManager() {
  console.log("layer init");
}

LayerManager.prototype = {
  layers: [

  ],
  addLayer: function(name, z, group){
    //add a layer at a specific index with name and z level
    var layer = {
      group: group,
      name: name,
      tileset: "landscapeTiles",
      z: z,
      tiles: []
    };
    layer.group.enableBody = true;
    layer.group.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;
    this.layers.push(layer);
    return (this.layers.length - 1);
  },
  removeLayer: function(index){
    //remove a layer at index
    this.layers.splice(index, 1);
    return this.layers;
  },
  getLayers: function(){
    //get a list of all layers
    return this.layers;
  },
  swapLayers: function(one, two){
    //swap layer one and two in index position
    var temp = this.layers[one];
    this.layers[one] = this.layers[two];
    this.layers[two] = temp;
    return this.layers;
  },
  hideLayer: function(index){

  },
  showLayer: function(index){

  },
  getAllTiles: function(){
    var i = 0;
    var tiles = [];
    while (i < this.layers.length){
      tiles[i] = this.layers[i].tiles;
      i++;
    }
    console.log("getalltiles: " );
    console.log(tiles);
    return tiles;
  }
};

module.exports = LayerManager;

},{}],3:[function(require,module,exports){

'use strict';

function Terrain() {
  console.log("terrain init");
}

Terrain.prototype = {
  slices: {
    island:[
      [53,42,61],
      [35,59,34],
      [60,27,68]
    ],
    hill:[
      [0,10,0],
      [16,67,15],
      [0,22,0]
    ],
    paved:[
      [114,80,119],
      [87,81,88],
      [118,95,122]
    ]
  },
  generateMap: function(map, fill){
    //generates a blank map based on dimensions
    var i = 0;
    var tiles = [];
    while (i < (map.dimensions.cols * map.dimensions.rows)){
      tiles[i] = fill;
      i++;
    }
    return tiles;
  },
  mergePartial: function(map, tiles, partial, index){
    //takes a map, and a partial map, and merges the partial into the map
    var i = 0;
    //partial should consist of an array of arrays, one array per row
    while (i < partial.length){
      //remove items from the array
      tiles.splice(index + (map.dimensions.cols * i), partial[i].length);
      //remove items from the array
      tiles.splice.apply(tiles, [index + (map.dimensions.cols * i), 0].concat(partial[i]));
      i++;
    }
    return tiles;
  },
  generateRect: function(width, height, fill){
    var r = 0;
    var rows = [];
    while (r < height){
      rows[r] = this.makeFilledArray(fill, width);
      r++;
    }
    return rows;
  },
  generateSliceRect: function(width, height, slice){
    //generates a rectangle based on the slice provided (hardcoded atm)
    var masterRows = [];
    var slices = this.slices[slice];
    //row index
    var r = 0;
    while (r < slices.length){
      masterRows[r] = [];
      masterRows[r][0] = slices[r][0];
      var i = 1;
      while (i < (width - 1)){
        masterRows[r][i] = slices[r][1];
        i++;
      }
      masterRows[r][i] = slices[r][2];
      r++;
    }
    //build out the final array
    var rectArr = [];
    rectArr[0] = masterRows[0];
    var r = 1;
    while (r < (height - 1)){
      rectArr[r] = masterRows[1];
      r++;
    }
    rectArr[r] = masterRows[2];
    return rectArr;
  },
  makeFilledArray: function(fill, length){
    var array = [];
    for (var i = 0; i < length; i++) {
        array[i] = fill;
    }
    return array;
  }
};

module.exports = Terrain;

},{}],4:[function(require,module,exports){

'use strict';

var game;
var map = {};
var layer;
var cursors;

var xOffset;
var yOffset;

var size;

function Boot() {
  //set up the map
  xOffset = 100;
  yOffset = 100;
  //set up tile size
  size = 72;

  map = {};
  map.dimensions = {};
  map.dimensions.cols = 5;
  map.dimensions.rows = 5;
}

Boot.prototype = {
  preload: function() {
    game = this.game;
    game.world.setBounds(0, 0, ((size * 2) * map.dimensions.cols), ((size * 2) * map.dimensions.rows));
    //generate the base layer
    layer = game.layerManager.addLayer("base", 0, game.add.group());
    //generate the terrain
    game.layerManager.layers[layer].tiles = game.terrain.generateMap(map, 67);

    //add second test layer
    layer = game.layerManager.addLayer("terrain", 32, game.add.group());
    game.layerManager.layers[layer].tiles = game.terrain.generateMap(map, 0);
    var rect = game.terrain.generateSliceRect(5, 5, "hill");
    game.layerManager.layers[layer].tiles = game.terrain.mergePartial(map, game.layerManager.layers[layer].tiles, rect, 0);

    //add third test layer
    layer = game.layerManager.addLayer("more_terrain", 64, game.add.group());
    game.layerManager.layers[layer].tiles = game.terrain.generateMap(map, 0);
    var rect = game.terrain.generateSliceRect(3, 3, "paved");
    game.layerManager.layers[layer].tiles = game.terrain.mergePartial(map, game.layerManager.layers[layer].tiles, rect, 6);

    //other stuff?
    game.time.advancedTiming = true;
    game.debug.renderShadow = false;
    game.stage.disableVisibilityChange = true;

    game.plugins.add(new Phaser.Plugin.Isometric(game));

    game.load.atlasXML('landscapeTiles', 'assets/landscapeTiles_sheet.png', 'assets/landscapeTiles_sheet.xml');

    game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
    game.iso.anchor.setTo(0.5, 0.1);
  },
  create: function() {
    this.drawMap(map, game.layerManager.getAllTiles());
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
  },
  clearMap: function(){

  },
  drawMap: function(map, tiles){
    //tiles in the layer
    var i;
    //layers in the map
    var l = 0;
    var tile;
    //draw each layer, starting at 0
    while (l < game.layerManager.layers.length){
      //draw each tile in each layer
      i = 0;
      while (i < tiles[l].length){
        var x = ((i % map.dimensions.cols) * size) + xOffset;
        var y = (Math.floor(i / map.dimensions.cols) * size) + yOffset;
        var z = game.layerManager.layers[l].z;
        //add the tile
        tile = game.add.isoSprite(x, y, z, 'landscapeTiles', tiles[l][i], game.layerManager.layers[l].group);
        tile.anchor.set(0.5, 1);
        tile.smoothed = false;
        tile.body.moves = false;

        tile.scale.x = 1;
        tile.scale.y = 1;
        i++;
      }
      l++;
    }
  }
};

module.exports = Boot;

},{}],5:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX,100, 'Game Over!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX, 200, 'You Win!', { font: '32px Arial', fill: '#ffffff', align: 'center'});
    this.congratsText.anchor.setTo(0.5, 0.5);

    this.instructionText = this.game.add.text(this.game.world.centerX, 300, 'Click To Play Again', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionText.anchor.setTo(0.5, 0.5);
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;

},{}],6:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.sprite = this.game.add.sprite(this.game.world.centerX, 138, 'yeoman');
    this.sprite.anchor.setTo(0.5, 0.5);

    this.titleText = this.game.add.text(this.game.world.centerX, 300, '\'Allo, \'Allo!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.instructionsText = this.game.add.text(this.game.world.centerX, 400, 'Click anywhere to play "Click The Yeoman Logo"', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionsText.anchor.setTo(0.5, 0.5);

    this.sprite.angle = -20;
    this.game.add.tween(this.sprite).to({angle: 20}, 1000, Phaser.Easing.Linear.NONE, true, 0, 1000, true);
  },
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};

module.exports = Menu;

},{}],7:[function(require,module,exports){

  'use strict';
  function Play() {}
  Play.prototype = {
    create: function() {

    },
    update: function() {

    }
  };

  module.exports = Play;

},{}],8:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    console.log("preload preload");
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('yeoman', 'assets/yeoman-logo.png');

  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('boot');
    }else{
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}]},{},[1])