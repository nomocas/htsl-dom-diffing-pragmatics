/*
 * @Author: Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 */
/**
 * @external {Pragmatics} https://github.com/nomocas/babelute
 */

import bbl from 'babelute';
import domUtils from 'nomocas-webutils/lib/dom-utils';
import { render, renderActions } from './render';
import { remove } from './remove';
import _targets from './targets';


/**
 * difActions
 * @public
 * @type {Object}
 */
const difActions = {
	// structurals
	if ($tag, lexem, olexem, component) {
		lexem.witness = olexem.witness;
		const args = lexem.args,
			oargs = olexem.args;
		let toRender;
		if (!args[0] !== !oargs[0]) { // condition has change
			if (!args[0] || oargs[2]) // if condition was true (there is a success babelute that was developed) OR it was false and there is an elseBabelute in olexem that was developed
				remove($tag, olexem.developed, component); // remove old babelute (either "success or else" babelute)
			toRender = args[0] ? args[1] : args[2]; // if condition is true take "success babelute", else take "else babelute"
			if (toRender) { // render : add children tags to fragment then add to $tag + add attributes (and co) directly to $tag.
				const frag = document.createDocumentFragment();
				lexem.developed = (typeof toRender === 'function') ? toRender() : toRender;
				render($tag, lexem.developed, component, frag);
				$tag.insertBefore(frag, lexem.witness);
			}
		} else { // no change so dif developed babelutes
			toRender = args[0] ? args[1] : args[2];
			if (toRender) {
				lexem.developed = (typeof toRender === 'function') ? toRender() : toRender;
				dif($tag, lexem.developed, olexem.developed, component);
			}
		}
	},

	each($tag, lexem, olexem, component) {
		const collection = lexem.args[0] || [],
			renderItem = lexem.args[1],
			ochildren = olexem.children,
			len = collection.length,
			olen = ochildren.length,
			children = lexem.children = new Array(len);

		let developed,
			frag,
			item,
			i = 0;

		lexem.witness = olexem.witness; // keep track of witness

		if (len > olen) // create fragment for new items
			frag = document.createDocumentFragment();
		for (; i < len; ++i) { // for all items (from new lexem)
			item = collection[i];
			developed = renderItem(item, i); // render firstdegree item
			children[i] = developed; // keep new developed for next diffing
			if (i < olen) // dif existing children
				dif($tag, developed, ochildren[i], component);
			else // full render new item and place produced tags in fragment 
				render($tag, developed, component, frag); // ($tag is forwarded for first level non-tags atoms lexems (aka class, attr, ...))
		}
		for (; i < olen; ++i) // remove not diffed old children
			remove($tag, ochildren[i], component);
		if (frag) // insert new children fragment (if any)
			$tag.insertBefore(frag, lexem.witness);
	},

	/*
		keyedEach are almost workable.
		still only reinsert logic (tag displacement) 

		refactor :

		lire items dans 'ordre

			if(!dico[items[i].key])
				=> new element => render and insert after last
			else{
				=> dif existing 
				 if(first element after last is not the first element of newdev)
					=> recycled element but not same place
					=> displace them after last
			}
			last = newdev
	 */

	// keyedEach($tag, lexem, olexem, component, frag) {
	// 	const items = lexem.args[1],
	// 		keyName = lexem.args[1],
	// 		renderer = lexem.args[2],
	// 		newDico = lexem.dico = {},
	// 		oDico = olexem.dico,
	// 		oChildren = olexem.children,
	// 		children = lexem.children = [];

	// 	let lastdeveloped, seenIndex = 0,
	// 		i = 0,
	// 		newFrag,
	// 		key, olddeveloped, newdeveloped;

	// 	for (let len = items.length, item; i < len; ++i) {
	// 		// dif then displace : displace mean reinserting child (tag(s)) at current index
	// 		key = item[keyName];
	// 		olddeveloped = oDico[key];
	// 		newdeveloped = renderer(item);

	// 		children.push(newdeveloped);

	// 		if (olddeveloped) {
	// 			dif($tag, newdeveloped, olddeveloped, component);
	// 			if (i !== olddeveloped.index)
	// 				if (lastdeveloped)
	// 					displaceAfter($tag, newdeveloped, lastdeveloped.lastChild); // (displace tags after last developed)
	// 				else
	// 					displaceBefore($tag, newdeveloped, $tag.firstChild);

	// 				// reorder oldChildren by swapping (for catching notSeens at the end of ochildren)
	// 			if (seenIndex !== olddeveloped.index) {
	// 				const temp = oChildren[seenIndex];
	// 				oChildren[seenIndex] = oChildren[olddeveloped.index];
	// 				oChildren[olddeveloped.index] = temp;
	// 			}
	// 			seenIndex++;
	// 		} else if (i < oChildren.length) {
	// 			// render in fragment then insertBefore lastdeveloped.nextSibling
	// 			newFrag = document.createDocumentFragment();
	// 			render(newFrag, newdeveloped, component);
	// 			newdeveloped.lastChild = newFrag.lastChild;
	// 			$tag.insertBefore(newFrag, lastdeveloped.lastChild.nextSibling);
	// 		} else {
	// 			render($tag, newdeveloped, component, frag);
	// 			newdeveloped.lastChild = $tag.lastChild;
	// 		}
	// 		newDico[key] = lastdeveloped = newdeveloped;
	// 		newdeveloped.index = i;
	// 	}

	// 	// remove rest of oldChildren (so unseens if any)
	// 	for (; i < oChildren.length; ++i)
	// 		remove($tag, oChildren[i], component);
	// },

	tag($tag, lexem, olexem, component) {
		lexem.child = olexem.child; // keep track of elementNode
		const babelutes = lexem.args[1],
			obabelutes = olexem.args[1];

		let babelute, obabelute;
		if (babelutes)
			for (let i = 0, len = babelutes.length; i < len; i++) {
				// render all children's babelutes
				babelute = babelutes[i];
				obabelute = obabelutes[i];
				if (babelute === obabelute)
					continue;
				if (typeof babelute === 'undefined') // cast undefined to empty string
					babelute = '';
				if (!babelute || !babelute.__babelute__)
					babelute = babelutes[i] = new bbl.Babelute()._append('html', 'text', [babelute]);
				dif(lexem.child, babelute, obabelute, component);
			}
	},

	text($tag, lexem, olexem) {

		const newText = lexem.args[0];

		lexem.child = olexem.child; // keep track of textnode
		if (newText !== olexem.args[0])
			lexem.child.nodeValue = newText;
	},

	// html simple atoms diffing
	class($tag, lexem, olexem) {

		const name = lexem.args[0], // new class name
			oname = olexem.args[0], // old class name
			flag = lexem.args[1], // new class flag
			oflag = olexem.args[1]; // old class flag

		if (name !== oname) {
			if (oname)
				$tag.classList.remove(oname);
			if (name && (lexem.args.length === 1 || flag))
				$tag.classList.add(name);
		} else if (name && lexem.args.length > 1 && !flag !== !oflag)
			$tag.classList.toggle(name);
	},

	classes() {
		// do nothing
	},

	attr($tag, lexem, olexem) {
		const name = lexem.args[0],
			value = lexem.args[1],
			oname = olexem.args[0],
			ovalue = olexem.args[1];

		if (name !== oname) {
			$tag.removeAttribute(oname);
			$tag.setAttribute(name, value);
		} else if (value !== ovalue)
			$tag.setAttribute(name, value);
	},

	prop($tag, lexem, olexem) {

		const name = lexem.args[0],
			value = lexem.args[1],
			oname = olexem.args[0];

		if (name !== oname) {
			delete $tag[oname];
			$tag[name] = value;
		} else if (value !== $tag[name] /*olexem.args[1]*/ ) // look diectly in element : for "checked" bug (or other properties that change on native interaction with element)
			$tag[name] = value;
	},

	data($tag, lexem, olexem) {

		const name = lexem.args[0],
			value = lexem.args[1],
			oname = olexem.args[0],
			ovalue = olexem.args[1];

		if (name !== oname) {
			delete $tag.dataset[oname];
			$tag.dataset[name] = value;
		} else if (value !== ovalue)
			$tag.dataset[name] = value;
	},

	style($tag, lexem, olexem) {
		const name = lexem.args[0],
			value = lexem.args[1],
			oname = olexem.args[0],
			ovalue = olexem.args[1];

		if (name !== oname) {
			delete $tag.style[oname];
			$tag.style[name] = value;
		} else if (value !== ovalue)
			$tag.style[name] = value;
	},

	id($tag, lexem, olexem) {
		const id = lexem.args[0];
		if (id !== olexem.args[0])
			$tag.id = id;
	},

	on($tag, lexem, olexem) {
		const name = lexem.args[0],
			oname = olexem.args[0];
		if (name !== oname) {
			$tag.removeEventListener(oname, olexem.listener);
			renderActions.on($tag, lexem);
		} else {
			const closure = lexem.closure = olexem.closure;
			lexem.listener = olexem.listener;
			closure.handler = lexem.args[1];
			closure.args = lexem.args[2];
		}
	},

	onDom($tag, lexem, olexem /* args = render, dif, remove */ , component) {
		const dif = lexem.args[1];
		lexem.$tag = $tag;
		if (dif)
			dif($tag, lexem, olexem, component);
	},

	html($tag, lexem, olexem) {
		const newHTML = lexem.args[0];
		lexem.witness = olexem.witness;
		if (olexem.args[0] !== newHTML) {
			$tag.innerHTML = '';
			$tag.appendChild(lexem.witness);
			domUtils.insertHTML(newHTML, $tag, lexem.witness);
		}
	},
	execute($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0] || !argsChanged(lexem.args[1], olexem.args[1]))
			return;
		lexem.args[0].apply(null, lexem.args[1]);
	},
	component($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0])
			throw new Error('You must not change component\'s class when rerendering');
		lexem.instance = olexem.instance;
		lexem.witness = olexem.witness;
		lexem.instance.setProps(lexem.args[1]);
	},
	switchUse($tag, lexem, olexem, component) {
		const val = lexem.args[0],
			args = lexem.args[1];
		lexem.witness = olexem.witness;
		if (val !== olexem.args[0]) {
			remove($tag, olexem.developed, component);
			lexem.developed = new bbl.FirstLevel()._use(val, ...args);
			const frag = document.createDocumentFragment();
			render($tag, lexem.developed, component, frag);
			$tag.insertBefore(frag, lexem.witness);
		} else if (argsChanged(args, olexem.args[1])) {
			lexem.developed = new bbl.FirstLevel()._use(val, ...args);
			dif($tag, lexem.developed, olexem.developed, component);
		} else
			lexem.developed = olexem.developed;
	}
};

function dif($tag, babelute, oldb, component) {
	for (let lexem, olexem, i = 0, len = babelute._lexems.length; i < len; ++i) {
		lexem = babelute._lexems[i];
		if (!_targets[lexem.lexicon])
			continue;
		olexem = oldb._lexems[i];
		if (!lexem.args.length) // wathever lexem is : no args implies never change, so keep old developed
			lexem.developed = olexem.developed;
		else {
			if (difActions[lexem.name]) // let strategy action do the job
				difActions[lexem.name]($tag, lexem, olexem, component);
			else if (argsChanged(lexem.args, olexem.args)) {
				// no action means compounds first degree lexem. so check args dif...
				lexem.developed = bbl.developOneLevel(lexem, _targets[lexem.lexicon]);
				dif($tag, lexem.developed, olexem.developed, component);
			} else // keep old developed (compounds args haven't changed : so nothing to do)
				lexem.developed = olexem.developed;
		}
	}
}

function argsChanged(args, oargs) {
	for (let i = 0, len = args.length; i < len; ++i)
		if (args[i] !== oargs[i]) // simple reference check : need "immutables"
			return true;
	return false;
}

export {
	dif,
	difActions,
	argsChanged
};

