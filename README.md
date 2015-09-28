# OptionSetter.js [![Build Status](https://travis-ci.org/tmroyal/OptionSetter.js.svg?branch=master)](https://travis-ci.org/tmroyal/OptionSetter.js)

A Javascript library designed to simply the consumption of options objects. It's like `.extend` (Underscore/JQuery) on steroids.

## Motivation

In Javascript, one often needs to provide a function or constructor with multiple 
paramters. Some of these parameters might be optional, and some might
have defaults. In these circumstances, one often uses an object
parameter containing the desired values:

```
function MyObject(options){
  this.prop1 = options.prop1;
  this.prop2 = options.prop2 || 'default';
}
```

One might also use the `.extend()` method provided
by one of several libraries:

```
functon MyObject(options){  
  var defaults = { prop2: 'default'};
  this.settings = $.extend( {}, defaults, options);

  // optionally:
  //
  // for (setting in settings){
  //    if (settings.hasOwnProperty(setting)){
  //      this[setting] = settings[setting];
  //    }
  // }
}
```

There are limitations to this approach. For example, type validation may be desired. In this instance, 
code becomes more verbose, as one needs to apply validation conditions to 
every element in the options object. In other circumstances, some
items may be optional, while others may have a default, and others are mandatory. Here, 
the code for tesing these conditions can become quite large and cumbersome.

This library attempts to simplify and streamline the usage of options objects by allowing
automatic defaults, standard validations, and other capbilities.

(Note: some of these problems will be remedied by ECMAScript 2015 proxies and default parameters.)

## Requirements

Lodash/Underscore. 

## Usage

```
<script src="
<script src="dst/OptionSetter.js"></script>
<script>
var optionSetter = new OptionSetter();
optionSetter.setOptions({},{},{});
</script>
```
## Installation

The package is available on GitHub.

NPM:

`npm install OptionSetter.js`

Bower:

`bower install OptionSetter`

## Example Usage

```
function MyObject(options){
  var defaults = {
    param1: {
      // if options.param1 is provided, it must be a date
      // if not, provide auto date default, which is the return 
      // value of new Date()
      type: 'date',
      default: optionSetter.default()
    },
    param2: {
      // if options.param2 is provided, it must be a string
      // if not provided, set as 'param2'
      type: 'string',
      default: 'param2'   
    }
    param3: {
      // options.param3 must be provided and be an array
      type: 'array',
    }
    param4: 'param4', // no validations, just set param4 to 'param4' if not provided
    param5: {
      // must provide options.param5, and must return true when passed to the validator
      validator: function(value){
        return value == 1 || value === 'one';
      },
      require: true
    }, 
    param6: {
      // if options.p6 is given, it must be a number, and will be set to param6 on setObject
      // if not given, this default will be ignored
      type: 'number',
      sourceName: 'p6',
      required: false
    }
  }

  // set this to values which occur either in defaults or options, 
  // provided options validate
  optionSetter.setOptions(this, defaults, options);
}
```

The above can be written more succicntly by removing comments:

```
function MyObject(options){
  var defaults = {
    param1: { type: 'date', default: optionSetter.default() },
    param2: { type: 'string', default: 'param2' },
    param3: { type: 'array' },
    param4: 'param4', 
    param5: { 
      // this can be written more succintly using ES2015's arrow functions
      validator: function(v){ return v == 1 || v === 'one' }, 
      require: true 
    }, 
    param6: { type: 'number', sourceName: 'p6', required: false }
  }

  optionSetter.setOptions(this, defaults, options);
}
```

In the above case, if any value in the options object fails validations set up by the defaults object,
an error is thrown. (This behavior can be customized using `optionSetter.setFailedValidationAction`.)

To use the options object with defaults applied, rather than copy its
keys and properties to `this`, one can write the following: 

```
optionSetter.setOptions(options, defaults, options);
```
or:

```
options = optionSetter.setOptions({}, defaults, options);
```

## API Documentation

### optionSetter.setOptions(setObject, defaultsObject, optionsObject)

*Parameters*
- `setObject` - the object on which to set properties
- `defaultsObject` - the object which contains defaults, type specifications, and other validation information (see below)
- `optionsObject` - the object whose properties are copied to the setObject if validated successfully

