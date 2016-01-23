import {run} from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';

import app from './app';

const {sinks, sources} = run(app, {
	DOM: makeDOMDriver('#root')
});

if (module.hot) {
	module.hot.accept();

	module.hot.dispose(() => {
		sinks.dispose();
		sources.dispose();
	});
}
