"use strict";

// TODO : AMD/REQUIRE/Bare Factory thingy
// TODO : start with semicolon

var OptionSetter = function(){
  var Setter = {
    version: '0.1.0' 
  };

  Setter.setOptions = function(setObject, defaults, options){
    return setObject;
  };

  return Setter;
}();

module.exports = OptionSetter;
