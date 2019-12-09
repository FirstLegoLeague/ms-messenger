const chai = require('chai')
const spies = require('chai-spies')

chai.use(spies)

let loginSpy
let loggerDebugSpy

const { authenticateMesseger } = require('../../lib/authentication')

const logger = {
  debug: function () {
    return loggerDebugSpy.apply(this, arguments)
  }
}

const expect = chai.expect

describe('authentication', () => {
  let messenger

  beforeEach(() => {
    messenger = {
      client: {
        login: function () {
          return loginSpy.apply(this, arguments)
        }
      },
      options: {
        credentials: {
          username: 'USERNAME',
          password: 'PASSWORD'
        }
      },
      _connectionPostactions: []
    }

    loginSpy = chai.spy(() => { })
    loggerDebugSpy = chai.spy(() => { })
  })

  it('adds one actions to connectionPostactions if there is no logger', () => {
    authenticateMesseger(messenger)
    expect(messenger._connectionPostactions.length).to.equal(1)
  })

  it('adds a login action to connectionPostactions if there is no logger', () => {
    authenticateMesseger(messenger)
    messenger._connectionPostactions[0]()
    expect(loginSpy).to.have.been.called.with(messenger.options.credentials.username, messenger.options.credentials.password)
  })

  it('adds two actions to connectionPostactions if there is a logger', () => {
    Object.assign(messenger, { logger })
    authenticateMesseger(messenger)
    expect(messenger._connectionPostactions.length).to.equal(2)
  })

  it('adds a login action to connectionPostactions if there is no logger', () => {
    Object.assign(messenger, { logger })
    authenticateMesseger(messenger)
    messenger._connectionPostactions[0]()
    expect(loginSpy).to.have.been.called.with(messenger.options.credentials.username, messenger.options.credentials.password)
  })

  it('adds a log action to connectionPostactions if there is a logger', () => {
    Object.assign(messenger, { logger })
    authenticateMesseger(messenger)
    messenger._connectionPostactions[1]()
    expect(loggerDebugSpy).to.have.been.called.with('Logged into MHub')
  })
})
