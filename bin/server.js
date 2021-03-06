#!/usr/bin/env node
require('babel-register'); // babel registration (runtime transpilation for node)
require('babel-polyfill');

var path = require('path');
var rootDir = path.resolve(__dirname, '..');

// define universal constants
global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = false;  // <----- DISABLES SERVER SIDE RENDERING FOR ERROR DEBUGGING
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

if (__DEVELOPMENT__) {
	if (!require('piping')({
		hook: true,
		ignore: /(\/\.|~$|\.json|\.scss$)/i
	})) {
		return;
	}
}

var WebpackIsomorphicTools = require('webpack-isomorphic-tools');
global.webpackIsomorphicTools = new WebpackIsomorphicTools(require('../webpack/isomorphic-tools.config'))
	.development(__DEVELOPMENT__)
	.server(rootDir, function () {
		require('../server/index');
	});
