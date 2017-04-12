# babelute-html-dom-diffing-pragmatics

[![Travis branch](https://img.shields.io/travis/nomocas/babelute-html-dom-diffing-pragmatics/master.svg)](https://travis-ci.org/nomocas/babelute-html-dom-diffing-pragmatics)
[![bitHound Overall Score](https://www.bithound.io/github/nomocas/babelute-html-dom-diffing-pragmatics/badges/score.svg)](https://www.bithound.io/github/nomocas/babelute-html-dom-diffing-pragmatics)
[![npm](https://img.shields.io/npm/v/babelute-html-dom-diffing-pragmatics.svg)]()
[![npm-downloads](https://img.shields.io/npm/dm/babelute-html-dom-diffing-pragmatics.svg)]()
[![licence](https://img.shields.io/npm/l/babelute-html-dom-diffing-pragmatics.svg)](https://spdx.org/licenses/MIT)
[![dependecies](https://img.shields.io/david/nomocas/babelute-html-dom-diffing-pragmatics.svg)]()
[![dev-dependencies](https://img.shields.io/david/dev/nomocas/babelute-html-dom-diffing-pragmatics.svg)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

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
```
> yarn i babelute babelute-html-lexicon babelute-html-dom-diffing-pragmatics
```


```javascript
import htmlLexicon from 'babelute-html-lexicon';
import 'babelute-html-dom-diffing-lexicon';

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
