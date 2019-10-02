
const express = require('express')
const app = express()
require('dotenv').config()

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const cors = require('cors')
app.use(cors())

const morgan = require('morgan')

morgan.token('body', (req) => { return JSON.stringify(req.body) })

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

const Person = require('./models/person')

app.use(express.static('build'))

app.get('/', (req, res) => {
  res.send('<h1>Phonebook App</h1>')
})

app.get('/info', (req, res) => {
  const date = new Date()
  Person.find({}).then(persons =>
  {
    res.send(`Phonebook has info for ${persons.length} people <br/>${date}`)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

// const generateId = () => { return Math.floor(Math.random() * 1000) }

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  /*
  if (!body.name || body.name === "") {
    return res.status(400).json({
      error: 'name is missing'
    })
  }

  if (!body.number || body.number === "") {
    return res.status(400).json({
      error: 'number is missing'
    })
  }

  /*
  const existingPerson = persons.find(o => o.name === body.name)

  if(typeof existingPerson !== 'undefined') {
    return res.status(400).json({
      error: 'that person exists in the phonebook'
    })
  }
  */

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
    .catch(error => next(error))

  /*
  const person = {
    name: body.name,
    number: body.number || 0,
    id: generateId()
  }

  persons = persons.concat(person)
  res.json(person)
  */
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})