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

  var setter_default = {};

  Setter.default = function(){ return setter_default; }

  // the default failed validation action for the library.
  // can be overwritten with OptionSetter.setFailedValidationAction
  var failedValidationAction = function(name, message){
    throw new Error('OptionSetter.setOptions: '+name+' '+message);
  };

  // these functions are for util functions in the library.
  // they do not provide the validations that the end user
  // uses, but are only used internally.
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
  function validatedValue(value, defaultName, def, setObj, failCB){
    var type, defaultValidator;
    var valid;
    var failMessage;

      
    // get default validator and fail message from type
    // if provided. fail if given not defined type
    if (def.type !== undefined){
      type = Setter._types[def.type];

      if (type === undefined){
        failCB(
          defaultName, 
          'refers to type "'+def.type+'" which has not been defined',
          setObj, 
          false);
        return;
      }

      defaultValidator = type.validator;
      failMessage = def.failMessage || type.failMessage;
    } else {

      defaultValidator = function(){ return true; }
      failMessage = def.failMessage || 'failed validation';
    }

    // validate with either type validator
    // or provided validator
    if (def.validator !== undefined){
      valid = def.validator(value, defaultValidator);
    } else {
      valid = defaultValidator(value); 
    }

    if (!_.isBoolean(valid)){
      failCB(
        defaultName, 
        'has a validator that returns non-boolean',
        setObj,
        false
      );
    }

    if (valid){
      return value;
    } else {
      failCB(defaultName, failMessage, setObj, false);
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
  function reconcileDefault(defaultName, defaults, options, setObj){
    var def = defaults[defaultName];
    var optionName;
    var value;
    var failCB = def.failedValidationAction || failedValidationAction;

    if ( _.isObject(def) ){
      optionName = def.sourceName !== undefined ?  
                      def.sourceName : defaultName;

      if (!_.isString(optionName)){
        failCB(
          defaultName,
          'has a non-string sourceName',
          setObj, 
          false
        );
        return { optionName: optionName };
      }

      value = options[optionName];

      if (value !== undefined && 
          (def.validator !== undefined || def.type !== undefined)){
        value = 
          validatedValue(value, defaultName, def, setObj, failCB);
        return {
          optionName: optionName,
          value: value
        };
      }

      if (value === undefined && def.default !== undefined) {
        if (def.default === setter_default){
          var type = Setter._types[def.type];
          if (type === undefined){
            failCB(
              defaultName,
              'uses OptionSetter.default() without an existing type',
              setObj,
              false
            );
          }
          value = type.default();
        } else {
          value = def.default;
        }
      }

      if (value === undefined && def.required !== false){
        failCB(defaultName, 'must be provided', setObj, true);
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
        var reconciledDef = 
          reconcileDefault(def, defaults, options, setObject);
        if (reconciledDef.value !== undefined){
          setObject[def] = reconciledDef.value;
        }
        usedOptions[reconciledDef.optionName] = true;
      }
    }

    applyUnusedOptions(setObject, options, usedOptions);

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
