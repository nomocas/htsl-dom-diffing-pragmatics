/*
 * @Author: Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 * @external {Pragmatics} https://github.com/nomocas/babelute
 */

import bbl from 'babelute';
import { insertHTML } from 'nomocas-webutils/lib/dom-utils';
import _targets from './targets';

const renderActions = {
	// Atoms rendering
	class($tag, lexem) {
		const args = lexem.args; /* className */
		if (args[0] && (args.length === 1 || args[1]))
			$tag.classList.add(args[0]);
	},
	classes($tag, lexem /* args : classes */ ) {
		const splitted = lexem.args[0].split(/\s+/);
		splitted.forEach((cl) => {
			if (cl)
				$tag.classList.add(cl);
		});
	},
	attr($tag, lexem) {
		const args = lexem.args; /* name, value */
		$tag.setAttribute(args[0], args[1]);
	},
	prop($tag, lexem) {
		const args = lexem.args; /* name, value */
		$tag[args[0]] = args[1];
	},
	data($tag, lexem) {
		const args = lexem.args; /* name, value */
		$tag.dataset[args[0]] = args[1];
	},
	style($tag, lexem) {
		const args = lexem.args; /* name, value */
		$tag.style[args[0]] = args[1];
	},
	id($tag, lexem) {
		$tag.id = lexem.args[0];
	},
	on($tag, lexem) {
		const args = lexem.args,
			/* eventName, callback */
			closure = lexem.closure = { handler: args[1], args: args[2] };
		lexem.listener = function(e) {
			closure.handler(e, ...closure.args);
		};
		$tag.addEventListener(args[0], lexem.listener);
	},

	// structural render actions
	tag($tag, lexem, component, frag) {
		lexem.child = document.createElement(lexem.args[0]);
		(frag || $tag).appendChild(lexem.child);
		const babelutes = lexem.args[1];
		if (babelutes)
			for (let i = 0, len = babelutes.length, babelute; i < len; ++i) {
				babelute = babelutes[i];
				if (typeof babelute === 'undefined') // cast undefined to '' to keep track of node for diffing
					babelute = '';
				if (!babelute || !babelute.__babelute__) // text node
					babelute = babelutes[i] = new bbl.Babelute()._append('html', 'text', [babelute]);
				render(lexem.child, babelute, component);
			}
	},

	text($tag, lexem, component, frag) {
		lexem.child = document.createTextNode(lexem.args[0]);
		(frag || $tag).appendChild(lexem.child);
	},

	if ($tag, lexem, component, frag) {
		const toRender = lexem.args[0] ? lexem.args[1] : (lexem.args[2] ? lexem.args[2] : null);
		if (toRender) {
			lexem.developed = (typeof toRender === 'function') ? toRender(lexem.args[0]) : toRender;
			render($tag, lexem.developed, component, frag);
		}
		lexem.witness = document.createComment('if');
		$tag.appendChild(lexem.witness);
	},

	each($tag, lexem, component, frag) {
		const args = lexem.args,
			collection = args[0] = args[0] || [],
			itemRender = args[1];
		lexem.children = [];
		for (let i = 0, len = collection.length, developed; i < len; ++i) {
			developed = itemRender(collection[i], i);
			lexem.children.push(developed);
			render($tag, developed, component, frag);
		}
		lexem.witness = document.createComment('each');
		$tag.appendChild(lexem.witness);
	},

	// custom output
	onDom($tag, lexem, component, frag /* args = render, dif, remove */ ) {
		const onRender = lexem.args[0];
		lexem.$tag = $tag;
		if (onRender)
			onRender($tag, lexem, component, frag);
	},
	html($tag, lexem) {
		insertHTML(lexem.args[0], $tag);
		lexem.witness = document.createComment('html');
		$tag.appendChild(lexem.witness);
	},
	execute($tag, lexem) {
		lexem.args[0].apply(null, lexem.args[1]);
	},
	ref($tag, lexem, component) {
		component && (component[lexem.args[0]] = $tag);
	},
	switchUse($tag, lexem, component, frag) {
		lexem.developed = new bbl.FirstLevel()._use(lexem.args[0], ...(lexem.args[1]));
		render($tag, lexem.developed, component, frag);
		lexem.witness = document.createComment('switchUse');
		$tag.appendChild(lexem.witness);
	}
};

function render($tag, babelute, component, frag) {
	for (let i = 0, lexem, lexems = babelute._lexems, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (!_targets[lexem.lexicon])
			continue;
		if (renderActions[lexem.name])
			renderActions[lexem.name]($tag, lexem, component, frag);
		else { // no actions means it's a compound lexem.
			if (!lexem.args || !lexem.args.length) // if lexem has receive no arguments : bypass level-by-level developpement
				lexem.developed = bbl.developToAtoms(lexem, _targets[lexem.lexicon]);
			else // or develop just next level and recurse.
				lexem.developed = bbl.developOneLevel(lexem, _targets[lexem.lexicon]);
			lexem.developed && render($tag, lexem.developed, component, frag);
		}
	}
}

export {
	render,
	renderActions
};

