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
    throw new Error('OptionSetter.setOptions: '+name+' '+message);
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
  
  // etc.
  function verifyFunction(opt){
    opt.verifyCB = _.isFunction
    opt.typeName = 'function';
    verifyType(opt);
  }
  
  function verifyString(opt){
    opt.verifyCB = _.isString
    opt.typeName = 'string';
    verifyType(opt);
  }

  function verifyArray(opt){
    opt.verifyCB = _.isArray
    opt.typeName = 'array';
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


  // returns validated value, or undefined if
  // value does not validate
  function validatedValue(value, defaultName, def){
    var type = Setter._types[def.type];
    if (type === undefined){
      failedValidationAction(defaultName, 
        'refers to type "'+def.type+'" which has not been defined');
      return 
    }

    var defaultValidator = type.validator;
    var valid = defaultValidator(value); 

    if (valid){
      return value;
    } else {
      failedValidationAction(defaultName, type.failMessage);
      return;
    }
  };

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
        value = validatedValue(value, defaultName, def);
        return {
          optionName: optionName,
          value: value
        };
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

  Setter._types = {};

  Setter.addType = function(typeDefinition){
    var errPrefix = 'OptionSetter.addType:';

    verifyObject({ input: typeDefinition, 
      inputName: 'type definition', errPrefix: errPrefix });

    verifyString({ input: typeDefinition.name, inputName: 'name',
      errPrefix: errPrefix });

    if (typeDefinition.failMessage === undefined){
      typeDefinition.failMessage = 
        'must be type '+typeDefinition.name;
    }


    verifyFunction({ input: typeDefinition.default, 
      inputName: 'default', errPrefix: errPrefix });

    verifyFunction({ input: typeDefinition.validator, 
      inputName: 'validator', errPrefix: errPrefix });

    verifyString({ input: typeDefinition.failMessage, 
      inputName: 'fail message', errPrefix: errPrefix });

    if (this._types[typeDefinition.name]){
      throw new Error(
        'OptionSetter.addType: cannot overwrite type testType'
      );
    } else {
      this._types[typeDefinition.name] = typeDefinition;
    }
  };

  Setter.getValidator = function(typeName){
    verifyString({ input: typeName, inputName: 'type name', 
      errPrefix: 'OptionSetter.getValidator:'});

    if (!this._types[typeName]){
      throw new Error(
          'OptionSetter.getValidator: type '+typeName+' not found');
    }

    return this._types[typeName].validator;
  };

  Setter.addTypes = function(typeDefs){
    verifyArray({
      input: typeDefs, inputName: 'type definitions',
      errPrefix: 'OptionSetter.addTypes:'
    });
    for (var i = 0; i < typeDefs.length; i++){
     this.addType(typeDefs[i]);
    }
  };

  // built-in types

  Setter.addType({
    name: 'boolean',
    default: function(){
      return false;
    },
    validator: _.isBoolean
  });

  Setter.addType({
    name: 'number',
    default: function(){
      return 0;
    },
    validator: function(value){
      return _.isNumber(value) && !_.isNaN(value);
    }
  });

  Setter.addType({
    name: 'object',
    default: function(){
      return {};
    },
    validator: function(value){
      return _.isObject(value) && !_.isFunction(value);
    }
  });

  Setter.addType({
    name: 'array', 
    default: function(){
      return [];
    }, 
    validator: _.isArray
  });

  Setter.addType({
    name: 'string', 
    default: function(){
      return '';
    }, 
    validator: _.isString
  });


  Setter.addType({
    name: 'function', 
    default: function(){
      return function(){};
    }, 
    validator: _.isFunction
  });

  Setter.addType({
    name: 'date', 
    default: function(){
      return new Date();
    }, 
    validator: _.isDate
  });

  return Setter;
}();

module.exports = OptionSetter;
