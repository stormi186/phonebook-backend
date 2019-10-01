
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())

app.use(bodyParser.json())

app.use(express.static('build'))

morgan.token('body', (req, res) => { return JSON.stringify(req.body) })

var loggerFormat = ':method :url :status :res[content-length] - :response-time ms :body'

app.use(morgan(loggerFormat, {
  skip: (req, res) => {
      return res.statusCode < 400
  },
  stream: process.stderr
}))

app.use(morgan(loggerFormat, {
  skip: (req, res) => {
      return res.statusCode >= 400
  },
  stream: process.stdout
}))

let persons = [
  { 
    "name": "Arto Hellas", 
    "number": "040-123456",
    "id": 1
  },
  { 
    "name": "Ada Lovelace", 
    "number": "39-44-5323523",
    "id": 2
  },
  { 
    "name": "Dan Abramov", 
    "number": "12-43-234345",
    "id": 3
  },
  { 
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122",
    "id": 4
  }
]

app.get('/', (req, res) => {
  res.send('<h1>Phonebook App</h1>')
})

const getTotal = () => { return persons.length }

app.get('/info', (req, res) => {
  const date = new Date()
  const total = getTotal()
  res.send(`Phonebook has info for ${total} people ` +'<br/>' + `${date}`)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

const generateId = () => { return Math.floor(Math.random() * 1000) }

app.post('/api/persons', (req, res) => {
  const body = req.body

  console.log(body)

  if (!body.name) {
    return res.status(400).json({ 
      error: 'name is missing' 
    })
  }

  if (!body.number) {
    return res.status(400).json({ 
      error: 'number is missing' 
    })
  }

  const existingPerson = persons.find(o => o.name === body.name)

  if(typeof existingPerson !== 'undefined') {
    return res.status(400).json({ 
      error: 'that person exists in the phonebook' 
    })
  }

  const person = {
    name: body.name,
    number: body.number || 0,
    id: generateId()
  }

  persons = persons.concat(person)
  console.log(persons)
  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})