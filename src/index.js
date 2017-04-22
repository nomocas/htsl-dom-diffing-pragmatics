/**
 * Babelute HTML Dom Diffing Pragmatics
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 */
/**
 * @external {Pragmatics} https://github.com/nomocas/babelute
 */

import bbl from 'babelute'; // external
import _targets from './targets';
import { remove, removeActions, seekAndUnmountComponent, seekAndUnmountComponentInArray } from './remove';
import { dif, difActions } from './dif';
import { render, renderActions } from './render';
import { mountComponentInstance } from './component';
import './container';

import htmlLexicon from 'htsl-lexicon'; // external

htmlLexicon.addAliases({
	$render(domElement, oldBabelute = null, component = null) {
		if (oldBabelute)
			dif(domElement, this, oldBabelute, component);
		else 
			render(domElement, this, component);
		return this;
	},
	$renderBefore($nextSibling, component = null) {
		const frag = document.createDocumentFragment();
		render(frag, this, component);
		$nextSibling.parentNode.insertBefore(frag, $nextSibling);
		return this;
	},
	$remove(domElement) {
		return remove(domElement, this);
	}
});


/**
 * DomDiffing Pragmatics instance
 * @public
 * @type {Pragmatics}
 * @todo  addTargetLexicon(lexicon) => catch name for _targets + store lexicon reference for one level developement : no more need to register lexicons globally
 * @example
 * import difPragmas from 'htsl-dom-diffing-pragmatics';
 * import htmlLexicon from 'babelute-hstml/src/html-lexicon.js';
 *
 * const h = htmlLexicon.initializer(true); // FirtsLevel initializer
 * const $root = document.getElementById('foo');
 * let oldRendered, // for diffing tracking
 * 	animFrame;
 *
 * function render(){
 * 	return h.div(state.intro).section(h.class('my-section').h1(state.title));
 * }
 *
 * function update(state) {
 * 	if (animFrame)
 * 		cancelAnimationFrame(animFrame);
 * 	animFrame = requestAnimationFrame(() => {
 * 		const newRendered = render(state);
 * 		oldRendered = difPragmas.$output($root, newRendered, oldRendered);
 * 	});
 * }
 * 
 * update(myState);
 */
const difPragmas = bbl.createPragmatics(_targets, {
	$output($tag, babelute, oldBabelute, component = null) {
		oldBabelute ? dif($tag, babelute, oldBabelute, component) : render($tag, babelute, component);
		return babelute;
	},
	addLexicon(lexicon, name) {
		this._targets[name || lexicon.name] = lexicon;
		while (lexicon.parent) {
			lexicon = lexicon.parent;
			this._targets[lexicon.name] = lexicon;
		}
	},
	mountComponentInstance,
	render,
	dif,
	remove,
	renderActions,
	difActions,
	removeActions,
	seekAndUnmountComponent,
	seekAndUnmountComponentInArray
});

export default difPragmas;

