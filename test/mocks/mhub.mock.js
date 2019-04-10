'use strict'

const chai = require('chai')
const spies = require('chai-spies')
const Promise = require('bluebird')

chai.use(spies)

const mclient = {
  listeners: [],
  connect: () => Promise.resolve(),
  subscribe: () => Promise.resolve(),
  publish: () => Promise.resolve(),
  login: () => Promise.resolve(),
  on: (event, handler) => { mclient.listeners.push({ event, handler }) },
  emit: (event, data) => {
    mclient.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => listener.handler(data))
  }
}

const mclientSandbox = chai.spy.sandbox()
mclientSandbox.on(mclient, ['connect', 'subscribe', 'publish', 'login', 'on'])

exports.mclient = mclient

exports.MHubMock = {
  MClient: function MClient () {
    return mclient
  }
}
