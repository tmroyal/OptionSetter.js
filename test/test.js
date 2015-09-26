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

    it('should add properties to setObject', function(){
      var setObject = {};
      var options = { test: 'test'};
      var returnValue = OptionSetter.setOptions(setObject,{},options);

      setObject.test.should.equal('test');

    });

    it('should error if options is undefined', function(){
      expect(function(){
        OptionSetter.setOptions({},{});
      }).to.throw('OptionSetter.setOptions: must provide options object');
    });

    it('should error if options is not an object', function(){
      expect(function(){
        OptionSetter.setOptions({},{},'object');
      }).to.throw(
        'OptionSetter.setOptions: options object must be type object'
      );
    });

    it('should error if defaults is undefined', function(){
      expect(function(){
        OptionSetter.setOptions({}, undefined, {});
      }).to.throw('OptionSetter.setOptions: must provide defaults object');
    });

    it('should error if default is not an object', function(){
      expect(function(){
        OptionSetter.setOptions({},'object', {});
      }).to.throw(
        'OptionSetter.setOptions: defaults object must be type object'
      );
    });

    it('should error if setObject is undefined', function(){
      expect(function(){
        OptionSetter.setOptions(undefined, {}, {});
      }).to.throw('OptionSetter.setOptions: must provide setObject');
    });

    it('should error is setObject is not an object', function(){
      expect(function(){
        OptionSetter.setOptions('obect', {}, {});
      }).to.throw(
        'OptionSetter.setOptions: setObject must be type object'
      );
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

      it('should not appy naked default if given in options',
        function(){
          var defaults = {
            testValue: 'testValue',
          }
          var options = {
            testValue: 'provided value'
          };
          var setObject = {};

          OptionSetter.setOptions( setObject, defaults, options);

          setObject.testValue.should.equal('provided value');

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

        it('should be true by default',function(){
          var defaults = {
            requiredValue: {}
          };

          expect(function(){
            OptionSetter.setOptions({}, defaults, {});
          }).to.throw(
            'OptionSetter: requiredValue must be provided'
          );
        });

        it( 'when true, should cause throw if value not'+
            ' provided in options', 
            function(){
              var defaults = {
                requiredValue: {
                  required: true
                }
              }

              expect(function(){
                OptionSetter.setOptions({}, defaults, {});
              }).to.throw(
                'OptionSetter: requiredValue must be provided'
              );
            }
        ); 

        it('should not cause throw if there is a default', function(){
          var defaults = {
            requiredValue: {
              required: true,
              default: 'value'
            }
          };

          expect(function(){
            OptionSetter.setOptions({}, defaults, {});
          }).to.not.throw();
        });

        it('should allow no options to be set when false', function(){
          var defaults = {
            unRequired: {
              required: false
            }
          }

          expect(function(){
            OptionSetter.setOptions({}, defaults, {});
          }).to.not.throw();
        });

      });

      describe('sourceName', function(){
        it('should point to name in object'); 
        it('should error if not a string');
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
        var booleanValidator, booleanType;

        beforeEach(function(){
          booleanValidator = OptionSetter.getValidator('boolean');
          booleanType = OptionSetter._types.boolean;
        });

        it('should create boolean type', function(){
          booleanType.should.not.be.undefined;
        });

        it('should validate boolean', function(){
          booleanValidator(true).should.be.true;  
          booleanValidator(false).should.be.true;  
        }); 

        it('should invalidate non boolean', function(){
          booleanValidator('').should.be.false;  
          booleanValidator({}).should.be.false;  
        }); 

        it('should default to false', function(){
          booleanType.default().should.be.false;
        });
      }); 

      describe('number', function(){
        var numberType, numberValidator;

        beforeEach(function(){
          numberType = OptionSetter._types.number;
          numberValidator = OptionSetter.getValidator('number');
        });

        it('should invalidate non number', function(){
          numberValidator({}).should.be.false;
          numberValidator('').should.be.false;
        }); 

        it('should validate number', function(){
          numberValidator(0).should.be.true;
        });

        it('should validate Infinity', function(){
          numberValidator(Infinity).should.be.true;
          numberValidator(-Infinity).should.be.true;
        });

        it('should invalidate NaN', function(){
          numberValidator(NaN).should.be.false;
        });

        it('should default to 0', function(){
          numberType.default().should.equal(0);
        });
      }); 

      describe('object', function(){
        var objectType, objectValidator;

        beforeEach(function(){
          objectType = OptionSetter._types['object'];
          objectValidator = OptionSetter.getValidator('object');
        });

        it('should validate objects', function(){
          objectValidator({}).should.be.true;
        });

        it('should invalidate non-object primitives', function(){
          objectValidator(undefined).should.be.false;
          objectValidator(null).should.be.false;
          objectValidator('').should.be.false;
          objectValidator(1).should.be.false;
          objectValidator(false).should.be.false;
        });

        it('should invalidate function', function(){
          objectValidator(function(){}).should.be.false;
        });

        it('should invalidate array', function(){
          objectValidator([]).should.be.true;
        });

        it('should default to {}', function(){
          objectType.default().should.deep.equal({});
        });
      }); 

      describe('array', function(){
        var arrayType, arrayValidator;

        beforeEach(function(){
          arrayType = OptionSetter._types.array;
          arrayValidator = OptionSetter.getValidator('array');
        });

        it('should invalidate non-array', function(){
          arrayValidator('').should.be.false; 
          arrayValidator({}).should.be.false; 
        });

        it('should validate arrays', function(){
          arrayValidator([]).should.be.true; 
          arrayValidator([1,2,3]).should.be.true;
        });

        it('should default to []', function(){
          arrayType.default().should.deep.equal([]);
        });
      }); 

      describe('string', function(){
        var stringType, stringValidator;

        beforeEach(function(){
          stringType = OptionSetter._types.string;
          stringValidator = OptionSetter.getValidator('string');
        });


        it('should invalidate non-strings', function(){
          stringValidator({}).should.be.false;
          stringValidator(function(){}).should.be.false;
        }); 

        it('should validate string', function(){
          stringValidator('').should.be.true;
          stringValidator('string').should.be.true;
        });

        it('should validate to empty string', function(){
          stringType.default().should.equal('');
        });
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
    // how to test? should I?
    it('should return a reference to default flag object'); 
  });

  describe('.addType', function(){
    var testTypeDef;

    beforeEach(function(){
      testTypeDef = {
        name: 'testType',
        default: function(){ return true;},
        validator: function(){ return true;},
        failMessage: 'failed' 
      };
    });

    afterEach(function(){
      // meh
      delete OptionSetter._types['testType'];
    });

    it('should error if given no object', function(){
      expect(function(){
        OptionSetter.addType();
      }).to.throw(
        'OptionSetter.addType: must provide type definition'
      );
    });

    it('should create type at name', function(){
      OptionSetter.addType(testTypeDef);
      OptionSetter._types['testType'].should.equal(testTypeDef);
    });


    it('should error if not given a name', function(){
      delete testTypeDef.name;

      expect(function(){
        OptionSetter.addType(testTypeDef);
      }).to.throw(
        'OptionSetter.addType: must provide name'
      );
    });

    it('should error if given a non-string name', function(){
      testTypeDef.name = [];
      expect(function(){
        OptionSetter.addType(testTypeDef);
      }).to.throw(
        'OptionSetter.addType: name must be type string'
      );
    });

    it('should error if not given a default', function(){
      delete testTypeDef.default;

      expect(function(){
        OptionSetter.addType(testTypeDef);
      }).to.throw(
        'OptionSetter.addType: must provide default'
      );
    });

    it('should error if given non-function as default', function(){
      testTypeDef.default = '';

      expect(function(){
        OptionSetter.addType(testTypeDef);
      }).to.throw(
        'OptionSetter.addType: default must be type function'
      );
    });


    it('should error if not given a validator', function(){
      delete testTypeDef.validator;

      expect(function(){
        OptionSetter.addType(testTypeDef);
      }).to.throw(
        'OptionSetter.addType: must provide validator'
      );
    });

    it('should error if given non-function validator', function(){
      testTypeDef.validator = '';

      expect(function(){
        OptionSetter.addType(testTypeDef);
      }).to.throw(
        'OptionSetter.addType: validator must be type function'
      );
    });

    // TODO - how?
    it('should error if validator returns non boolean');
    
    it('should error if given non-string fail message', function(){
      testTypeDef.failMessage = {};

      expect(function(){
        OptionSetter.addType(testTypeDef);
      }).to.throw(
        'OptionSetter.addType: fail message must be type string'
      );
    });

    it('should set failMessage to "must be type [name]" if not given',
      function(){
        delete testTypeDef.failMessage;
        OptionSetter.addType(testTypeDef);
        OptionSetter._types.testType.failMessage
          .should.equal('must be type testType');
      }
    );

    it('should error if instructed to overwrite existing type', 
      function(){
        OptionSetter.addType(testTypeDef);

        expect(function(){
          OptionSetter.addType(testTypeDef);
        }).to.throw(
          'OptionSetter.addType: cannot overwrite type testType'
        );
      }
    );
  });

  describe('.addTypes', function(){
    it('should call addType with each item in array');
  });

  describe('.setValidator', function(){
    it('should overwrite validator for specified type'); 
    it('should error if given non-string name');
    it('should error if validatorFunction is not a function');
  });

  describe('.setDefault', function(){
    it('should overwrite default generator for specified type'); 
    it('should error if given non-string name');
    it('should error if defaultFunction is not a function');
  });

  describe('.getValidator', function(){

    it('should return validator for specified type', function(){
      var validator = function(){ return true; };
      var typeDef = {
        name: 'testType',
        default: function(){ return ''; },
        validator: validator
      }
      OptionSetter.addType(typeDef);

      OptionSetter.getValidator('testType').should.equal(validator);
    });

    it('should error if not given name', function(){
      expect(function(){
        OptionSetter.getValidator();
      }).to.throw('OptionSetter.getValidator: must provide type name');
    });

    it('should error if given non-string', function(){
      expect(function(){
        OptionSetter.getValidator({});
      }).to.throw(
        'OptionSetter.getValidator: type name must be type string'
      );
    });

    it('should error if type not found', function(){
      expect(function(){
        OptionSetter.getValidator('non-existant');
      }).to.throw(
        'OptionSetter.getValidator: type non-existant not found'
      );
    });
  });

  describe('.setFailedValidationAction', function(){
    it('should error if given non-function');
    // test by conditioning fail, and spy
    it('should set failedValidationAction');
    it('should be called with name of object');
    it('should be called with error message of object');
  });
});
