
they = require 'ssh2-they'
conditions = require '../../src/misc/conditions'

describe 'if', ->

  # they 'should bypass if not present', (ssh, next) ->
  #   conditions.if
  #     ssh: ssh
  #     () -> false.should.be.true()
  #     next

  they 'should succeed if `true`', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: true
      () -> false.should.be.true()
      next

  they 'should succeed if `1`', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: 1
      () -> false.should.be.true()
      next

  they 'should fail if `false`', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: false
      next
      () -> false.should.be.true()

  they 'should fail if `null`', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: null
      next
      () -> false.should.be.true()

  they 'should fail if `undefined`', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: undefined
      next
      () -> false.should.be.true()

  they 'should succeed if string not empty', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: 'abc'
      () -> false.should.be.true()
      next

  they 'should succeed if template string not empty', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: '{{db.test}}'
      db: test: 'abc'
      () -> false.should.be.true()
      next

  they 'should fail if string empty', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: ''
      next
      () -> false.should.be.true()

  they 'should fail if template string empty', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: '{{db.test}}'
      db: test: ''
      next
      () -> false.should.be.true()

  they 'should succeed on `succeed` sync callback 0 arguments', (ssh, next) ->
    called = true
    conditions.if
      ssh: ssh
      if: -> true
      (err) -> false.should.be.true()
      ->
        called.should.be.true()
        next()

  they 'should succeed on `succeed` sync callback 1 arguments', (ssh, next) ->
    called = true
    conditions.if
      ssh: ssh
      if: (options) -> true
      (err) -> false.should.be.true()
      ->
        called.should.be.true()
        next()

  they 'should fail on `failed` sync callback', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: (options) -> false
      next
      () -> false.should.be.true()

  they 'should succeed on `succeed` async callback', (ssh, next) ->
    called = true
    conditions.if
      ssh: ssh
      if: (options, calback) -> calback null, true
      (err) -> false.should.be.true()
      ->
        called.should.be.true()
        next()

  they 'should fail on `failed` callback', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: (options, callback) -> callback null, false
      next
      () -> false.should.be.true()

  they 'should pass error object on `failed` callback', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: (options, callback) -> callback new Error 'cool'
      (err) -> err.message is 'cool' and next()
      () -> false.should.be.true()

  they 'call callback with single argument', (ssh, next) ->
    conditions.if
      ssh: ssh
      if: (options, callback) -> callback new Error 'cool'
      (err) -> err.message is 'cool' and next()
      () -> false.should.be.true()

describe 'not_if', ->

  # they 'should bypass if not present', (ssh, next) ->
  #   conditions.not_if
  #     ssh: ssh
  #     () -> false.should.be.true()
  #     next

  they 'should succeed if `true`', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: true
      next
      () -> false.should.be.true()

  they 'should skip if all true', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: [true, true, true]
      next
      () -> false.should.be.true()

  they 'should skip if at least one is true', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: [false, true, false]
      next
      () -> false.should.be.true()

  they 'should run if all false', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: [false, false, false]
      () -> false.should.be.true()
      next

  they 'should succeed if `1`', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: 1
      next
      () -> false.should.be.true()

  they 'should fail if `false`', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: false
      () -> false.should.be.true()
      next

  they 'should fail if `null`', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: null
      () -> false.should.be.true()
      next

  they 'should fail if string not empty', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: 'abc'
      next
      () -> false.should.be.true()

  they 'should fail if string not empty', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: ''
      () -> false.should.be.true()
      next

  they 'function succeed on `succeed` callback', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: (options, callback) -> callback null, true
      next
      () -> false.should.be.true()

  they 'function fail on `failed` callback', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: (options, callback) -> callback null, false
      () -> false.should.be.true()
      next

  they 'function pass error object on `failed` callback', (ssh, next) ->
    conditions.not_if
      ssh: ssh
      not_if: (options, callback) -> callback new Error 'cool'
      (err) -> err.message is 'cool' and next()
      () -> false.should.be.true()