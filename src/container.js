/*
 * @Author: Gilles Coomans
 *
 * Simple stateless unmountable container.
 *
 * Useful for closable dialogs, or small widgets that don't need full state logic.
 */

import { render, renderActions } from './render';
import { dif, difActions } from './dif';
import { remove, removeActions, seekAndUnmountComponent } from './remove';

// lexem : .container((container) => h.div('click me to unmount !', h.click(container.unmount)))

renderActions.container = function($tag, lexem, component, frag) {
	const container = lexem.instance = {};
	container.unmount = (function() {
		seekAndUnmountComponent(this.developed); // depth-first
		remove($tag, this.developed, component);
	}).bind(container);
	container.developed = lexem.args[0](container);
	render($tag, container.developed, component, frag);
};

difActions.container = function($tag, lexem, olexem, component) {
	const container = lexem.instance = olexem.instance,
		developed = lexem.args[0](container);
	dif($tag, developed, container.developed, component);
	container.developed = developed;
};

removeActions.container = function($tag, lexem) {
	lexem.instance.unmount();
};

