const isServer = require('detect-node')

exports.getDefaultLogger = () => {
  if (isServer) {
    const { Logger } = require('@first-lego-league/ms-logger')

    return new Logger()
  } else {
    const DO_NOTHING = () => { }

    return {
      debug: DO_NOTHING,
      info: DO_NOTHING,
      warn: DO_NOTHING,
      error: DO_NOTHING,
      fatal: DO_NOTHING
    }
  }
}
