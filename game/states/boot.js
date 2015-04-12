
'use strict';

var game;
var cursors;
var rS;
var wPx, hPx;
var velocity = 5;

function Boot() {
  rS = new rStats( {
    values: {
        fps: { caption: 'Framerate (FPS)' },
        update: { caption: 'Total update time (ms)' },
        render: { caption: 'Total render time (ms)' }
    }
  } );
}

Boot.prototype = {
  preload: function() {
    game = this.game;
    //generate the world
    wPx = game.worldManager.world.chunks * (game.worldManager.world.units * 132);
    hPx = game.worldManager.world.chunks * (game.worldManager.world.units * 74);
    game.world.setBounds(0, 0, wPx, hPx);
    //generate all the layers
    game.worldManager.createWorld(game.generate.generateMap(game.worldManager.world, 0));
    //build the chunk!
    var c = 0;
    while (c < game.worldManager.chunks.length){
      var tiles = game.worldManager.getAllTiles(c);
      tiles = game.generate.generateChunk(game.worldManager.world, tiles);
      game.worldManager.setAllTiles(c, tiles);
      game.worldManager.cleanWorld();
      c++;
    }

    //other stuff?
    game.debug.renderShadow = false;
    game.stage.disableVisibilityChange = true;
    game.stage.smoothed = false;
    //set up plugins and game
    game.plugins.add(new Phaser.Plugin.Isometric(game));
    game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
    game.iso.anchor.setTo(0.5, 0.1);
    game.renderer.renderSession.roundPixels = true;
    //this does nothing, default is .50
    //game.iso.projectionAngle = Math.atan(100/200);
  },
  create: function() {
    game.worldManager.drawWorld();
    game.trafficManager.startTraffic();
    cursors = game.input.keyboard.createCursorKeys();
    game.world.camera.roundPx = false;
    //this.moveCamera((wPx / 2) - (1024 / 2), (hPx / 2) - (768 / 2));
    this.moveCamera((wPx / 2) - (1024 / 2), 0);
  },
  update: function () {
    rS( 'FPS' ).frame();
    rS( 'update' ).start();
    //trigger the frame for anyone watching
    rS().update();
    //this is how scaling is done, but this code is super rough
    //isoGroup.scale.setTo(2,2);
    if (cursors.right.isDown){
      this.moveCamera((game.world.camera.x + velocity), game.world.camera.y);
    }
    if (cursors.left.isDown){
      this.moveCamera((game.world.camera.x - velocity), game.world.camera.y);
    }
    if (cursors.down.isDown){
      this.moveCamera(game.world.camera.x, (game.world.camera.y + velocity));
    }
    if (cursors.up.isDown){
      this.moveCamera(game.world.camera.x, (game.world.camera.y - velocity));
    }
    //game.worldManager.sortWorld();
    game.worldManager.sortChunk(0);
    rS( 'update' ).end();
  },
  render: function () {
    rS( 'render' ).start();

    rS( 'render' ).end();
    rS().update();
  },
  moveCamera: function(x, y){
    //set the camera first
    game.world.camera.setPosition(x,y);
    //get the real world view coords of the cam
    var isoCam = game.world.camera.view;
    //make a rectangle out of them
    //TODO: change resolution to consts
    var viewport = {
      left: isoCam.x,
      right: isoCam.x + 1024,
      top: isoCam.y,
      bottom: isoCam.y + 768
    };
    //go through each chunk, and check to see if it's in frame or not
    var i = 0;
    while (i < game.worldManager.chunks.length){
      if (intersectRect(game.worldManager.chunks[i], viewport) === true){
        //do something
        game.worldManager.chunks[i].group.visible = true;
        //console.log("chunk : " + i + " is visible");
      }else{
        game.worldManager.chunks[i].group.visible = false;
        //console.log("chunk : " + i + " is invisible");
      }
      i++;
    }
    //functions
    function intersectRect(r1, r2) {
      // console.log("intersect: (chunk / camera)");
      // console.log("camera.left (" + r2.left + ") > chunk.right (" + r1.right + ") - [" + ((r2.left > r1.right)?"bad":"good") + "]");
      // console.log("camera.right (" + r2.right + ") > chunk.left (" + r1.left + ") - [" + ((r2.right < r1.left)?"bad":"good") + "]");
      // console.log("camera.top (" + r2.top + ") > chunk.bottom (" + r1.bottom + ") - [" + ((r2.top > r1.bottom)?"bad":"good") + "]");
      // console.log("camera.bottom (" + r2.bottom + ") > chunk.top (" + r1.top + ") - [" + ((r2.bottom < r1.top)?"bad":"good") + "]");
      return !(r2.left > r1.right ||
               r2.right < r1.left ||
               r2.top > r1.bottom ||
               r2.bottom < r1.top);
    }
  }
};

module.exports = Boot;
