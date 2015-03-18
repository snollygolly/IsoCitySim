(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var Terrain = require('./plugins/Terrain');
  var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'isocitysim', null, true, false);
  game.terrain = new Terrain();

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  



  game.state.start('preload');
};

},{"./plugins/Terrain":2,"./states/boot":3,"./states/gameover":4,"./states/menu":5,"./states/play":6,"./states/preload":7}],2:[function(require,module,exports){

'use strict';

function Terrain() {
  console.log("terrain init");
}

Terrain.prototype = {
  generateIsland: function(map) {
    /*
    grass - 67
    water - 66
    sand - 59
    */
    var totalTiles = map.dimensions.cols * map.dimensions.rows;
    //first pass to draw water
    var i = 0;
    while (i < totalTiles){
      var x = (i % map.dimensions.cols);
      var y = Math.floor(i / map.dimensions.cols);
      if (x == 0 || y == 0){
        map.tiles[i] = 66;
      }else if (x == (map.dimensions.cols - 1)){
        map.tiles[i] = 34;
      }else if (y == (map.dimensions.rows - 1)) {
        map.tiles[i] = 27;
      }else{
        map.tiles[i] = 59;
      }
      i++;
    }
    //set the last tile to water
    map.tiles[i-1] = 68;
    return map;
    console.log("generate island called");
  }
};

module.exports = Terrain;

},{}],3:[function(require,module,exports){

'use strict';

var isoGroup = [];

var game;
var map = {};
var cursors;

var xOffset;
var yOffset;

var size;

function Boot() {
  //set up the map
  xOffset = 0;
  yOffset = 0;
  //set up tile size
  size = 71;

  map = {};
  map.tiles = [];
  map.dimensions = {};
  map.dimensions.cols = 15;
  map.dimensions.rows = 10;
}

Boot.prototype = {
  preload: function() {
    game = this.game;
    game.world.setBounds(0, 0, ((size * 2) * map.dimensions.cols), ((size * 2) * map.dimensions.rows));
    //generate the terrain
    map = game.terrain.generateIsland(map);
    game.time.advancedTiming = true;
    game.debug.renderShadow = false;
    game.stage.disableVisibilityChange = true;

    game.plugins.add(new Phaser.Plugin.Isometric(game));

    game.load.atlasXML('tileset', 'assets/landscapeTiles_sheet.png', 'assets/landscapeTiles_sheet.xml');

    game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
    game.iso.anchor.setTo(0.5, 0.1);
  },
  create: function() {
    isoGroup = game.add.group();

    // we won't really be using IsoArcade physics, but I've enabled it anyway so the debug bodies can be seen
    isoGroup.enableBody = true;
    isoGroup.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;



    var i = 0;
    var tile;
    while (i < map.tiles.length){
      var x = ((i % map.dimensions.cols) * size) + xOffset;
      var y = (Math.floor(i / map.dimensions.cols) * size) + yOffset;
      var z = 0;
      //add the tile
      tile = game.add.isoSprite(x, y, z, 'tileset', map.tiles[i], isoGroup);
      tile.anchor.set(0.5, 1);
      tile.smoothed = false;
      tile.body.moves = false;

      tile.scale.x = 1;
      tile.scale.y = 1;
      i++;
    }
    cursors = game.input.keyboard.createCursorKeys();
  },
  update: function () {
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
    isoGroup.forEach(function (tile) {
        //game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
    });
    game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
    // game.debug.text(Phaser.VERSION, 2, game.world.height - 2, "#ffff00");
  }
};

module.exports = Boot;

},{}],4:[function(require,module,exports){

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

},{}],5:[function(require,module,exports){

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

},{}],6:[function(require,module,exports){

  'use strict';
  function Play() {}
  Play.prototype = {
    create: function() {

    },
    update: function() {

    }
  };

  module.exports = Play;

},{}],7:[function(require,module,exports){

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