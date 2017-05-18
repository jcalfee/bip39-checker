/* eslint-env mocha */
const assert = require('assert')
const LevensteinDistance = require('./src/levenstein_distance')
const {suggest, wordlist, languages, checkWords, validWordlist, normalize} = require('.')

describe('Seed', () => {
  it('Normalize', () => {
    throws(() => normalize(), /^seed string required$/)
    // Update README if these change:
    assert.equal('double spaces', normalize('double  spaces'), 'removes extra spaces')
    assert.equal('lowercase', normalize('Lowercase'), 'lowercase')
    assert.equal('trim', normalize('  trim  '), 'trim')
  })

  it('Suggests', () => {
    assert(suggest('quality') === true)
    assert(suggest('ágil', {language: 'spanish'}) === true)
    assert.equal(suggest('quality1')[0], 'quality')
    assert(suggest('').length === 0)
    assert(suggest('qua').length > 0)
    assert(suggest('seeder').length > 0)
    assert(suggest('aeiou').length === 0)
    assert(suggest('qlty').length === 1)
    LevensteinDistance.distance('', '')
  })

  it('Length', () => {
    for (let lang of languages) {
      assertLen(wordlist(lang))
    }
  })

  it('Check Words', () => {
    assert(checkWords('lazy dog', 'english'))
    assert(!checkWords('lazy dogma', 'english'))
    throws(() => validWordlist('pig_latin'), /^Missing wordlist for language pig_latin$/)
    for (let lang of languages) {
      assertNormalized(lang)
    }
  })
})

const assertNormalized = lang => {
  for (let word of wordlist(lang)) {
    assert(word === normalize(word), `word ${word} in wordlist ${lang} did not normalize`)
  }
}
const assertLen = wordlist => {
  assert.equal(2048, wordlist.length, `Expecting 2048 words, got ${wordlist.length}`)
}

/* istanbul ignore next */
function throws (fn, match) {
  try {
    fn()
    assert(false, 'Expecting error')
  } catch (error) {
    if (!match.test(error.message)) {
      error.message = `Error did not match ${match}\n${error.message}`
      throw error
    }
  }
}
try {
  throws(() => { throw '1' }, /2/)
} catch (err) {
  // for code-coverage
}
