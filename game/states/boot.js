
'use strict';

var game;
var cursors;
var rS;

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
    var wPx = game.worldManager.world.chunks * (game.worldManager.world.units * 132);
    var hPx = game.worldManager.world.chunks * (game.worldManager.world.units * 74);
    game.world.setBounds(0, 0, wPx, hPx);
    game.camera.x = (wPx / 2) - (1024 / 2);
    game.camera.y = (hPx / 2) - (768 / 2);
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
    game.time.advancedTiming = true;
    game.debug.renderShadow = false;
    game.stage.disableVisibilityChange = true;
    game.stage.smoothed = false;
    //set up plugins and game
    game.plugins.add(new Phaser.Plugin.Isometric(game));
    game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
    game.iso.anchor.setTo(0.5, 0.2);
  },
  create: function() {
    game.worldManager.drawWorld();
    cursors = game.input.keyboard.createCursorKeys();
  },
  update: function () {
    rS( 'FPS' ).frame();
    rS( 'update' ).start();
    //trigger the frame for anyone watching
    rS().update();
    //this is how scaling is done, but this code is super rough
    //isoGroup.scale.setTo(2,2);
    if (cursors.right.isDown){
      this.moveCamera(0,0);
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
    rS( 'update' ).end();
  },
  render: function () {
    rS( 'render' ).start();

    rS( 'render' ).end();
    rS().update();
  },
  moveCamera: function(x, y){
    //var isoCam = game.iso.unproject(game.world.camera.view);
    var isoCam = game.world.camera.view;
    var isoChunk = game.worldManager.chunks[0];
    //console.log("camera: x: " + isoCam.x + " y: " + isoCam.y);
    //console.log("chunk: t: " + isoChunk.top + " l: " + isoChunk.left);
    var viewport = {
      left: isoCam.x,
      right: isoCam.x + 1024,
      top: isoCam.y,
      bottom: isoCam.y + 768
    };
    // var chunkBounds = game.worldManager.chunks[0].group.getBounds();
    // var isoChunk = game.iso.unproject(game.worldManager.chunks[0].group);
    // var chunk = {
    //   left: isoChunk.x,
    //   right: isoChunk.x + chunkBounds.width,
    //   top: isoChunk.y,
    //   bottom: isoChunk.y + chunkBounds.height
    // };
    if (intersectRect(isoChunk, viewport) === true){
      //game.worldManager.chunks[i].group.visible = true;
      console.log("chunk : " + 0 + " is visible");
    }else{
      //game.worldManager.chunks[i].group.visible = false;
      console.log("chunk : " + 0 + " is invisible");
    }
    return;
    var i = 0;
    while (i < game.worldManager.chunks.length){
      //if (intersectRect(game.worldManager.chunks[i].group.getBounds(), game.world.camera.screenView) === true){
      if (intersectRect(game.worldManager.chunks[i].group.getBounds(), game.world.camera.view) === true){
        //do something
        game.worldManager.chunks[i].group.visible = true;
        console.log("chunk : " + i + " is visible");
        //console.log(game.worldManager.chunks[i]);
      }else{
        game.worldManager.chunks[i].group.visible = false;
        console.log("chunk : " + i + " is invisible");
      }
      i++;
    }
    //functions
    function intersectRect(r1, r2) {
      console.log("intersect: (chunk / camera)");
      console.log("camera.left (" + r2.left + ") > chunk.right (" + r1.right + ") - [" + ((r2.left > r1.right)?"bad":"good") + "]");
      console.log("camera.right (" + r2.right + ") > chunk.left (" + r1.left + ") - [" + ((r2.right < r1.left)?"bad":"good") + "]");
      console.log("camera.top (" + r2.top + ") > chunk.bottom (" + r1.bottom + ") - [" + ((r2.top > r1.bottom)?"bad":"good") + "]");
      console.log("camera.bottom (" + r2.bottom + ") > chunk.top (" + r1.top + ") - [" + ((r2.bottom < r1.top)?"bad":"good") + "]");
      return !(r2.left > r1.right ||
               r2.right < r1.left ||
               r2.top > r1.bottom ||
               r2.bottom < r1.top);
    }
  }
};

module.exports = Boot;
