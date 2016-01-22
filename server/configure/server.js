import path from 'path';
import Express from 'express';
import compression from 'compression';
import { run } from '@cycle/core';
import { makeHTMLDriver } from '@cycle/dom';
import {Observable as $, ReplaySubject} from 'rx';

let mvi = require('../../app/mvi').default;

// Cycle.run main function
const main = ({ DOM }) => ({ DOM: mvi(DOM) });
// create mock DOM driver
const DOM = makeHTMLDriver();

export default function configureServer (app, server, proxy, targetUrl) {
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

			if (module.hot) {
				module.hot.accept('../../app/mvi', () => {
					mvi = require('../../app/mvi').default;
				});
			}
		}

		const context$ = $.just({route: req.url});
		const html$ = run(main, {
			DOM,
			context: () => context$
		}).sources.DOM.map((html) => `<!doctype html>${html}`);
		html$.subscribe(html => res.send(html));

		// res.status(200).send('<!doctype html><html><body><div
        // id="root"/></body></html>');
	});
}
