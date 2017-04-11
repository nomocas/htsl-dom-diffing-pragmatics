/*
 * @Author: Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 */

import { render, renderActions } from './render';
import { dif, difActions } from './dif';
import { remove, removeActions, seekAndUnmountComponent } from './remove';

// lexem : .component(Component, props)

renderActions.component = function($tag, lexem, parent, frag) {
	const instance = lexem.instance = new(lexem.args[0])(lexem.args[1], parent);
	mountComponentInstance($tag, instance, true, frag);
};

difActions.component = function($tag, lexem, olexem) {
	if (lexem.args[0] !== olexem.args[0])
		throw new Error('You must not change component\'s class when rerendering');
	lexem.instance = olexem.instance;
	if (lexem.args[1])
		lexem.instance.setProps(lexem.args[1]);
};

removeActions.component = function($tag, lexem) {
	lexem.instance.unmount();
	$tag.removeChild(lexem.instance.witness);
};

function mountComponentInstance($tag, instance, addWitness, frag) {
	instance._render = function() {
		// update
		const developed = this.render(true);
		if (this.developed)
			dif($tag, developed, this.developed, this);
		else
			render($tag, developed, this);
		this.developed = developed;
	};

	instance._remove = function() {
		// unmount
		seekAndUnmountComponent(this.developed); // depth-first
		remove($tag, this.developed, instance);
	};

	// first render (mounting)
	instance.componentWillMount();
	instance.developed = instance.render(true);
	render($tag, instance.developed, instance, frag);
	if (addWitness) {
		instance.witness = document.createComment('component');
		$tag.appendChild(instance.witness);
	}
	instance.componentDidMount();
}

export { mountComponentInstance };