*Returns*
`setObject` with options added, or original `setObject` if validation fails

This method adds the validated properties in the `optionsObject`, plus applicable defaults from the `defaultsObject`, 
to the `setObject`, and returns the `setObject`.

If any value in the options object fails validation, an error is thrown. (This behavior can be customized using `optionSetter.setFailedValidationAction`.)

Note: any properties not referenced in the `defaultsObject` but included in the `optionsObject` are added to `setObject` without validation.

### defaultsObject (Object)

The `defaultsObject` contains the defaults, type specfications, and validation information used by `optionSetter.setOptions`. Its
property names will appear in the `setObject` and, if a `sourceName` is not provided, the `optionsObject`. Each property may contain either a default value, or an object that sepcifies information used for validation, default generation, etc.

Example: 
```
var defaults = {
  name: {
    type: 'string',
    default: 'Default Name',
    validator: function(value, defaultValidator){
      return defaultValidator(value) && value.length > 3 && value.length < 100;
    }
  },
  date: {
    type: 'date'
  }, 
  tags: [] // default is empty array. This property is not validated.
};
```

Note: in order to supply a default object that is not validated, one must supply it like this: 

```
var defaults = {
  myObject: {
    default: {
      foo: 'bar'
    } // does not validate as no type is specified
  }
};
```

This is because the library has no way of distinguishing between a defaults property object, and an object
that is meant as a default. If an object is supplied, the library will look for any validation infomation,
and act on it if it exists.

#### type (String)

The expected type of the value. 

This can be one of the default types specified below or a user defined type
created with `optionSetter.addType`. Setting the type allows it to be validated as that type. 
Further, when the default property is set to `optionSetter.default()`, the default will be provided 
according to the type specified.  (For example, the 'date' type provides a 
default of the result of `new Date()`.)

Example:
```
// validates that optionsObject.name is a string
name: {
  type: 'string'
},

// validates that optionsObject.date is a date. if 
// not provided, provides the value of new Date(), 
// which is the default setup by OptionSetter
date: {
  type: 'date',
  default: optionSetter.default()
}
```

#### validator (function)

Custom validators can be provided for any property. Validators are functions
that return a boolean indicating whether or not the provided value is valid.

A validator is called with two parameters:
- `value` - the value to be validated
- `defaultValidator` - when a type is specified, the default validator for that type. For example, 
for the string type, this will be a function that returns true if the provided value
is a string.
(When the type is not specified, this will be a function that always returns true.)

The validator must return the result as a boolean. Failure to do so will cause an error.

Example:

```
name: {
  type: 'string',
  validator: function(value, defaultValidator){
    // valid if a string and longer than 4 chars
    return defaultValidator(value) && value.length > 4;
  }
}
```

### failedValidationAction (function)

Usually, a failed validation will throw an error, and copying to the `setObject` will cease. In some circumstances, 
you may want to provide a custom (less extreme) action upon failed validation of a particular property.

In this circumstance, one can provide a failedValidationAction function.

This function will also be called if item is ommited.

The function will be passed the following parameters:
- `name` - the name of the object
- `message` - the error message
- `setObject` - the setObject, the first argument of `optionSetter.setOptions`. 
- `itemOmitted` (boolean) - whether or not this is a validation error
(false) or an error generated from an item being omitted (true).

This can be used to set properties on the setObject in a custom way.

The return value of this function will be ignored.


Example:

```
name: {
  type: 'string',
  failedValidationAction: function(name, message, setObject){
    setObject.name = 'Invalid Given';
    setObject.errors.push(name+' '+message);
  }
}
```

#### failMessage (string)

Provide a custom message in the case of a failed validation

Example:

```
name: {
  type: 'string',
  validator: function(value, defaultValidator){
    return defaultValidator(value) && value.length > 3; 
  }
  failMessage: 'name must be a string with length > 3'
}
```

#### required (boolean)

Specifies whether or not the value must be set on the `setObject`.

Defaults to true if not provided.

This is useful when a validation is desired if the value is given, 
but no validation is required when the value is not given. In this circumstance, `require: false` should be set.

