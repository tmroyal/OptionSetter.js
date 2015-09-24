# OptionSetter.js
A Javascript library designed to simply the consumption of options objects. It's like `(_||$).extend` on steroids.

## Motivation

Often, in Javascript one needs to provide a function or constructor a multitude
of paramters. Some of these parameters might be optional, and some of these may
have defaults. In these kinds of circumstances, one often resorts to using an object
parameter that contains the desired values:

```
function MyObject(options){
  this.prop1 = options.prop1;
  this.prop2 = options.prop2 || 'default';
}
```

Another method way of doing this involves using the `.extend()` method provided
by several libraries:

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

In some cases, type validation is desired. In these circumstances, 
code becomes more verbose, as one needs to apply validation conditions to 
every element in the options object. Further, in circumstances in which some
items are options, others have a default, and others are mandatory, the
number of lines that have test conditions can become significantly larger
than the functional portions of the code.

This library attempts to simplify and streamline the usage of options objects by allowing
automatic defaults, standard validations, and other capbilities relating to the consumption of
options objects.

(Note: some of these capabilities will be provided in the future by ECMAScript 2015 Proxies and default parameters.)

## Installation

Clone the repo and include in source:

`<script src="dst/OptionSetter.js"></script>`

Other options include npm:

`npm install OptionSetter.js`

or bower:

`bower install OptionSetter`

## Example Usage

```
function MyObject(options){
  var defaults = {
    param1: {
      // if options.param1 is provided, it must be a date
      // if not, provide auto date default, which is return 
      // value new Date()
      type: 'date'
      default: OptionSetter.default
    },
    param2: {
      // if options.param2 is provided, it must be a string
      // if not, set as 'param2'
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
      // if options.p6 is given, it must be a number, and will be set to param6 on destination
      // if not given, this default will be ignored
      type: 'number',
      sourceName: 'p6',
      required: false
    }
  }

  // set this to values which occur either in defaults or options, 
  // provided options validate
  OptionSetter.setOptions(this, defaults, options);
}
```

The above can be written succicntly by removing comments:

```
function MyObject(options){
  var defaults = {
    param1: { type: 'date' default: OptionSetter.default },
    param2: { type: 'string', default: 'param2' },
    param3: { type: 'array' },
    param4: 'param4', 
    param5: { 
      // this can be written more succintly using ES2015's =>
      validator: function(v){ return value == 1 || value === 'one' }, 
      require: true 
    }, 
    param6: { type: 'number', sourceName: 'p6', required: false }
  }

  OptionSetter.setOptions(this, defaults, options);
}
```

In the above case, if any value in the options object fails validations set up by the defaults object,
an error is thrown. (This behavior is customizable.)

If the goal is to use the options object, rather than copy its
keys and properties to `this`, one can write the following: 

```
OptionSetter.setOptions(options, defaults, options);
```
or:

```
options = OptionSetter.setOptions({}, defaults, options);
```

## API Documentation

### OptionSetter.setOptions(setObject, defaultsObject, optionsObject)

*Parameters*
- `setObject` - the object on which to set properties
- `defaultsObject` - the object which contains defaults, type specifications, and other validation information
- `optionsObject` - the object whose properties are copied to the setObject if validated successfully

*Returns*
`setObject` with options added, or original `setObject` if validation fails

This method simply adds the validated properties in the `optionsObject`, plus applicable defaults from the `defaultsObject`, 
to the `setObject`, and returns said `setObject`.

If any value in the options object fails validations set up by the defaults object, an error is thrown. (This behavior is customizable.)

Note, any options not referenced in the `defaultsObject` but included in the `optionsObject` are simply added to `setObject` without validation.

### defaultsObject

The `defaultsObject` contains the defaults, type specfications, and validation information used by `OptionSetter.setOptions`. It
is an object whose property names correspond to the names that will appear in the `setObject` and does (usually) appear in 
the `optionsObject`. Each property may contain either the default, or an object that sepcifies information used for validation, 
default generation, etc.

An example: 
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
  tags: [] // default is empty array, and is not validated
};
```

#### type (String)

This specifies the expected type for the value. This can either be one of the default types specied below, or a user defined type
created with ``OptionSetter.addType``. Setting the type allows it to be validated. Also, when the default property is set to 
OptionSetter.default, the default will be provided according to how the type is defined. 
(For example, the 'date' type provides a default of the result of ``new Date()``.)

Example:
```
// validates that optionsObject.name is a string
name: {
  type: 'string'
},

