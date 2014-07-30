// Underscore.templates.js
// -----------------------
// Handles compiling for the templates
// Pre-compiles all of the macros
// Adds comments to the begining and end of each template/macro
// to make it easier to spot templates with development tools
(function ()
{
	'use strict';
	
	SC.handleMacroError = function (error, macro_name)
	{
		console.error('Error in macro: '+ macro_name +', '+ error.stack);
	};
	
	
	SC.compileMacros = function compileMacros(macros)
	{
		// Exports all macros to SC.macros
		SC.macros = {};

		var context = {

			// registerMacro:
			// method used on every macro to define itself
			registerMacro: function (name, fn)
			{
				var original_source = fn.toString()
					// Adds comment lines at the begining and end of the macro
					// The rest of the mumbo jumbo is to play nice with underscore.js
				,	modified_source = ';try{var __p="\\n\\n<!-- MACRO STARTS: '+ name +' -->\\n";'+ original_source.replace(/^function[^\{]+\{/i, '').replace(/\}[^\}]*$/i, '') +';__p+="\\n<!-- MACRO ENDS: '+ name +' -->\\n";return __p;}catch(e){SC.handleMacroError(e,"'+ name +'")}' || []
					// We get the parameters from the string with a RegExp
				,	parameters = original_source.slice(original_source.indexOf('(') + 1, original_source.indexOf(')')).match(/([^\s,]+)/g) || [];
				
				parameters.push(modified_source);
				
				// Add the macro to SC.macros
				SC.macros[name] = _.wrap(Function.apply(null, parameters), function (fn)
				{
					return jQuery.trim(
						fn.apply(this, _.toArray(arguments).slice(1))
					);
				});
			}
		};
		
		// Now we compile de macros
		_.each(macros, function (macro)
		{
			try
			{
				// http://underscorejs.org/#template
				_.template(macro, context);
			}
			catch (e)
			{
				// if there's an arror compiling a macro we just
				// show the name of the macro in the console and carry on
				SC.handleMacroError(e, macro.substring( macro.indexOf('(') + 2, macro.indexOf(',') - 2 ) );
			}
		});
	};

	// Template compaling and rendering.
	// We compile the templates as they are needed 
	var processed_templates = {};

	function template (template_id, obj)
	{
		// Makes sure the template is present in the template collection 
		if (!SC.templates[template_id])
		{
			throw new Error('Template \''+template_id+'\' is not present in the template hash :(');
		}
		
		try
		{
			// If the temlpate hasn't been complied we compile it and add it to the library
			processed_templates[template_id] = processed_templates[template_id] || _.template(SC.templates[template_id] || '');
			// Then we return the template, adding the start and end comment lines
			return '\n\n<!-- TEMPLATE STARTS: '+ template_id +'-->\n'+ processed_templates[template_id](_.extend({}, SC.macros, obj)) +'\n<!-- TEMPLATE ENDS: '+ template_id +' -->\n';
		}
		catch (err)
		{
			// This adds the template id to the error message so you know which template to look at
			err.message = 'Error in template '+template_id+': '+err.message;
			throw err;
		}
	}

	// This is the noop function declared on Main.js
	SC.template = template;
	
})();
