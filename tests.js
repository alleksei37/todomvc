import chai from 'chai'
import mocha from 'mocha'

import TodoMVC from './index'
// Fix: why do I need to do this?
const microstate = require('microstates').default

const { freeze } = Object
const { expect } = chai
const { describe, it } = mocha

let todoOne = freeze({ id: 1, text: 'Make initial commit', completed: false })
let todoTwo = freeze({ id: 2, text: 'Write readme', completed: false })
let todoThree = freeze({ id: 3, text: 'Release microstates', completed: false })
let value = freeze({
  todos: freeze([todoOne, todoTwo, todoThree]),
})
let empty = microstate(TodoMVC)
let filled = microstate(TodoMVC, value)
let someCompleted = microstate(TodoMVC, {
  todos: [todoOne, freeze({ id: 2, text: 'Write readme', completed: true }), todoThree],
})

describe('TodoMVC', function() {
  describe('state', function() {
    describe('todos', function() {
      it('is empty array when todos are not provided', function() {
        expect(empty.state.todos).to.deep.equal([])
      })
      it('has todo items when filled', function() {
        expect(filled.state.todos).to.deep.equal([todoOne, todoTwo, todoThree])
      })
    })
    describe('completedCount', function() {
      it('is empty when no todos are present', function() {
        expect(empty.state.completedCount).to.equal(0)
      })
      it('is 1 when 1 item is complete', function() {
        expect(someCompleted.state.completedCount).to.equal(1)
      })
    })
    describe('nextId', function() {
      it('is 1 when no todos are present', function() {
        expect(empty.state.nextId).to.equal(1)
      })
      it('caclulates next id when todos are present', function() {
        expect(filled.state.nextId).to.equal(4)
      })
    })
    describe('remainingCount', function() {
      it('is 0 when no todos are present', function() {
        expect(empty.state.remainingCount).to.equal(0)
      })
      it('is 2 two when 1 out of 3 items are completed', function() {
        expect(someCompleted.state.remainingCount).to.equal(2)
      })
    })
  })

  describe('transitions', function() {
    it('completes todo with completeTodo', function() {
      let { todos } = microstate(TodoMVC, value)
        .completeTodo(todoOne)
        .valueOf()
      expect(todos).to.deep.equal([
        { id: 1, text: 'Make initial commit', completed: true },
        { id: 2, text: 'Write readme', completed: false },
        { id: 3, text: 'Release microstates', completed: false },
      ])
    })
    it('edits todo with editTodo', function() {
      let { todos } = microstate(TodoMVC, value)
        .editTodo(todoTwo, 'Write README')
        .valueOf()
      expect(todos).to.deep.equal([
        { id: 1, text: 'Make initial commit', completed: false },
        { id: 2, text: 'Write README', completed: false },
        { id: 3, text: 'Release microstates', completed: false },
      ])
    })
    it('deletes todo with deleteTodo', function() {
      let { todos } = microstate(TodoMVC, value)
        .deleteTodo(todoThree)
        .valueOf()
      expect(todos).to.deep.equal([
        { id: 1, text: 'Make initial commit', completed: false },
        { id: 2, text: 'Write readme', completed: false },
      ])
    })
    it('adds todo with addTodo', function() {
      let { todos } = microstate(TodoMVC, value)
        .addTodo('Write tests')
        .valueOf()
      expect(todos).to.deep.equal([
        { id: 1, text: 'Make initial commit', completed: false },
        { id: 2, text: 'Write readme', completed: false },
        { id: 3, text: 'Release microstates', completed: false },
        { id: 4, text: 'Write tests', completed: false },
      ])
    })
    it('clears completed with clearCompleted', function() {
      let { todos } = microstate(TodoMVC, {
        todos: [todoOne, freeze({ id: 2, text: 'Write readme', completed: true }), todoThree],
      })
        .clearCompleted()
        .valueOf()
      expect(todos).to.deep.equal([todoOne, todoThree])
    })
  })
})
