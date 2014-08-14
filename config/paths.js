
module.exports = {
	getPath: __getPath,

	getBower: __getPath.bind(null, 'bower_components'),
	getConfig: __getPath.bind(null, 'config'),
	getData: __getPath.bind(null, 'appdata'),
	// getService: __getPath.bind(null, 'services'),
	getLib: __getPath.bind(null, 'lib'),
	getModule: __getPath.bind(null, 'node_modules'),
	getPublic: __getPath.bind(null, 'public'),
	getRoute: __getPath.bind(null, 'routes'),
	getView: __getPath.bind(null, 'views/src'),
};

function __getPath(pathRoot, partialPath) {
	partialPath = partialPath || '';
	return require('path').join(process.cwd(), pathRoot, partialPath);
}
