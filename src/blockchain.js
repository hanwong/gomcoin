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

const createHash = (index, previousHash, timestamp, data) => 
  CryptoJs.SHA256(index + previousHash + timestamp + data).toString()

const createNewBlock = data => {
  const previousBlock = getLastBlock()
  const newBlockIndex = previousBlock.index + 1
  const newTimestamp = getTimestamp()
  const newHash = createHash(newBlockIndex, previousBlock.hash, newTimestamp, data)
  
  return new Block(newBlockIndex, newHash, previousBlock.hash, newTimestamp, data)
}

const getBlockHash = (block) => createHash(block.index, block.previousHash, block.timestamp, block.data)

const isNewBlockValid = (candidateBlock, latestBlock) => {
  if (latestBlock.index !== candidateBlock.index) {
    return new Error('The index of candidate block is invalid.')
  }
  else if (latestBlock.hash !== candidateBlock.previousHash) {
    return new Error('The previousHash of the candidate blcok is invalid.')
  }
  else if (getBlockHash(candidateBlock) !== candidateBlock.hash) {
    return new Error('The hash of the candidate blcok is invalid.')
  }
  else {
    return true
  }
}