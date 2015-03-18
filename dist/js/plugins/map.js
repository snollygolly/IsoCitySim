
'use strict';

function Map() {
  console.log("map init");
}

Map.prototype = {
  test: function() {
    console.log("test function called");
  },
  generateIsland: function() {
    console.log("generate island called");
  }
};

module.exports = Map;
