[![npm](https://img.shields.io/npm/v/@first-lego-league/ms-messenger.svg)](https://www.npmjs.com/package/@first-lego-league/ms-messenger)
[![David Dependency Status](https://david-dm.org/FirstLegoLeague/ms-messenger.svg)](https://david-dm.org/FirstLegoLeague/ms-messenger)
[![David Dev Dependency Status](https://david-dm.org/FirstLegoLeague/ms-messenger/dev-status.svg)](https://david-dm.org/FirstLegoLeague/ms-messenger#info=devDependencies)
[![David Peer Dependencies Status](https://david-dm.org/FirstLegoLeague/ms-messenger/peer-status.svg)](https://david-dm.org/FirstLegoLeague/ms-messenger?type=peer)
[![Build status](https://ci.appveyor.com/api/projects/status/0ya8dl62755nn01g/branch/master?svg=true)](https://ci.appveyor.com/project/2roy999/ms-messenger/branch/master)
[![GitHub](https://img.shields.io/github/license/FirstLegoLeague/ms-messenger.svg)](https://github.com/FirstLegoLeague/ms-messenger/blob/master/LICENSE)

## FIRST LEGO Leage messenger
A MHub client working by the _FIRST_ LEGO League TMS [Module Standard](https://github.com/FirstLegoLeagueIL/architecture/blob/master/module-standard/v1.0-SNAPSHOT.md#log-messages).

### Usage

```javascript
const { Messenger } = require('@first-lego-league/ms-messenger')

// Create a new object
const messenger = new Messenger({/* options... */})

messenger.listen('some:topic', (messageData, message) => {
  // do something
})

messenger.send('some:topic', { data: {/* data... */} })
```

#### options

| **option** | **meaning** |  **default** |
|--|--|--|
| mhubURI | The URI of the MHub server | `process.env.MHUB_URI` |
| node | The node to which the messenger is connected | `'default'` |
| clientId| An ID for the client | Random base64 text |
| reconnectTimeout | Time between connection attempts | 10 seconds |
| logger | A logger object of the pattern `{ debug, info, warn, error, fatal }`, can axcept `ms-logger` | empty logger |
| credentials | An object of the pattern `{ username, password }` to be used to login to the node. If none is specified, no login will be performed | none |