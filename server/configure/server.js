import http from 'http';
import path from 'path';
import Express from 'express';
import jade from 'jade';
import compression from 'compression';
import serialize from 'serialize-javascript';
import {run} from '@cycle/core';
import {makeHTMLDriver} from '@cycle/dom';
import {Observable as $} from 'rx';

import main from '../../app/app';
//import mvi from '../../app/mvi';
const template = jade.compileFile('./common/helpers/index.jade');

export default function configureServer(app, server, proxy, targetUrl) {
	app.disable('x-powered-by');

	app.use(compression());
	app.use(Express.static(path.join(__dirname, '../..', 'static')));

	// Proxy to API server
	app.use('/api', (req, res) => {
		proxy.web(req, res);
	});

	app.use('/ws', (req, res) => {
		proxy.web(req, res, {target: targetUrl + '/ws'});
	});

	server.on('upgrade', (req, socket, head) => {
		proxy.ws(req, socket, head);
	});

	// added the error handling to avoid
	// https://github.com/nodejitsu/node-http-proxy/issues/527
	proxy.on('error', (error, req, res) => {
		let json;
		if (error.code !== 'ECONNRESET') {
			console.error('proxy error', error);
		}
		if (!res.headersSent) {
			res.writeHead(500, {'content-type': 'application/json'});
		}

		json = {error: 'proxy_error', reason: error.message};
		res.end(JSON.stringify(json));
	});

	app.use((req, res) => {
		if (__DEVELOPMENT__) {
			webpackIsomorphicTools.refresh();
		}

		const {sources} = run(main, {DOM: makeHTMLDriver()});
		const html$ = sources.DOM.map(html => template({html, context: true, bundle: webpackIsomorphicTools.assets().javascript.main}));
		html$.subscribe(html => res.send(html));
	});
}
