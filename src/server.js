const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const Blockchain = require('./blockchain')
const P2P = require('./p2p')

const { getBlockchain, createNewBlock } = Blockchain
const { startP2PServer } = P2P

const PORT = process.env.HTTP_PORT || 3000

const app = express()
app.use(bodyParser.json())
app.use(morgan('combine'))

app.get('/blocks', (req, res) => {
  res.send(getBlockchain())
})

app.post('/blocks', (req, res) => {
  const { body : {data} } = req
  const newBlock = createNewBlock(data)
  res.send(newBlock)
})

const server = app.listen(PORT, () => console.log(`GomCoin HTTP SERVER running on port ${PORT}`))

startP2PServer(server)