import {run} from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import isolate from '@cycle/isolate';
import {restart, restartable} from 'cycle-restart';

// import app from './app';
let app = require('./app').default;

const drivers = {
	DOM: restartable(makeDOMDriver('#root'), {pauseSinksWhileReplaying: false})
};

const {sinks, sources} = run(app, drivers);

if (module.hot) {
	module.hot.accept('./app', () => {
		app = require('./app').default;
		restart(app, drivers, {sinks, sources}, isolate);
	});
}
