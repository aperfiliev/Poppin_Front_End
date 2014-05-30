function postInstallCombiner ()
{
	try
	{
		var loaded_file = null,
			cloned_file = null,
			searched_folders = {},

			context = nlapiGetContext(),
			// path to the ssp aplication containing folder
			reference_container_path = '/Web Site Hosting Files/Live Hosting Files/SSP Applications/NetSuite Inc. - ShopFlow 1.03.0/Reference ShopFlow',
			custom_container_path = reference_container_path.replace('Reference', 'Custom');

		// the paths to the folders that need to have the config file triggered
		'/templates;/js;/js/libs;/js/utils;/skins/standard'.split(';').forEach(function (path, index)
		{
			try // we use a trycatch here so we can trigger all of the combiners even if there's an error with one
			{
				var custom_folder = getFolder( custom_container_path + path, searched_folders );
					config_file = getFile( custom_folder );

				if ( config_file )
				{
					nlapiSubmitFile( config_file ); // to trigger the combiner we just have to "edit" the file
				}
				else
				{
					var reference_folder = getFolder( reference_container_path + path, searched_folders ),
						config_file = getFile( reference_folder ),
						cloned_file = nlapiCreateFile( config_file.getName(), config_file.getType(), config_file.getValue() );

					cloned_file.setFolder( custom_folder );
					nlapiSubmitFile( cloned_file );
				}
			}
			catch (e)
			{
				nlapiLogExecution('ERROR', 'Error triggering combiner', 'folder: '+ path );

				'getCode' in e
					 ? nlapiLogExecution('ERROR', 'NetSuite Error details', e.getCode() +': '+ e.getDetails() )
					 : nlapiLogExecution('ERROR', 'JavaScript Error details', e.message );
			}
		});
	}
	catch (e)
	{
		'getCode' in e
			 ? nlapiLogExecution('ERROR', 'NetSuite Error details', e.getCode() +': '+ e.getDetails() )
			 : nlapiLogExecution('ERROR', 'JavaScript Error details', e.message );
	}
}

function getFile ( folder )
{
	var result = null,
		loaded_file = null,

		filters = [
			new nlobjSearchFilter('folder', null, 'is', folder )
			, new nlobjSearchFilter('name', null, 'contains', '.config')
		],

		config_files = nlapiSearchRecord('file', null, filters, null);

	if ( config_files && config_files.length )
	{
		for (var i = 0; i < config_files.length; i++ )
		{
			loaded_file = nlapiLoadFile( config_files[i].getId() );

			if ( loaded_file.getFolder() == folder )
			{
				result = loaded_file;
				break;
			}
		}
	}

	return result;
}

function getFolder ( path, searched_folders )
{
	var parent_path = path.substring( 0, path.lastIndexOf('/') );

	if ( !parent_path ) // if no parent then is root
	{
		var filters = [
				new nlobjSearchFilter('name', null, 'is', path.substring(1) )
				, new nlobjSearchFilter('istoplevel', null, 'is', 'T' )
			],

			root_folder = nlapiSearchRecord('folder', null, filters, null)[0];

		return searched_folders[path] = parseFloat( root_folder.getId() );
	}
	else if ( !( parent_path in searched_folders ) )
	{
		getFolder( parent_path, searched_folders );
	}

	var folder = path.split('/').pop(),

		filters = [
			new nlobjSearchFilter('parent', null, 'is', searched_folders[parent_path] )
			, new nlobjSearchFilter('name', null, 'is', folder )
		],

		result = nlapiSearchRecord('folder', null, filters, null)[0];
	// we add the folder found to the hash table to cache future searches
	return searched_folders[parent_path +'/'+ folder] = parseFloat( result.getId() );
}