Example:

```
one: {
  // passes when 1, '1', 'one' or nothing is given for value of optionsObject.one
  validator: function(value){
    return value == 1 || value === 'one';
  },
  required: false
}
```

Note: if a default is provided, required has no effect because there will be a value no matter 
if provided or not.

#### sourceName (string)

The property name in the `optionsObject` holding the required value.

If the property names refering to the same item in the `optionsObject` and the `setObject` will be different, 
the property name to use on the `setObject` is the same as the property used in the `defaultsObject`, 
and the property name from the `optionsObject` should be set by the `sourceName` property.

Example:

```
// options.screenName -> setObject.name
name: {
  type: 'string',
  sourceName: 'screenName'
}
```

#### default 

Sets the default value to use if not provided by the `optionsObject`.

When a default is used, it is not validated. For example, if an option should
be validated as a string, but the default should be the number 42, if the number 42 
is explicitly given, an error would be raised, but if nothing is given, 42 is used as
the default, with no error.

Example:

```
name: {
  type: 'string',
  default: 42 // will not cause validation error, even though it is not a string.
}

...

var default1 = { name: 42 }; // causes error
var default2 = {}; // does not cause error, 42 is used
var default2 = { name: '42' }; // does not cause error
```

If the default is `optionSetter.default()`, OptionSetter will automatically provide
a default based on the type definition.

### default types

OptionSetter.js provides a number of default types to be used as the `type` property (above).

#### boolean

Javascript boolean type. 

Validates if value is boolean.

Default: false

#### number

Javascript number type.

Validates if values is a number equal to or between `-Infinity` and/or `Infinity`. Does not validate if `NaN`.

Default: 0

#### object

Javascript object type.

Validates if object, i.e. non-primitive, but fails for instances of array or function.

Default: {}

#### array

Javascript array type.

Validates if array.

Default: []

#### string

Javascript string type.

Validates if string.

Default: ''

#### function

Javascript function type.

Validates if function. (Always invalid for RegEx).

Default: function(){}

#### date

Javascript date type.

Validates if valid date.

Default: result of new Date()


### optionSetter.addType({typeDefinition})

Custom types can be defined in OptionSetter. This is achieved by calling `addType` 
with a *Type Definition* object.

*Type definition properties*
- `name` (string) - the name of the type
- `default` (function) - a function that will return the default value for the type when `optionSetter.default()` is the default value
- `validator` (function) - a function that returns a boolean to indicate whether provided value is valid
- `failMessage` (string|optional) - the message generated when validation fails

The default function takes no paramters.

The validator takes only one parameter, which is the value to validate.

If failMessage is not given, the message generated will be 'failed validation'.

Currently, it is impossible to overwrite a type. This is to prevent overwriting of default types.

Example:

```
optionSetter.addType(
  {
    name: 'lower-case letter',
    default: function(){ return 'a'; },
    validator: function(){ return v.length === 1 && v.toLowerCase === v; },
    failMessage: 'must be lower case'
  }
);
```

### optionSetter.addTypes([typeDefinitions])

This is the same as `optionSetter.addType`, except it takes an array of *type definitions*.

### optionSetter.getValidator(name)

Return the default validator associated with the `name`. Useful for combining validators within custom validators.

```
var default = {
  numberOrString: {
    validator: function(value){
      return optionSetter.getValidator('number') || optionSetter.getValidator('string');
    }
  }
};
```

### optionSetter.setFailedValidationAction(failureAction)

OptionSetter's default behavior is to throw an error if validation fails. This behavior can be altered globally by providing
a function that sets up alternative behaviors.

The function is provided with the following parameters:
- `name` - the name of the property that fails validation or is omitted
- `message` - the 'error' message provided by the type definition or paramter
- `setObject` - the setObject, the first argument of `optionSetter.setOptions`. 
- `itemOmitted` (boolean) - whether or not this is a validation error
(false) or an error generated from an item being omitted (true).


Example:
```
optionSetter.setFailedValidationAction(function(name, message){
  console.warn('Error: '+name+' '+message);  
});
```

## License

MIT. See LICENSE.md.
