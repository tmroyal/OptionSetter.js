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

  var failedValidationAction = function(name, message){
    throw new Error('OptionSetter: '+name+' '+message);
  };

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

      value = options[optionName];

      if (value && (def.validator || def.type)){
        // this will make it undefined
        // value = validatedValue(value, def);
      }

      if (value === undefined && def.default) {
        value = def.default;
      }

      if (value === undefined && def.required !== false){
        failedValidationAction(optionName, 'must be provided');
      }
    } else {
      optionName = defaultName;
      value = options[optionName] || def;
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
