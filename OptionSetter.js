;(function(){
  "use strict";

  var root = this;

  var _ = root._;

  if( typeof _ === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      _ = require('lodash');
    } else {
      throw new Error( 'OptionSetter: lodash not found');
    }
  }

  var OptionSetter = function(){

    var defaultTypes = {
      'boolean': {
        name: 'boolean',
        failMessage: 'must be type boolean',
        default: function(){
          return false;
        },
        validator: _.isBoolean
      },

      'number': {
        name: 'number',
        failMessage: 'must be type number',
        default: function(){
          return 0;
        },
        validator: function(value){
          return _.isNumber(value) && !_.isNaN(value);
        }
      },

      'object': {
        name: 'object',
        failMessage: 'must be type object',
        default: function(){
          return {};
        },
        validator: function(value){
          return _.isObject(value) && !_.isFunction(value);
        }
      },

      'array': {
        name: 'array', 
        failMessage: 'must be type array',
        default: function(){
          return [];
        }, 
        validator: _.isArray
      }, 

      'string': {
        name: 'string', 
        failMessage: 'must be type string',
        default: function(){
          return '';
        }, 
        validator: _.isString
      },

      'function': {
        name: 'function', 
        failMessage: 'must be type function',
        default: function(){
          return function(){};
        }, 
        validator: _.isFunction
      },

      'date': {
        name: 'date', 
        failMessage: 'must be type date',
        default: function(){
          return new Date();
        }, 
        validator: _.isDate
      }
    };

    function failedValidatonAction(name, message){
      throw new Error('OptionSetter.setOptions: '+name+' '+message);
    }

    function Setter(){
      this.version = '0.1.0';
      this.failedValidationAction = failedValidatonAction;
      this._types = _.clone(defaultTypes);
     }

    // a blank object is used as a unique reference
    // returned from OptionSetter.default()
    var SETTER_DEFAULT = {};
    Setter.prototype.default = function(){ return SETTER_DEFAULT; };

    // overwrites this.failedValidationAction
    Setter.prototype.setFailedValidationAction = function(newAction){
      verifyFunction({
        input: newAction, inputName: 'validation action', 
        errPrefix: 'OptionSetter.setFailedValidationAction:'
      });

      this.failedValidationAction = newAction;
    };


    Setter.prototype.setOptions = function(setObject, defaults, options){
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

      for (var deflt in defaults){
        if (defaults.hasOwnProperty(deflt)){
          var validation = new Validation(this._types, setObject, deflt, defaults, options);

          if (validation.value !== undefined){
            setObject[deflt] = validation.value;
          } else if (validation.error !== undefined){
            this.failedValidationAction(
                deflt, 
                validation.error, 
                setObject, 
                validation.presenceError === true
            );
          }
          usedOptions[validation.optionName] = true;
        }
      }

      applyUnusedOptions(setObject, options, usedOptions);

      return setObject;
    };
    
    // copy all options not metioned in usedOptions to setObject
    // and return setObject
    function applyUnusedOptions(setObject, options, usedOptions){
      for (var option in options){
        if (options.hasOwnProperty(option) && 
            usedOptions[option] === undefined)
        {
          setObject[option] = options[option];
        }
      }
    }

    // discovers property and validates
    Setter.prototype.addType = function(typeDefinition){
      var errPrefix = 'OptionSetter.addType:';

      verifyObject({ input: typeDefinition, 
        inputName: 'type definition', errPrefix: errPrefix });

      verifyString({ input: typeDefinition.name, inputName: 'name',
        errPrefix: errPrefix });

      if (this._types[typeDefinition.name]){
        throw new Error(
          'OptionSetter.addType: cannot overwrite type testType'
        );
      } 

      verifyFunction({ input: typeDefinition.default, 
        inputName: 'default', errPrefix: errPrefix });

      verifyFunction({ input: typeDefinition.validator, 
        inputName: 'validator', errPrefix: errPrefix });

      if (typeDefinition.failMessage === undefined){
        typeDefinition.failMessage = 
          'must be type '+typeDefinition.name;
      }

      verifyString({ input: typeDefinition.failMessage, 
        inputName: 'fail message', errPrefix: errPrefix });

      this._types[typeDefinition.name] = typeDefinition;
    };

    Setter.prototype.addTypes = function(typeDefs){
      verifyArray({
        input: typeDefs, inputName: 'type definitions',
        errPrefix: 'OptionSetter.addTypes:'
      });

      for (var i = 0; i < typeDefs.length; i++){
        this.addType(typeDefs[i]);
      }
    };
   

    Setter.prototype.getValidator = function(typeName){
      verifyString({ input: typeName, inputName: 'type name', 
        errPrefix: 'OptionSetter.getValidator:'});

      if (!this._types[typeName]){
        throw new Error(
            'OptionSetter.getValidator: type '+typeName+' not found');
      }

      return this._types[typeName].validator;
    };

    // internally used validations.
    // cannot be overridden
    // (external validation is handled by .addType())
    // throws Error if not provided valid argument type
    function verifyType(opt){
      opt.errPrefix = opt.errPrefix || 'OptionSetter:';

      if (opt.input === undefined){
        throw new Error(opt.errPrefix+' must provide '+opt.inputName);

      } else if (!opt.verifyCB(opt.input)){
        throw new Error(
          opt.errPrefix+' '+opt.inputName+' must be type '+opt.typeName
        );
      }
    }

    // throws error if not provided object
    function verifyObject(opt){
      opt.verifyCB = _.isObject;
      opt.typeName = 'object';
      verifyType(opt);
    }
    
    // etc.
    function verifyFunction(opt){
      opt.verifyCB = _.isFunction;
      opt.typeName = 'function';
      verifyType(opt);
    }
    
    function verifyString(opt){
      opt.verifyCB = _.isString;
      opt.typeName = 'string';
      verifyType(opt);
    }

    function verifyArray(opt){
      opt.verifyCB = _.isArray;
      opt.typeName = 'array';
      verifyType(opt);
    }

    function Validation(types, setObject, defaultName, defaults, options){
      this.defaultName = defaultName;
      this.defaultObject = defaults[defaultName];

      var validationSteps = [
        this.determineType.bind(this,types),
        this.determineDefault.bind(this),
        this.determineOptionName.bind(this),
        this.setValue.bind(this,options),
        this.validatePresence.bind(this),
        this.validateValue.bind(this)
      ];

      var step = 0;

      while (step < validationSteps.length && 
             this.error === undefined)
      {
        validationSteps[step]();
        step++; 
      }

      if (this.error !== undefined && 
          this.defaultObject.failedValidationAction !== undefined){
        this.consumeError(setObject);
      }
    };

    Validation.prototype.setError = function(msg){
      if ( this.defaultObject.failMessage !== undefined){
        this.error = this.defaultObject.failMessage;
      } else {
      this.error = msg;
      }
      // we remove this.value when there is an error
      delete this.value;
    };

    Validation.prototype.consumeError = function(setObject){
      this.defaultObject.failedValidationAction(
        this.defaultName,
        this.error, 
        setObject,
        this.presenceError === true
      );
      delete this.error;
    };

    Validation.prototype.determineType = function(types){
      var typeName = this.defaultObject.type;

      if (typeName !== undefined){
        this.type = types[typeName];
        if (this.type === undefined){
          this.setError(
            'refers to type "'+typeName+'" which has not been defined'
          );
        }
      }
    };

    Validation.prototype.determineDefault = function(){
      if (!_.isObject(this.defaultObject)){
        this.default = this.defaultObject;
      } else {
        this.default = this.defaultObject.default;
        if (this.default === SETTER_DEFAULT){
          this.handleSetterDefault();
        }
      }
    };

    Validation.prototype.handleSetterDefault = function(){
      if (this.type === undefined){
        this.setError(
          'uses OptionSetter.default() without an existing type'
        );
      } else {
        this.default = this.type.default();
      }
    };

    Validation.prototype.determineOptionName = function(){
      var sourceName = this.defaultObject.sourceName;
      if (sourceName !== undefined){
        if (!_.isString(sourceName)){
          this.setError('has a non-string sourceName')
          return;
        }
        this.optionName = this.defaultObject.sourceName;
      } else {
        this.optionName = this.defaultName;
      }
    };
    
    Validation.prototype.setValue = function(options){
      this.value = options[this.optionName];
      if (this.value === undefined){
        this.shouldValidate = false;
        this.value = this.default; // which may itself be undefined
      } else {
        this.shouldValidate = true;
      }
    };

    Validation.prototype.validatePresence = function(){
      if (this.value === undefined &&
          this.defaultObject.required !== false)
      {
        this.setError('must be provided');
        this.presenceError = true;
      } 
    };

    Validation.prototype.validateValue = function(){
      if (this.value !== undefined && this.shouldValidate){
        var typeValidator = this.type ? 
            this.type.validator : 
            function(){ return true ;}
        var propValidator = this.defaultObject.validator;
        var failMessage = this.getFailMessage();
        
        if (propValidator !== undefined){
          this.valid = propValidator(this.value, typeValidator);
        } else {
          this.valid = typeValidator(this.value);
        }

        if (!_.isBoolean(this.valid)){
          this.setError('has a validator that returns non-boolean');
        } else if (!this.valid){
          this.setError( failMessage );
        }
      }
    };

    Validation.prototype.getFailMessage = function(){
      if (this.failMessage !== undefined){
        return this.failMessage;
      } else if (this.type !== undefined){
        return this.type.failMessage;
      } else {
        return 'failed validation'
      }
    };


    return Setter;
  }();


  // export function
  if( typeof exports !== 'undefined' ) {
    if( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = OptionSetter;
    }
    exports.OptionSetter = OptionSetter;
  } 
  else {
    root.OptionSetter = OptionSetter;
  }

}).call(this);
