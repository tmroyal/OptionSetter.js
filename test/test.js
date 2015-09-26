var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var sinon = require('sinon');

var OptionSetter; 
var root;

// if browser, root = window, if node, root = global
try {
  root = window;
} catch (e) {
  root = global;
}

beforeEach(function(){
  OptionSetter = require('../OptionSetter.js');
});

describe('OptionSetter', function(){

  it('should have version', function(){
    OptionSetter.version.should.equal('0.1.0');
  });
  
  it('should throw error if _ is not defined in browser');
  it('should require lodash if _ not defined');
  it('should error is lodash not returned');

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
      }).to.throw(
        'OptionSetter.setOptions: must provide options object');
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
      }).to.throw(
        'OptionSetter.setOptions: must provide defaults object');
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

      describe('type', function(){

        it('should invalidate inputs of wrong type', function(){
          var defaults = {
            test: {
              type: 'number'
            }
          };

          var options = {
            test: 'not a number'
          };

          expect(function(){
            OptionSetter.setOptions({}, defaults, options);
          }).to.throw(
            'OptionSetter.setOptions: test must be type number'
          );

        }); 

        it('should not invalidate defaults of wrong type', function(){
          var defaults = {
            test: {
              type: 'number',
              default: 'not a number'
            }
          };

          expect(function(){
            OptionSetter.setOptions({}, defaults, {});
          }).to.not.throw();
        }); 

        it('should throw if type does not exist', function(){
          var defaults = {
            test: {
              type: 'not a type'
            }
          };

          var options = {
            test: 1
          };

          expect(function(){
            OptionSetter.setOptions({}, defaults, options);
          }).to.throw(
            'OptionSetter.setOptions: test refers to type '+
            '"not a type" which has not been defined'
          );
        });
      });

      describe('validator', function(){

        it('should receive value as first argument', function(){
          var validatorStub = sinon.stub().returns(true);
          var defaults = {
            test: {
              validator: validatorStub
            }
          };
          var options = { test: 1 };

          OptionSetter.setOptions({}, defaults, options);

          validatorStub.calledWith(1).should.be.true;
        });

        it('should receive default validator as second argument',
          function(){
            var defaultValidator = function(){ return true; };

            OptionSetter.addType({
              name: 'testType',
              default: function(){ return 0;},
              validator: defaultValidator
            });

            var defaults = {
              test: {
                type: 'testType',
                validator: sinon.stub().returns(true)
              }
            }
            var options = { test: 1 };

            OptionSetter.setOptions({}, defaults, options);

            defaults.test.validator.args[0][1]
              .should.equal(defaultValidator);
          }
        );

        it('should error if it does not return a boolean', function(){
          var defaults = {
            test: {
              validator: function(){ return 'not a boolean';}
            }
          };
          var options = { test: 1 };

          expect(function(){
            OptionSetter.setOptions({}, defaults, options);
          }).to.throw(
            'OptionSetter.setOptions: test has a validator '+
            'that returns non-boolean'
          );
        });

        it('should trigger a validation failure if returns false', 
          function(){
            var defaults = {
              test: {
                validator: function(){ return false; }
              }
            };
            var options = { test: 1 };

            expect(function(){
              OptionSetter.setOptions({}, defaults, options);
            }).to.throw(
              'OptionSetter.setOptions: test failed validation'
            );
          }
        );

        it('should not trigger a validation failure if returns true',
          function(){
            var defaults = {
              test: {
                validator: function(){ return true; }
              }
            };
            var options = { test: 1 };
            expect(function(){
              OptionSetter.setOptions({}, defaults, options);
            }).to.not.throw();
          }
        );
      });

      describe('failedValidationAction', function(){

        it('should be called if validation fails', function(){
          var defaults = {
            test: {
              validator: function(){ return false; },
              failedValidationAction: sinon.spy()
            }
          };
          var options = { test: 1 };
          
          OptionSetter.setOptions({}, defaults, options);
        }); 

        it('should be called with name, message, setObject and ommission error',
          function(){
            var setObject = {};
            var defaults = {
              test: {
                validator: function(){ return false; },
                failedValidationAction: sinon.spy()
              }
            };
            var options = { test: 1 };

            OptionSetter.setOptions(setObject, defaults, options);
            
            defaults.test.failedValidationAction.args[0]
              .should.deep.equal(
                ['test', 'failed validation', setObject, false]
              );
          }
        );

        it('should be called with omitted param true '+
           'if omission error', function(){
             var defaults = {
               test: {
                 failedValidationAction: sinon.spy()
               }
             }
             OptionSetter.setOptions({},defaults, {}); 
             defaults.test.failedValidationAction
                .args[0][3].should.be.true;
           });
      });

      describe('failMessage', function(){
        it('should be used when validation fails',
          function(){
            var defaults = {
              test: {
                validator: function(){ return false; },
                failMessage: 'custom fail message'
              }
            };
            var options = { test: 1 };
            expect(function(){
              OptionSetter.setOptions({}, defaults, options);
            }).to.throw(
              'OptionSetter.setOptions: test custom fail message'
            );
          }
        ); 
      });

      describe('required', function(){

        it('should be true by default',function(){
          var defaults = {
            requiredValue: {}
          };

          expect(function(){
            OptionSetter.setOptions({}, defaults, {});
          }).to.throw(
            'OptionSetter.setOptions: requiredValue must be provided'
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
                'OptionSetter.setOptions: requiredValue must be provided'
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
        it('should point to name in object', function(){
          var defaults = {
            test: {
              sourceName: 'name'
            }
          };
          var options = {
            name: {}
          };
          var setObj = OptionSetter.setOptions({}, defaults, options);
          
          setObj.test.should.equal(options.name);
          
        });

        it('should error if not a string', function(){
          var defaults = {
            test: { sourceName: 0 }
          };
          var options = { test: 1 };

          expect(function(){
            OptionSetter.setOptions({}, defaults, options);
          }).to.throw(
            'OptionSetter.setOptions: test has '+
            'a non-string sourceName'
          );

        });

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

        it('should bypass type invalidation', function(){
          var defaults = {
            test: {
              type: 'number',
              default: 'not a number'
            }
          };

          expect(function(){
            OptionSetter.setOptions({}, defaults, {});
          }).to.not.throw();

        });

        it('should bypass custom invalidation', function(){
          var defaults = {
            test: {
              default: 'infallible',
              validator: function(){ return false; }
            }
          };

          expect(function(){
            OptionSetter.setOptions({}, defaults, {});
          }).to.not.throw();

        });

        it('should use type default if OptionSetter.default'+
            ' is provided', 
            function(){
              var defaults = {
                test: {
                  type: 'number',
                  default: OptionSetter.default()
                }
              };

              var setObject = OptionSetter.setOptions({}, defaults, {});
              setObject.test.should.equal(0);
            }
        );

        it('OptionSetter.default should throw if no type', 
            function(){
              var defaults = {
                test: {
                  default: OptionSetter.default()
                }
              };
              expect(function(){
                OptionSetter.setOptions({}, defaults, {});
              }).to.throw(
                'OptionSetter.setOptions: test uses '+
                'OptionSetter.default() without an existing type'
              );
            }
        );

        it('should set as undefined if type does not exist',
          function(){
              var defaults = {
                test: {
                  type: 'does not exist',
                  default: OptionSetter.default()
                }
              };
              expect(function(){
                OptionSetter.setOptions({}, defaults, {});
              }).to.throw(
                'OptionSetter.setOptions: test uses '+
                'OptionSetter.default() without an existing type'
              );
          }
        )
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
        var functionType, functionValidator;

        beforeEach(function(){
          functionType = OptionSetter._types.function;
          functionValidator = OptionSetter.getValidator('function');
        });

        it('should invalidate non function', function(){
          functionValidator({}).should.be.false;
          functionValidator('').should.be.false;
        });

        it('should validate function', function(){
          functionValidator(function(){}).should.be.true;
          functionValidator(Math.pow).should.be.true;
        });

        it('should default to function that returns nothing', 
          function(){
            var defaultFunction = functionType.default();

            var reg = /\(([\s\S]*?)\)/;
            var params = reg.exec(defaultFunction)[1].split(',');
            params.length.should.equal(1);
            params[0].should.equal('');

            expect(defaultFunction()).to.be.undefined;
          }
        );
      }); 

      describe('date', function(){
        var dateType, dateValidator;

        beforeEach(function(){
          dateType = OptionSetter._types.date;
          dateValidator = OptionSetter.getValidator('date');
        });

        it('should invalidate non dates', function(){
          dateValidator('01/01/2013').should.be.false;
          dateValidator({}).should.be.false;
        });

        it('should validate dates', function(){
          dateValidator(new Date(1,2)).should.be.true;
        });

        it('should default to new Date()', function(){
          var newDateResult = {};
          var dateStub = sinon.stub(root, 'Date')
                         .returns(newDateResult);

          dateType.default().should.equal(newDateResult);
          dateStub.calledWithNew().should.be.true;

          Date.restore();

        });
      }); 
    });
  });

  describe('.default()', function(){
    it('should return same reference each time', function(){
      OptionSetter.default().should.equal(OptionSetter.default());
    }); 
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
    it('should call addType with each item in array', function(){
      var addType = sinon.spy(OptionSetter, 'addType');
      var type1 = {
        name: 'type1',
        default: function(){ return ''; },
        validator: function(){ return true; }
      };
      var type2 = {
        name: 'type2',
        default: function(){ return ''; },
        validator: function(){ return true; }
      };

      OptionSetter.addTypes([type1, type2]);
      
      addType.calledWith(type1).should.be.true;
      addType.calledWith(type2).should.be.true;
    });

    it('should error if not given an array', function(){
      expect(function(){
        OptionSetter.addTypes('non-array');
      }).to.throw(
        'OptionSetter.addTypes: type definitions must be type array'
      );
    });

    it('should error if given no argument', function(){
      expect(function(){
        OptionSetter.addTypes();
      }).to.throw(
        'OptionSetter.addTypes: must provide type definitions'
      );
    });
  });

  describe('.setValidator', function(){
    it('should overwrite validator for specified type'); 
    it('should error if given non-string name');
    it('should error if validatorFunction is not a function');
  });

  describe('.setDefault', function(){
    it('should overwrite default generator for specified type'); 
    it('should error if given non-string name');
    it('should error if not given a name');
    it('should error if defaultFunction is not a function');
    it('should error if defaultFunction is not given');
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
