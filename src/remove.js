/*
 * @Author: Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 */
/**
 * @external {Pragmatics} https://github.com/nomocas/babelute
 */

import _targets from './targets';

const removeActions = {
	attr($tag, lexem) {
		$tag.removeAttribute(lexem.args[0]);
	},
	class($tag, lexem) {
		if (lexem.args[0])
			$tag.classList.remove(lexem.args[0]);
	},
	classes($tag, lexem) {
		const splitted = lexem.args[0].split(/\s+/);
		splitted.forEach((cl) => {
			if (cl)
				$tag.classList.remove(cl);
		});
	},
	prop($tag, lexem) {
		delete $tag[lexem.args[0]];
	},
	data($tag, lexem) {
		delete $tag.dataset[lexem.args[0]];
	},
	style($tag, lexem) {
		delete $tag.style[lexem.args[0]];
	},
	id($tag) {
		delete $tag.id;
	},
	on($tag, lexem) {
		$tag.removeEventListener(lexem.args[0], lexem.listener);
	},
	onDom($tag, lexem /* render, dif, remove */, component ) {
		const remove = lexem.args[2];
		if (remove)
			remove($tag, lexem, component);
	},
	html($tag, lexem) {
		if (lexem.html)
			lexem.html.forEach((child) => $tag.removeChild(child));
	},
	text($tag, lexem) {
		$tag.removeChild(lexem.child);
	},
	each($tag, lexem, component) {
		lexem.children.forEach((child) => remove($tag, child, component));
	},
	tag($tag, lexem) {
		const babelutes = lexem.args[1],
			len = babelutes && babelutes.length || 0;
		for (let i = 0; i < len; ++i)
			seekAndUnmountComponent(babelutes[i]);
		$tag.removeChild(lexem.child);
	}
};

function remove($tag, babelute, component) {
	for (let i = 0, lexems = babelute._lexems, lexem, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (!_targets[lexem.lexicon])
			continue;
		if (removeActions[lexem.name]) // class, attr, id, prop, data, each, text, tag, html, component and .on
			removeActions[lexem.name]($tag, lexem, component);
		else if (lexem.developed) // compounds and if
			remove($tag, lexem.developed, component);

		if (lexem.witness) // if, each, component
			$tag.removeChild(lexem.witness);
	}
}

function seekAndUnmountComponent(babelute) {
	let instance;
	for (let i = 0, lexems = babelute._lexems, lexem, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (_targets[lexem.lexicon]) {
			if (lexem.children) // each
				seekAndUnmountComponentInArray(lexem.children);
			else if (lexem.name === 'tag')
				seekAndUnmountComponentInArray(lexem.args[1]);
			else if (lexem.name === 'onDom')
				removeActions.onDom(lexem.$tag, lexem/*, component*/);
			else if (lexem.instance) { // component, postalComponent and container
				instance = lexem.instance;
				seekAndUnmountComponent(instance.developed);
				instance.componentWillUnmount && (instance.componentWillUnmount(), instance.componentDidUnmount()); // if we have one we have both
			} else if (lexem.developed) // compounds and if, router 
				seekAndUnmountComponent(lexem.developed);
		}
	}
}

/*
	TODO : manage onDom third method while seeking
 */

function seekAndUnmountComponentInArray(babelutes) {
	const lenB = babelutes.length;
	for (let j = 0; j < lenB; ++j)
		seekAndUnmountComponent(babelutes[j]);
}

export {
	removeActions,
	remove,
	seekAndUnmountComponent,
	seekAndUnmountComponentInArray
};


/*
	For optimisation : component should keep its parent reference

	if compoenent has a componentWillUnmount (or did)
	==> this.parent.childNeedUnmount++; 
	which should be forwarded to its own parent, etc
	==> then on unmount
		this.parent.childNeedUnmout--;
		which should be forwarded to its own parent, etc

	when seeking for unmountable component : when encounter a component : check childNeedUnmout count.
	If 0 : don't recurse
 */

