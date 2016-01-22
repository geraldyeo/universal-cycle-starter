import { run } from '@cycle/core';
import { makeDOMDriver } from '@cycle/dom';

let mvi = require('./mvi').default;

run(({ DOM }) => ({
	DOM: mvi(DOM).skip(1)
}), {
	DOM: makeDOMDriver('#root')
});

if (__DEVELOPMENT__ && module.hot) {
	module.hot.accept('./mvi', () => {
		mvi = require('./mvi').default;
	});
}
