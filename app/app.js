import mvi from './mvi';

export default ({ DOM }) => ({
	DOM: __CLIENT__ ? mvi(DOM).skip(1) : mvi(DOM)
});
