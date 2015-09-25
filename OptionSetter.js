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

  // an empty object, used to create a unique reference,
  // which will be used to identify automatic defaults
  // using OptionSetter.default()
  var os_default = {};

  // the default failed validation action for the library.
  // can be overwritten with OptionSetter.setFailedValidationAction
  var failedValidationAction = function(name, message){
    throw new Error('OptionSetter: '+name+' '+message);
  };

  // these functions are for functions within library, 
  // but do not provide the functionality of the library
  // throws Error if not provided valid argument type
  function verifyType(opt){
    opt.errPrefix = opt.errPrefix || 'OptionSetter:';
    if (opt.input === undefined){
      throw new Error(opt.errPrefix+ ' must provide '+opt.inputName);
    } else if (!opt.verifyCB(opt.input)){
      throw new Error(
        opt.errPrefix+' '+opt.inputName+' must be type '+opt.typeName
      );
    }
  }

  // throws error if not provided object
  function verifyObject(opt){
    opt.verifyCB = _.isObject
    opt.typeName = 'object';
    verifyType(opt);
  }
  
  // throws error if not provided object
  function verifyFunction(opt){
    opt.verifyCB = _.isFunction
    opt.typeName = 'function';
    verifyType(opt);
  }
  
  // throws error if not provided object
  function verifyString(opt){
    opt.verifyCB = _.isString
    opt.typeName = 'string';
    verifyType(opt);
  }

  // add all options not metioned in usedOptions to setObject
  // and return setObject
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

  // this function does the work of the library.
  // for defaultName, which should occur in defaults, either provide
  // the validated options value associated with defaultName
  // (or defaults[defaultName].sourceName), or the default.
  // return object containing value (or undefined if 
  // validation fails or there is no value) and either
  // default name or, if it exists, defaults[defaultName].sourceName
  function reconcileDefault(defaultName, defaults, options){
    var def = defaults[defaultName];
    var optionName;
    var value;

    if ( _.isObject(def) ){
      optionName = def.sourceName || defaultName;

      value = options[optionName];

      if (value !== undefined && (def.validator || def.type)){
        // we return undefined value
        // value = validatedValue(value, def);
        // return {
        //  optionName: optionName
        //
        // }
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

    verifyObject({
      input: setObject, inputName: 'setObject', 
      errPrefix: 'OptionSetter.setOptions:'
    });

    verifyObject({
      input: defaults, inputName: 'defaults object', 
      errPrefix: 'OptionSetter.setOptions:'
    });

    verifyObject({
      input: options, inputName: 'options object', 
      errPrefix: 'OptionSetter.setOptions:'
    });

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

  Setter.addType = function(typeDefinition){
    var errPrefix = 'OptionSetter.addType:';


    verifyObject({ input: typeDefinition, 
      inputName: 'type definition', errPrefix: errPrefix });

    if (typeDefinition.name === undefined){
      typeDefintion.name = 'validation failed';
    }

    verifyString({ input: typeDefinition.name, inputName: 'name',
      errPrefix: errPrefix });
    verifyFunction({ input: typeDefinition.default, 
      inputName: 'default', errPrefix: errPrefix });
    verifyFunction({ input: typeDefinition.validator, 
      inputName: 'validator', errPrefix: errPrefix });
    verifyString({ input: typeDefinition.failMessage, 
      inputName: 'fail message', errPrefix: errPrefix });

  };

  return Setter;
}();

module.exports = OptionSetter;
