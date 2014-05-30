/* Typechecking Jasmine matchers
   by Evan Hahn (evanhahn.com)

Simple Jasmine matchers for checking types. Include this file to get the
following matchers:

    expect(foo).toBeA(Thing);    // Checks if foo is an instance of Thing.
                                 // Alias: toBeAn(AwesomeThing)
    expect(foo).toBeANumber();
    expect(foo).toBeAnInteger();
    expect(foo).toBeAString();
    expect(foo).toBeABoolean();
    expect(foo).toBeAnArray();
    expect(foo).toBeAnObject();
    expect(foo).toBeNaN();
    expect(foo).toBeInfinity();

These matchers will test positive for primitive types and their object analogs.
For example:

    expect(12).toBeANumber();                // => positive
    expect(new Number(12)).toBeANumber();    // => positive

These are licensed under the Unlicense (see bottom of file).

*/

beforeEach(function() {

	// Defined up here because we'll need it later...twice!
	var toBeA = function(expected) {
		var actual = this.actual;
		this.message = function() {
			return 'Expected ' + actual + ' to be of type ' + expected;
		};
		return (actual instanceof expected);
	};

	this.addMatchers({

		toBeA: toBeA,
		toBeAn: toBeA,

		toBeANumber: function() {
      var actual = this.actual;
      this.message = function() {
        return 'Expected ' + actual + ' to be a number';
      };
      return (typeof actual.valueOf()) === 'number';
    },

		toBeAString: function() {
			var actual = this.actual;
			this.message = function() {
				return 'Expected ' + actual + ' to be a string';
			};
			return (typeof actual.valueOf()) === 'string';
		},

		toBeABoolean: function() {
			var actual = this.actual;
			this.message = function() {
				return 'Expected ' + actual + ' to be a boolean';
			};
			return (typeof actual.valueOf()) === 'boolean';
		},

		toBeAnArray: function() {
			var actual = this.actual;
			this.message = function() {
				return 'Expected ' + actual + ' to be an array';
			};
			return (actual instanceof Array);
		},

		toBeAnObject: function() {
			var actual = this.actual;
			this.message = function() {
				return 'Expected ' + actual + ' to be an object';
			};
			return (typeof actual === 'object');
		},

		toBeNaN: function() {
			var actual = this.actual;
			this.message = function() {
				return 'Expected ' + actual + ' to be NaN';
			};
			return (actual !== actual);
		},

		toBeInfinity: function() {
			var actual = this.actual;
			this.message = function() {
				return 'Expected ' + actual + ' to be infinite';
			};
			return ((typeof actual.valueOf() === 'number') && (!isFinite(actual)));
		},

		toBeAnInteger: function() {
			var actual = this.actual;
			this.message = function() {
				return 'Expected ' + actual + ' to be an integer';
			};
			return ((typeof actual.valueOf() === 'number') && (Math.floor(actual.valueOf()) === actual.valueOf()));
		},

		toBeABoolean: function() {
			var actual = this.actual;
			this.message = function() {
				return 'Expected ' + actual + ' to be a boolean';
			};
			return (typeof actual.valueOf()) === 'boolean';
		}

	});

});

/*

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>

*/