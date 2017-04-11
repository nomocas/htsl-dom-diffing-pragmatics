# babelute-html-dom-diffing-pragmatics

Dom Diffing Engine for babelute-html-lexicon.

- __One of the lightest__ modern pure js html lib avaiable (around 4Ko gzipped with dependencies) 
- __One of the fastest DOM diffing engine__ (fastest than Mithril in chrome and firefox - several times faster than React)
- Immutables based comparison. 
- Algo that will show excellent behaviour when scalling. More components you have, more optimisation happend.
- Play really well with other libs (redux, immutables, jquery, ...).
- Simple and easy to understand algorithm. No more esoteric interpretation. You are the master.


Should be used in conjonction with [babelute-html-lexicon](https://github.com/nomocas/babelute-html-lexicon).

Write sentences with lexicon. Interpret them with this pragmatics.

## Usage


```javascript
import htmlLexicon from 'babelute-html-lexicon';
import differ from 'babelute-html-dom-diffing-lexicon';

const h = htmlLexicon.initializer();
function render(state) {
	return h.section(
		h.class('my-class')
		.h1(state.title)
		.div(h.id('my-id'), state.content)
		.button('fire !', h.click(state.handler))
	);
}

const $root = document.getElementById('...');
let oldBabelute,
	state = { title:'...', content:'...', handler:(e) => console.log('bouh', e) };
oldBabelute = render(state).$render($root); // first render

...

state = { title:'...', content:'...', handler:... };
oldBabelute = render(state).$render($root, oldBabelute); // dif

...

oldBabelute.$remove($root);  // remove

```

## Licence

The [MIT](http://opensource.org/licenses/MIT) License

Copyright 2017 (c) Gilles Coomans

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
