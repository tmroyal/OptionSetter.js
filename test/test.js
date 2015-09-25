var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var OptionSetter; 

beforeEach(function(){
  OptionSetter = require('../OptionSetter.js');
});

describe('OptionSetter', function(){
  it('should have version', function(){
    OptionSetter.version.should.equal('0.1.0');
  });
  
  it('should throw error if _ is not defined in browser');
  it('should require _ if not defined');

  describe('.setOptions', function(){

    it('should return setObject', function(){
      var setObject = {};
      var returnValue = OptionSetter.setOptions(setObject,{},{});

      returnValue.should.equal(setObject);
    });

    it('should add properties to setObject');

    it('should error if options is undefined', function(){
      expect(function(){
        OptionSetter.setOptions({},{});
      }).to.throw('OptionSetter: must provide options object');
    });

    it('should error if defaults is undefined', function(){
      expect(function(){
        OptionSetter.setOptions({}, undefined, {});
      }).to.throw('OptionSetter: must provide defaults object');
    });

    it('should error if setObject is undefined', function(){
      expect(function(){
        OptionSetter.setOptions(undefined, {}, {});
      }).to.throw('OptionSetter: must provide setObject');
    });

    describe('optionsObject', function(){
      it('should copy properties not in defaultsObject to setObject',
        function(){
          var setObject = {};
          OptionSetter.setOptions( setObject, {}, { optProp: 'prop'});
          setObject.optProp.should.equal('prop');
        }
      );
    });

    describe('defaultsObject', function(){
      it('should apply naked default value if not given in options',
        function(){

          var defaults = {
            testValue: 'testValue',
          }
          var options = {};
          var setObject = {};

          OptionSetter.setOptions( setObject, defaults, options);

          setObject.testValue.should.equal('testValue');
        }
      );

      // these tests should look more like examples
      describe('type', function(){
        it('should invalidate inputs of wrong type'); 
        it('should not invalidate defaults of wrong type'); 
      });

      describe('validator', function(){
        it('should recieve value as first argument');
        it('should recieve default validator as second argument');
        it('should error if it does not return a boolean');
        it('should trigger a validation failure if returns false');
        it('should not trigger a validation failure if returns true');
      });

      describe('failedValidationAction', function(){
        it('should be called if validation fails'); 
        it('should be called with set object');
        it('should be called with omitted param false if validation error');
        it('should be called with omitted param true if omission error');
      });

      describe('failMessage', function(){
        it('should be used with local failedValidationAction'); 
        it('should be used with global failedValidationAction'); 
      });

      describe('required', function(){
        it('should be true by default');
        it('when true, should cause throw if value not provided in options'); 
        it('should not cause throw if there is a default'); 
        it('should allow no options to be set when false');
      });

      describe('sourceName', function(){
        it('should point to name in object'); 
      });

      describe('default', function(){
        it('should set if option not provided', function(){
          var setObject = {};
          var defaults = {
            testProp: {
              default: 'default'
            }
          };

          OptionSetter.setOptions(setObject, defaults, {});

          setObject.testProp.should.equal('default');
        });

        it('should not cause invalidation');
        it('should use type default if OptionSetter.default is provided');
      });
    });

    describe('defaultTypes', function(){

      // all of these should test on {} as well

      describe('boolean', function(){
        it('should validate boolean'); 
        it('should invalidate non boolean'); 
        it('should default to false');
      }); 

      describe('number', function(){
        it('should invalidate non number'); 
        it('should validate Infinity'); 
        it('should validate -Infinity'); 
        it('should invalidate NaN');
        it('should default to 0');
      }); 

      describe('object', function(){
        it('should validate objects');
        it('should invalidate primitives');
        it('should invalidate function');
        it('should invalidate array');
        it('should default to {}');
      }); 

      describe('array', function(){
        it('should invalidate non-array'); 
        it('should validate arrays');
        it('should default to []');
      }); 

      describe('string', function(){
        it('should invalidate non-strings'); 
        it('should validate string');
        it('should validate to empty string');
      }); 

      describe('function', function(){
        it('should invalidate non funciton');   
        it('should invalidate regex');   
        it('should validate function');
        it('should default to function that returns nothing');
      }); 

      describe('date', function(){
        it('should invalidate non dates');
        it('should validate dates');
        it('should default to new Date()');
      }); 
    });
  });

  describe('.default()', function(){
    it('should return a reference to default flag object'); 
  });

  // i am afriad that these validations must happen by
  // hand, as addType will be used to create the types.
  // bootstrapping happens here
  describe('.addType', function(){
    it('should error if given no object');

    it('should create type with name'); 
    it('should error if given a non-string name');

    it('should set default function');
    it('should error if given non-function as default');

    it('should set validator');
    it('should error if given non-function validator');
    it('should error if validator returns non boolean');
    
    it('should set failMessage');
    it('should error if given non-string fail message');

    it('should error if instructed to overwrite existing type');
  });

  describe('.addTypes', function(){
    it('should call addType with each item in array');
  });

  describe('.setValidator', function(){
    it('should overwrite validator for specified type'); 
    it('should error if given non-string name');
    it('should error if validatorFunction is not a function');
    it('should error if validatorFunction does not return a boolean');
  });

  describe('.setDefault', function(){
    it('should overwrite default generator for specified type'); 
    it('should error if given non-string name');
    it('should error if defaultFunction is not a function');
  });

  describe('.getValidator', function(){
    it('should return validator for specified type');
    it('should error if given non-string');
  });

  describe('.setFailedValidationAction', function(){
    it('should error if given non-function');
    it('should set failedValidationAction');
    it('should be called with name of object');
    it('should be called with error message of object');
  });
});
