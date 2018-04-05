const CryptoJs = require('crypto-js')

class Block {
  constructor(index, hash, previousHash, timestamp, data) {
    this.index = index
    this.hash = hash
    this.previousHash = previousHash
    this.timestamp = timestamp
    this.data = data
  }
}

const genesisBlock = new Block(
  0,
  '0639583E515B3ECE06CBCBC53DFD2D7937B1AD7138818A1F752EE9CBFD086477',
  null,
  1522849813902,
  'This is genesis Block.'
)

let blockchain = [genesisBlock]

const getLastBlock = () => blockchain[blockchain.length-1]

const getTimestamp = () => new Date().getDate() / 1000

const getBlockchain = () => blockchain

const createHash = (index, previousHash, timestamp, data) => 
  CryptoJs.SHA256(
    index + previousHash + timestamp + JSON.stringify(data)
  ).toString()

const createNewBlock = data => {
  const previousBlock = getLastBlock()
  const newBlockIndex = previousBlock.index + 1
  const newTimestamp = getTimestamp()
  const newHash = createHash(newBlockIndex, previousBlock.hash, newTimestamp, data)
  
  return new Block(newBlockIndex, newHash, previousBlock.hash, newTimestamp, data)
}

const getBlockHash = (block) => createHash(block.index, block.previousHash, block.timestamp, block.data)

const isNewBlockValid = (candidateBlock, latestBlock) => {
  if (!isNewStructureValid(candidateBlock)) {
    console.error('[isNewBlockValid] The structure of candidate block is invalid.')
    return false
  }
  else if (latestBlock.index !== candidateBlock.index) {
    console.error('[isNewBlockValid] The index of candidate block is invalid.')
    return false
  }
  else if (latestBlock.hash !== candidateBlock.previousHash) {
    console.error('[isNewBlockValid] The previousHash of the candidate blcok is invalid.')
    return false
  }
  else if (getBlockHash(candidateBlock) !== candidateBlock.hash) {
    console.error('[isNewBlockValid] The hash of the candidate blcok is invalid.')
    return false
  }
  return true
}

const isNewStructureValid = (block) => {
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
    if (!isNewBlockValid(candidateChain[i], candidateChain[i-1])) {
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
  if (isNewBlockValid(candidateBlock, getLastBlock())) {
    getBlockchain().push(candidateBlock)
    return true
  } else {
    return false
  }
}

