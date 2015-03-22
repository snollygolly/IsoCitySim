
'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    console.log("* Preload Init");
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.atlasXML('landscape', 'assets/landscapeTiles_sheet.png', 'assets/landscapeTiles_sheet.xml');
    this.load.atlasXML('building', 'assets/buildingTiles_sheet.png', 'assets/buildingTiles_sheet.xml');
    this.load.atlasXML('city', 'assets/cityTiles_sheet.png', 'assets/cityTiles_sheet.xml');

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
