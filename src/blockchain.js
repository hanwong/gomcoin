const CryptoJs = require('crypto-js')
const hexToBinary = require('hex-to-binary')

class Block {
  constructor(index, hash, previousHash, timestamp, data, difficulty, nonce) {
    this.index = index
    this.hash = hash
    this.previousHash = previousHash
    this.timestamp = timestamp
    this.data = data
    this.difficulty = difficulty
    this.nonce = nonce
  }
}

const genesisBlock = new Block(
  0,
  '0639583E515B3ECE06CBCBC53DFD2D7937B1AD7138818A1F752EE9CBFD086477',
  null,
  1522849813902,
  'This is genesis Block.',
  0,
  0
)

let blockchain = [genesisBlock]

const getBlockchain = () => blockchain
const getNewestBlock = () => blockchain[blockchain.length-1]
const getTimestamp = () => new Date().getTime() / 1000

const createHash = (index, previousHash, timestamp, data, difficulty, nonce) => 
  CryptoJs.SHA256(
    index + previousHash + timestamp + JSON.stringify(data) + difficulty + nonce
  ).toString()

const createNewBlock = data => {
  const previousBlock = getNewestBlock()
  const newBlockIndex = previousBlock.index + 1
  const newTimestamp = getTimestamp()
  
  const newBlock = findBlock(
    newBlockIndex,
    previousBlock.hash,
    newTimestamp,
    data,
    20
  )
  addBlockToChain(newBlock)
  require('./p2p').broadcastNewBlock()
  return newBlock
}

const findBlock = (index, previousHash, timestamp, data, difficulty) => {
  let nonce = 0
  while (true) {
    const hash = createHash(index, previousHash, timestamp, data, difficulty, nonce)
    if (hashMatchesDifficulty(hash, difficulty)) {
      return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce)
    } 
    nonce++
  }
}

const hashMatchesDifficulty = (hash, difficulty) => {
  const hashInBinary = hexToBinary(hash)
  const requiredZeros = '0'.repeat(difficulty)
  // console.log('Trying Difficulty: ', difficulty, ' with Hash ', hashInBinary)
  return hashInBinary.startsWith(requiredZeros)
}

const getBlockHash = (block) => createHash (
  block.index,
  block.previousHash,
  block.timestamp,
  block.data,
  block.difficulty,
  block.nonce
)

const isBlockValid = (candidateBlock, latestBlock) => {
  if (!isBlockStructureValid(candidateBlock)) {
    console.error('[isBlockValid] The structure of candidate block is invalid.')
    return false
  }
  else if (latestBlock.index + 1 !== candidateBlock.index) {
    console.error('[isBlockValid] The index of candidate block is invalid.')
    return false
  }
  else if (latestBlock.hash !== candidateBlock.previousHash) {
    console.error('[isBlockValid] The previousHash of the candidate blcok is invalid.')
    return false
  }
  else if (getBlockHash(candidateBlock) !== candidateBlock.hash) {
    console.error('[isBlockValid] The hash of the candidate blcok is invalid.')
    return false
  }
  return true
}

const isBlockStructureValid = (block) => {
  return (
    typeof block.index === 'number' &&
    typeof block.hash === 'string' &&
    typeof block.previousHash === 'string' &&
    typeof block.timestamp === 'number' &&
    typeof block.data === 'string'
  )
}

const isChainValid = (candidateChain) => {
  const isGenesisValid = block => {
    return JSON.stringify(block) === JSON.stringify(genesisBlock)
  }
  if (!isGenesisValid(candidateChain[0])) {
    console.error('[isChainValid] The genesisBlock of the candidate chain is invalid.')
    return false
  }
  for (let i=1 ; i < candidateChain.length ; i++) {
    if (!isBlockValid(candidateChain[i], candidateChain[i-1])) {
      console.error('[isChainValid] The candidate chain has invalid block.')
      return false
    }
  }
  return true
}

const replaceChain = candidateChain => {
  if (isChainValid(candidateChain) && candidateChain.length > getBlockchain().length) {
    blockchain = candidateChain
    return true
  } else {
    return false
  }
}

const addBlockToChain = candidateBlock => {
  if (isBlockValid(candidateBlock, getNewestBlock())) {
    getBlockchain().push(candidateBlock)
    return true
  } else {
    return false
  }
}

module.exports = {
  getNewestBlock,
  getBlockchain,
  createNewBlock,
  addBlockToChain,
  replaceChain,
  isBlockStructureValid
}