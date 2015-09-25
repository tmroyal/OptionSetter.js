"use strict";

var _ = require('lodash');

// TODO : AMD/REQUIRE/Bare Factory thingy
// TODO : Browser/Node lodash
// TODO : start with semicolon?

var OptionSetter = function(){
  if (_ === undefined){
    throw new Error('does not work');
  }

  var Setter = {
    version: '0.1.0' 
  };

  var os_default = {};

  function verifyExists(argument, objectName){
    if (argument === undefined){
      throw new Error('OptionSetter: must provide '+objectName);
    }
  }

  function applyUnusedOptions(setObject, options, usedOptions){
    for (var option in options){
      if (options.hasOwnProperty(option) 
          && !usedOptions[option])
      {
        setObject[option] = options[option];
      }
    }
    return setObject;
  }

  function reconcileDefault(defaultName, defaults, options){
    var def = defaults[defaultName];
    var optionName;
    var value;

    if ( _.isObject(def) ){
      optionName = def.sourceName || defaultName;

      if (options[optionName]){
      } else {
        if (def.default){
          value = def.default;
        }
      }
    } else {
      optionName = defaultName;
      value = def;
    }

    return {
      optionName: optionName,
      value: value
    };
  }

  Setter.setOptions = function(setObject, defaults, options){
    var usedOptions = {};

    verifyExists(setObject, 'setObject');
    verifyExists(defaults, 'defaults object');
    verifyExists(options, 'options object');

    for (var def in defaults){
      if (defaults.hasOwnProperty(def)){
        var reconciledDef = reconcileDefault(def, defaults, options);
        setObject[def] = reconciledDef.value;
        usedOptions[reconciledDef.optionName] = true;
      }
    }

    setObject = applyUnusedOptions(setObject, options, usedOptions);

    return setObject;
  };

  return Setter;
}();

module.exports = OptionSetter;
