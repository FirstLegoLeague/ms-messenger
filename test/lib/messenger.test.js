const chai = require('chai')
const spies = require('chai-spies')
const Promise = require('bluebird')

chai.use(spies)

const TOPIC = 'TOPIC'
const SUBSCRIBE_RESULT = 'SUBSCRIBE_RESULT'
const CALLBACK_RESULT = 'CALLBACK_RESULT'
const DATA = 'DATA'
const PUBLISH_RESULT = 'PUBLISH_RESULT'
const CONNECT_RESULT = 'CONNECT_RESULT'

const { Messenger } = require('../../lib/messenger')

const expect = chai.expect

describe('messenger class', () => {
  let mclient, options, listenCallback

  beforeEach(() => {
    mclient = {
      on: chai.spy((topic, callback) => { mclient._listeners['message'] = callback }),
      subscribe: chai.spy(() => SUBSCRIBE_RESULT),
      publish: chai.spy(() => PUBLISH_RESULT),
      connect: chai.spy(() => Promise.resolve(CONNECT_RESULT)),
      _listeners: { }
    }
    options = {
      node: 'node',
      promise: Promise
    }
    listenCallback = chai.spy(() => CALLBACK_RESULT)
  })

  it('saves the mhub client, options and promise in fields', () => {
    const messenger = new Messenger(mclient, options)
    expect(messenger.client).to.equal(mclient)
    expect(messenger.options).to.equal(options)
    expect(messenger.Promise).to.equal(options.promise)
  })

  it('has actions for each action the messenger can do', () => {
    const messenger = new Messenger(mclient, options)
    expect(messenger._handlingFilters).to.be.instanceof(Array)

    expect(messenger._connectionPreactions).to.be.instanceof(Array)
    expect(messenger._listenPreactions).to.be.instanceof(Array)
    expect(messenger._sendPreactions).to.be.instanceof(Array)

    expect(messenger._connectionPostactions).to.be.instanceof(Array)
    expect(messenger._listenPostactions).to.be.instanceof(Array)
    expect(messenger._sendPostactions).to.be.instanceof(Array)

    expect(messenger._connectionErroractions).to.be.instanceof(Array)
    expect(messenger._sendErroractions).to.be.instanceof(Array)
  })

  it('has an array of header providers', () => {
    const messenger = new Messenger(mclient, options)
    expect(messenger._headersProviders).to.be.instanceof(Array)
  })

  it('has a default handling filter for TOPIC matching', () => {
    const anotherTOPIC = 'another TOPIC'
    const messenger = new Messenger(mclient, options)
    expect(messenger._handlingFilters[0]({ topic: TOPIC }, TOPIC)).to.equal(true)
    expect(messenger._handlingFilters[0]({ topic: TOPIC }, anotherTOPIC)).to.equal(false)
  })

  it('listen calls listen preactions', () => {
    const listenPreaction = chai.spy(() => { })
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    messenger._listenPreactions.push(listenPreaction)
    messenger.listen(TOPIC, listenCallback)
    expect(listenPreaction).to.have.been.called.with(TOPIC, listenCallback, messenger)
  })

  it('listen calls messenger.connect', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = chai.spy(() => Promise.resolve())
    messenger.listen(TOPIC, () => { })
    expect(messenger.connect).to.have.been.called()
  })

  it('listen calls messenger.client.subscribe if connect is reolved', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = chai.spy(() => Promise.resolve())
    return messenger.listen(TOPIC, () => { }).then(() => {
      expect(messenger.client.subscribe).to.have.been.called.with(messenger.options.node, TOPIC)
    })
  })

  it('listen does not call messenger.client.subscribe if connect is rejected', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = chai.spy(() => Promise.reject(new Error('err')))
    return messenger.listen(TOPIC, () => { }).catch(() => { }).then(() => {
      expect(messenger.client.subscribe).to.not.have.been.called()
    })
  })

  it('listen calls listen postactions', () => {
    const listenPostaction = chai.spy(() => { })
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    messenger._listenPostactions.push(listenPostaction)
    return messenger.listen(TOPIC, listenCallback).then(() => {
      expect(listenPostaction).to.have.been.called.with(SUBSCRIBE_RESULT, TOPIC, listenCallback, messenger)
    })
  })

  it('listen returned promise is resolved with the result of messenger.client.subscribe if there are no postactions', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    return messenger.listen(TOPIC, listenCallback).then(result => {
      expect(result).to.equal(SUBSCRIBE_RESULT)
    })
  })

  it('listen returned promise is resolved with the result of the last postaction if there is a postaction', () => {
    const FIRST_POSTACTION_RESULT = 'FIRST_POSTACTION_RESULT'
    const SECOND_POSTACTION_RESULT = 'SECOND_POSTACTION_RESULT'
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    messenger._listenPostactions.push(() => FIRST_POSTACTION_RESULT)
    messenger._listenPostactions.push(() => SECOND_POSTACTION_RESULT)
    return messenger.listen(TOPIC, listenCallback).then(result => {
      expect(result).to.equal(SECOND_POSTACTION_RESULT)
    })
  })

  it('on calls listen preactions', () => {
    const listenPreaction = chai.spy(() => { })
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    messenger._listenPreactions.push(listenPreaction)
    messenger.on(TOPIC, listenCallback)
    expect(listenPreaction).to.have.been.called.with(TOPIC, listenCallback, messenger)
  })

  it('on calls messenger.connect', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = chai.spy(() => Promise.resolve())
    messenger.on(TOPIC, () => { })
    expect(messenger.connect).to.have.been.called()
  })

  it('on calls messenger.client.subscribe if connect is reolved', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = chai.spy(() => Promise.resolve())
    return messenger.on(TOPIC, () => { }).then(() => {
      expect(messenger.client.subscribe).to.have.been.called.with(messenger.options.node, TOPIC)
    })
  })

  it('on does not call messenger.client.subscribe if connect is rejected', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = chai.spy(() => Promise.reject(new Error('err')))
    return messenger.on(TOPIC, () => { }).catch(() => { }).then(() => {
      expect(messenger.client.subscribe).to.not.have.been.called()
    })
  })

  it('on calls listen postactions', () => {
    const listenPostaction = chai.spy(() => { })
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    messenger._listenPostactions.push(listenPostaction)
    return messenger.on(TOPIC, listenCallback).then(() => {
      expect(listenPostaction).to.have.been.called.with(SUBSCRIBE_RESULT, TOPIC, listenCallback, messenger)
    })
  })

  it('on returned promise is resolved with the result of messenger.client.subscribe if there are no postactions', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    return messenger.on(TOPIC, listenCallback).then(result => {
      expect(result).to.equal(SUBSCRIBE_RESULT)
    })
  })

  it('on returned promise is resolved with the result of the last postaction if there is a postaction', () => {
    const FIRST_POSTACTION_RESULT = 'FIRST_POSTACTION_RESULT'
    const SECOND_POSTACTION_RESULT = 'SECOND_POSTACTION_RESULT'
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    messenger._listenPostactions.push(() => FIRST_POSTACTION_RESULT)
    messenger._listenPostactions.push(() => SECOND_POSTACTION_RESULT)
    return messenger.on(TOPIC, listenCallback).then(result => {
      expect(result).to.equal(SECOND_POSTACTION_RESULT)
    })
  })

  it('client message event calls callback if all filters pass', () => {
    const message = { topic: TOPIC, data: DATA }
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    messenger._handlingFilters = [() => true]
    messenger.listen(TOPIC, listenCallback)
    messenger.client._listeners['message'](message)
    expect(listenCallback).to.have.been.called.with(DATA, message)
  })

  it('client message event does not call callback if one filter fails', () => {
    const message = { topic: TOPIC, data: DATA }
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    messenger._handlingFilters = [() => true, () => false, () => true]
    messenger.listen(TOPIC, listenCallback)
    messenger.client._listeners['message'](message)
    expect(listenCallback).to.not.have.been.called()
  })

  it('default handling filter throws error only for topic mismatch', () => {
    const messageOnTopic = { topic: TOPIC, data: DATA }
    const messageOffTopic = { topic: 'TOPIC2', data: DATA }
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    expect(messenger._handlingFilters[0](messageOffTopic, TOPIC)).to.equal(false)
    expect(messenger._handlingFilters[0](messageOnTopic, TOPIC)).to.equal(true)
  })

  it('send calls send preactions', () => {
    const sendPreaction = chai.spy(() => { })
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    messenger._sendPreactions.push(sendPreaction)
    messenger.send(TOPIC, DATA)
    expect(sendPreaction).to.have.been.called.with(TOPIC, DATA, messenger)
  })

  it('send calls messenger.connect', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = chai.spy(() => Promise.resolve())
    messenger.send(TOPIC, () => { })
    expect(messenger.connect).to.have.been.called()
  })

  it('send calls messenger.client.publish if connect is reolved', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = chai.spy(() => Promise.resolve())
    return messenger.send(TOPIC, DATA).then(() => {
      expect(messenger.client.publish).to.have.been.called.with(messenger.options.node, TOPIC, DATA, { })
    })
  })

  it('send calls messenger.client.publish with all header if specified header providers', () => {
    const header1 = 'header1'
    const header2 = 'header2'
    const messenger = new Messenger(mclient, options)
    messenger.connect = chai.spy(() => Promise.resolve())
    messenger._headersProviders.push(() => ({ header1 }))
    messenger._headersProviders.push(() => ({ header2 }))
    return messenger.send(TOPIC, DATA).then(() => {
      expect(messenger.client.publish).to.have.been.called.with(messenger.options.node, TOPIC, DATA, { header1, header2 })
    })
  })

  it('send does not call messenger.client.publish if connect is rejected', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = chai.spy(() => Promise.reject(new Error('err')))
    return messenger.send(TOPIC, DATA).catch(() => { }).then(() => {
      expect(messenger.client.publish).to.not.have.been.called()
    })
  })

  it('send calls send postactions', () => {
    const sendPostaction = chai.spy(() => { })
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    messenger._sendPostactions.push(sendPostaction)
    return messenger.send(TOPIC, DATA).then(() => {
      expect(sendPostaction).to.have.been.called.with(PUBLISH_RESULT, TOPIC, DATA, messenger)
    })
  })

  it('send returned promise is resolved with the result of messenger.client.publish if there are no postactions', () => {
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    return messenger.send(TOPIC, DATA).then(result => {
      expect(result).to.equal(PUBLISH_RESULT)
    })
  })

  it('send returned promise is resolved with the result of the last postaction if there is a postaction', () => {
    const FIRST_POSTACTION_RESULT = 'FIRST_POSTACTION_RESULT'
    const SECOND_POSTACTION_RESULT = 'SECOND_POSTACTION_RESULT'
    const messenger = new Messenger(mclient, options)
    messenger.connect = () => Promise.resolve()
    messenger._sendPostactions.push(() => FIRST_POSTACTION_RESULT)
    messenger._sendPostactions.push(() => SECOND_POSTACTION_RESULT)
    return messenger.send(TOPIC, DATA).then(result => {
      expect(result).to.equal(SECOND_POSTACTION_RESULT)
    })
  })

  it('send calls send error actions if connect is rejected', () => {
    const error = new Error('err')
    const messenger = new Messenger(mclient, options)
    const sendErroraction = chai.spy(() => { })
    messenger.connect = () => Promise.reject(error)
    messenger._sendErroractions.push(sendErroraction)
    return messenger.send(TOPIC, DATA).catch(() => {
      expect(sendErroraction).to.have.been.called.with(error)
    })
  })

  it('connect calls connection preactions', () => {
    const connectionPreaction = chai.spy(() => { })
    const messenger = new Messenger(mclient, options)
    messenger._connectionPreactions.push(connectionPreaction)
    messenger.connect()
    expect(connectionPreaction).to.have.been.called.with(messenger)
  })

  it('connect calls messenger.client.connect', () => {
    const messenger = new Messenger(mclient, options)
    return messenger.connect().then(() => {
      expect(messenger.client.connect).to.have.been.called()
    })
  })

  it('connect calls messenger.client.connect on the first time', () => {
    const messenger = new Messenger(mclient, options)
    return messenger.connect().then(() => {
      expect(messenger.client.connect).to.have.been.called()
    })
  })

  it('connect does not call messenger.client.connect on the second time', () => {
    const messenger = new Messenger(mclient, options)
    return messenger.connect().then(() => messenger.connect()).then(() => {
      expect(messenger.client.connect).to.have.been.called(1)
    })
  })

  it('connect calls connection postactions', () => {
    const connectionPostaction = chai.spy(() => { })
    const messenger = new Messenger(mclient, options)
    messenger._connectionPostactions.push(connectionPostaction)
    return messenger.listen(TOPIC, listenCallback).then(() => {
      expect(connectionPostaction).to.have.been.called.with(CONNECT_RESULT, messenger)
    })
  })

  it('connect returned promise is resolved with the result of messenger.client.connect if there are no postactions', () => {
    const messenger = new Messenger(mclient, options)
    return messenger.connect().then(result => {
      expect(result).to.equal(CONNECT_RESULT)
    })
  })

  it('listen returned promise is resolved with the result of the last postaction if there is a postaction', () => {
    const FIRST_POSTACTION_RESULT = 'FIRST_POSTACTION_RESULT'
    const SECOND_POSTACTION_RESULT = 'SECOND_POSTACTION_RESULT'
    const messenger = new Messenger(mclient, options)
    messenger._connectionPostactions.push(() => FIRST_POSTACTION_RESULT)
    messenger._connectionPostactions.push(() => SECOND_POSTACTION_RESULT)
    return messenger.connect().then(result => {
      expect(result).to.equal(SECOND_POSTACTION_RESULT)
    })
  })

  it('connect calls connect error actions if messenger.client.connect is rejected', () => {
    const error = new Error('err')
    const messenger = new Messenger(mclient, options)
    messenger.client.connect = () => Promise.reject(error)
    const connectionErroraction = chai.spy(() => { })
    messenger._connectionErroractions.push(connectionErroraction)
    return messenger.connect().catch(() => {
      expect(connectionErroraction).to.have.been.called.with(error)
    })
  })
})