// validates that optionsObject.date is a date. if 
// not provided, provides the value of new Date(), 
// according to the definition of the default type 'date'
date: {
  type: 'date',
  default: OptionSetter.default 
}
```

#### validator (function)

Custom validators can be provided for any property. Validators are funcitons
that return a boolean indicating whether or not the provided value is valid.

A validator is called with two parameters:
- `value` - the value to be validated
- `defaultValidator` - when a type is specified, the default validator for that type. For example, 
for the string type, this will be a function that returns true if the provided value
is a string.
(When the type is not specified, this will be a function that always returns true.)

The validator should return the result as a boolean. Failure to do so will result in an error.

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

Usually, a failed validation will throw an error, and the copying to the `setObject` will cease. In some circumstances, 
a failed validation requires a custom action.

In this circumstance, one can provide a failedValidationAction function.

The function will take the following parameter:
- `setObject` - the set object. This can be used to set properties on the setObject in a custom way.

The return value of this function will be ignored by OptionSetter.js.

Example:

```
name: {
  type: 'string',
  failedValidationAction: function(setObject){
    setObject.name = 'Invalid Given';
    setObject.errors.push('name is not a string');
  }
}
```

#### failedValidatonMessage (string)

Provide a custom message in the case of a failed validation

Example:

```
name: {
  type: 'string',
  validator: function(value, defaultValidator){
    return defaultValidator(value) && value.length > 3; 
  }
  message: 'name must be a string with length > 3'
}
```

#### required (boolean)

Defaults to true if not provided.

Specifies whether or not this value is required to be set on the `setObject`.

This is useful in that case in which a validation is desired if the value is given, 
but nothing should happen if the value is not given.

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

#### sourceName (string)

The property name in the `optionsObject` to find the specified value. 

If there is to be a difference between the property name in the `optionsObject` and the `setObject`, use
the desired `setObject` name as the property name in the `defaultsObject` and set the `sourceName` property
to the property name in the `optionsObject`.

Example:

```
// options.screenName -> setObject.name
name: {
  type: 'string',
  sourceName: 'screenName'
}
```

#### default 

Sets the default value to use if the corresponding value is not provided in the `optionsObject`.

When default is set for a type, and it is not provided in the `optionsObject`, validation is skipped.

name: {
  type: 'string',
  default: 42 // will not cause validation error
}

### default types

OptionSetter.js provides a number of default types to be used as the type property for any property in the `defaultsObject`.

#### boolean

Javascript boolean type. 

Validates if value is boolean.

Default: false

#### number

Javascript number type.

Validates if values is a number between `-Infinity` and `Infinity`. Does not validate if `NaN` or `-NaN`.

Default: 0

#### object

Javascript object type.

Validates if object.

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

Validates if function.

Default: function(){}

#### date

Javascript date type.

Validates if valid date.

Default: result of new Date()


### OptionSetter.addType({typeDefinition})

Custom types can be defined in OptionSetter. This is achieved by calling the above function 
with an object that serves as a *Type Definition*

*Type definition properties*
- `name` (string) - the name of the type
- `default` (function) - a function that will return the default value for the type when OptionSetter.default is given for default value
- `validator` (function) - a function that returns a boolean to indicate whether provided value is valid
- `failMessage` (string) - the message generated when validation fails

The default function takes no paramters.

The validator takes only one parameter, which is the value to validate.

Example:

```
OptionSetter.addType(
  {
    name: 'lower-case letter',
    default: function(){ return 'a'; },
    validator: function(){ return v.length === 1 && v.toLowerCase === v; },
    message: 'must be lower case'
  }
);
```

### OptionSetter.addTypes([typeDefinitions])

This is the same as `OptionSetter.addType`, except it takes an array of *type definitions*.

### OptionSetter.setDefault(name, defaultFunction)

This overwrites the default value generator for type specified by name.

### OptionSetter.setValidator(name, validatorFunction)

This overwrites the default validator for type specified by name.

### OptionSetter.getValidator(name)

Return the default validator associated the name. Useful for combining validators within custom validators.

```
var default = {
  numberOrString: {
    validator: function(value){
      return OptionSetter.getValidator('number') || OptionSetter.getValidator('string');
    }
  }
};
```

### OptionSetter.setFailedValidationAction(failureAction)

OptionSetter's default behavior is to throw and error if validation fails. This behavior can be altered globally by providing
a function to this function.

The function will have the following parameters:
- `name` - the name of the property that fails validation
- `message` - the 'error' message provided by the type definition or paramter

Example:
```
OptionSetter.setFailedValidationAction(function(name, message){
  console.warn('Error: '+name+' '+message);  
});
```

## License

MIT. See LICENSE.md.
