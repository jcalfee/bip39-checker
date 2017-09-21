const LevensteinDistance = require('./levenstein_distance')
const bip39 = require('bip39')

module.exports = {
  normalize,
  suggest,
  languages: [
    'chinese_simplified',
    'chinese_traditional',
    'japanese',
    'english',
    'italian',
    'french',
    'spanish'
  ],
  wordlist: language => language ? wordlists[language] : wordlists,
  validSeed,
  assertValidSeed,
  checkWords,
  validWordlist,
  bip39
}

const wordlists = {
  chinese_simplified: require('bip39/wordlists/chinese_simplified'),
  chinese_traditional: require('bip39/wordlists/chinese_traditional'),
  english: require('bip39/wordlists/english.json'),
  french: require('bip39/wordlists/french.json'),
  italian: require('bip39/wordlists/italian.json'),
  japanese: require('bip39/wordlists/japanese.json'),
  spanish: require('bip39/wordlists/spanish.json')
}

/**
  @summary Character cleansing: printable characters, all lowercase, trim.

  @description Filter and remove invalid characters or extraneous spaces from BIP-0039 word phrases. Future implementation can assume that this method will not change any word in the language files (@see index.test.js).

  @retrun {string} normalized seed
*/
function normalize (seed) {
  if (typeof seed !== 'string') {
    throw new TypeError('seed string required')
  }

  // TODO? use unorm module until String.prototype.normalize gets better browser support
  seed = seed.normalize('NFKD')// Normalization Form: Compatibility Decomposition
  seed = seed.replace(/\s+/g, ' ') // Remove multiple spaces in a row
  seed = seed.toLowerCase()
  seed = seed.trim()
  return seed
}

const vowelRe = /[aeiou]/g
const novowels = word => word.replace(vowelRe, '')

/**
  Find the best matching word or words in the list.

  @return {Array|boolean} 0 or more suggestions, true when perfect match
*/
function suggest (word = '', {maxSuggestions = 15, language = 'english'} = {}) {
  word = word.trim().toLowerCase()
  const nword = normalize(word)
  const wordlist = validWordlist(language)

  if (word === '') { return [] }

  // Words that begin the same, also handles perfect match
  let match = false
  const matches = wordlist.reduce((arr, w) => {
    if (w === word || match) {
      match = true
      return
    }
    if (w.indexOf(nword) === 0 && arr.length < 10) { arr.push(w) }

    return arr
  }, [])
  if (match) {
    return true
  }

  // Levenshtein distance
  if (!/chinese/.test(language)) {
    const levenstein = LevensteinDistance(wordlist)
    const lwords = levenstein(nword, {threshold: 0.5, language})
    lwords.forEach(w => { matches.push(w) })
  }

  if (language === 'english') {
    // Vowels are almost useless
    const nvword = novowels(nword)
    if (nvword !== '') {
      wordlist.reduce((arr, w) => {
        const score = novowels(w).indexOf(nvword)
        if (score !== -1) { arr.push([score, w]) }
        return arr
      }, [])
      .sort((a, b) => Math.sign(a[0], b[0]))
      .map(a => a[1])
      .forEach(w => { matches.push(w) })
    }
  }

  const dedupe = {}
  const finalMatches = matches.filter(item =>
    dedupe[item] ? false : dedupe[item] = true
  )

  // console.log('suggest finalMatches', word, finalMatches)
  return finalMatches.slice(0, maxSuggestions)
}

/**
    @typedef {object} Validity
    @property {boolean} Validity.valid
    @property {string} Validity.error
*/
/**
    User interfaces should check the seed after data entry.  When a checksum is invalid, warn the user and ask if they would like to use it anyway.  This way you can still use phrases created in new future languages.

    @arg {string} mnemonicSeed
    @arg {string} [language = 'english']

    @example assert(seeder.validSeed(mnemonicSeed))
    @return {Validity}
*/
function validSeed (mnemonicSeed, language = 'english') {
  try {
    mnemonicSeed = normalize(mnemonicSeed)
    assertValidSeed(mnemonicSeed, language)
    return {
      valid: true,
      error: null
    }
  } catch (err) {
    return {
      valid: false,
      error: err.message
    }
  }
}

/**
    Like validSeed, except an Error will be thrown if the seed is invalid.

    @throws {Error} 'Invalid mnemonic seed(...)'
*/
function assertValidSeed (mnemonicSeed, language = 'english') {
  if (!checkWords(mnemonicSeed, language)) {
    throw new Error('Invalid mnemonic seed')
  }
  const wordlist = validWordlist(language)
  if (!bip39.validateMnemonic(mnemonicSeed, wordlist)) {
    const words = mnemonicSeed.split(' ').length
    // user forgot to quote command line arg
    const shortStr = words < 11 ? `.  Mnemonic seeds are usually 12 words or more but this seed is only ${words} words.` : ''
    throw new Error(`Invalid mnemonic seed checksum${shortStr}`)
  }
}

/**
  @arg {string} seed - single word or combination of words from the wordlist
  @arg {string} [language = 'english'] - Language dictionary to test seed against

  @return {boolean} true if seed contains no words or all valid words
  @throws {Error} 'Missing wordlist for ${language}'
*/
function checkWords (seed = '', language = 'english') {
  const words = seed.split(' ')
  const wordlist = validWordlist(language)
  let word
  while ((word = words.pop()) != null) {
    const idx = wordlist.findIndex(w => w === word)
    if (idx === -1) {
      return false
    }
  }
  return true
}

/**
  @throws {Error} 'Missing wordlist for ${language}'
*/
function validWordlist (language) {
  const wordlist = wordlists[language]
  if (!wordlist) {
    throw new Error(`Missing wordlist for language ${language}`)
  }
  return wordlist
}
