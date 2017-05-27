[![Build Status](https://travis-ci.org/jcalfee/bip39-checker.svg?branch=master)](https://travis-ci.org/jcalfee/bip39-checker)
[![Coverage Status](https://coveralls.io/repos/github/jcalfee/bip39-checker/badge.svg?branch=master)](https://coveralls.io/github/jcalfee/bip39-checker?branch=master)

[NPM Package](https://www.npmjs.com/package/bip39-checker)

# BIP-0039 Checker

Normalize and spell check BIP-0039 brain seed phrases.

Interfaces may gather word suggestions from this package and use them for auto-complete or show them as suggestions for misspelled words (this could help a user recover their funds).

## API

```javascript
const assert = require('assert')
const {normalize, validSeed, suggest} = require('bip39-checker')

// Normalizes
assert.equal('double spaces', normalize('double  spaces'), 'removes extra spaces')
assert.equal('lowercase', normalize('Lowercase'), 'lowercase')
assert.equal('trim', normalize('  trim  '), 'trim')

const seed = 'ocean earn race rack swing odor yard manage illegal draw window desk'
assert(validSeed(seed, 'english').valid)

// Auto-correct suggestions
assert(suggest('quality') === true)
assert(suggest('ágil', {language: 'spanish'}) === true)
assert.equal(suggest('quality1')[0], 'quality')

// BIP-0039 dictionaries are exported
const {languages, wordlist} = require('bip39-checker')

console.log(languages)
assert(wordlist(languages[0]))

// Word list array for a given language
assert(wordlist('english').length, 2048)
assert(wordlist('spanish').length, 2048)
// etc.. (all languages must be 2048 words)
```
