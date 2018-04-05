const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const Blockchain = require('./blockchain')

const { getBlockchain, createNewBlock } = Blockchain

const PORT = 3000

const app = express()
app.use(bodyParser.json())
app.use(morgan('combine'))
app.listen(PORT, () => console.log(`GomCoin SERVER running on ${PORT}`))