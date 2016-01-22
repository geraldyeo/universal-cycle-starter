import { run } from '@cycle/core';
import { makeDOMDriver } from '@cycle/dom';
import mvi from './mvi';

run(({ DOM }) => ({
	DOM: mvi(DOM).skip(1)
}), {
	DOM: makeDOMDriver('#root')
});

if (__DEVELOPMENT__ && module.hot) {
	// Enable Webpack hot module replacement for reducers
	module.hot.accept();
}
