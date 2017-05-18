[![Build Status](https://travis-ci.org/jcalfee/bip39-checker.svg?branch=master)](https://travis-ci.org/jcalfee/bip39-checker)
[![Coverage Status](https://coveralls.io/repos/github/jcalfee/bip39-checker/badge.svg?branch=master)](https://coveralls.io/github/jcalfee/bip39-checker?branch=master)

# BIP-0039 Checker

Normalize and spell check BIP-0039 brain seed phrases.

Interfaces may gather word suggestions from this package and use them for auto-complete or show them as suggestions for misspelled words (this could help a user recover their funds).

## API

```javascript
const assert = require('assert')
const {normalize, checkWords, suggest} = require('bip39-checker')

// Normalizes
assert.equal('double spaces', normalize('double  spaces'), 'removes extra spaces')
assert.equal('lowercase', normalize('Lowercase'), 'lowercase')
assert.equal('trim', normalize('  trim  '), 'trim')

// Checks each word in the seed
assert(checkWords('lazy dog', 'english'))
assert(!checkWords('lazy ogday', 'english'))

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
