[![npm](https://img.shields.io/npm/v/@first-lego-league/ms-messenger.svg)](https://www.npmjs.com/package/@first-lego-league/ms-messenger)
[![David Dependency Status](https://david-dm.org/FirstLegoLeague/ms-messenger.svg)](https://david-dm.org/FirstLegoLeague/ms-messenger)
[![David Dev Dependency Status](https://david-dm.org/FirstLegoLeague/ms-messenger/dev-status.svg)](https://david-dm.org/FirstLegoLeague/ms-messenger#info=devDependencies)
[![David Peer Dependencies Status](https://david-dm.org/FirstLegoLeague/ms-messenger/peer-status.svg)](https://david-dm.org/FirstLegoLeague/ms-messenger?type=peer)
[![Build status](https://ci.appveyor.com/api/projects/status/0ya8dl62755nn01g/branch/master?svg=true)](https://ci.appveyor.com/project/2roy999/ms-messenger/branch/master)
[![GitHub](https://img.shields.io/github/license/FirstLegoLeague/ms-messenger.svg)](https://github.com/FirstLegoLeague/ms-messenger/blob/master/LICENSE)

# FIRST LEGO Leage messenger
A [MHub](https://www.npmjs.com/package/mhub) client working by the _FIRST_ LEGO League TMS [Module Standard](https://github.com/FirstLegoLeagueIL/architecture/blob/master/module-standard/v1.0-SNAPSHOT.md#log-messages).

## The logic of this module
This module was meant to serve as an extendable messenger which already works by the Module Standard and allows you to easily listen to and send messages. It gives you all the functionality needed for a Mhub messenger running in node or in browser.

### In node
The messenger givven in node is fully [correlated](https://github.com/FirstLegoLeague/architecture/blob/master/module-standard/v1.0-SNAPSHOT.md#cross-module-correlations) and logged using [ms-logger](https://www.npmjs.com/package/@first-lego-league/ms-logger). It also has a client-id which recognizes it against other clients, and is sent in the headers for recognition.

### In browser
In broswer many of these feature are not required or needed. So the client only has a client-id, and isn't correlated or logged.

### Authentication
All messengers have the ability to be authenticated using MHub credentials.

### Ignoring
All messengers have the `ignoreNextMessageOfTopic` method, which tells them to ignore the next message of a givven topic.

### Stay Alive
All messengers have a failsafe mechanism that makes sure they restart when they get disconnected.

## Usage

```javascript
const { createMessenger } = require('@first-lego-league/ms-messenger')

// Create a new object
const messenger = createMessenger({/* options... */})

messenger.listen('some:topic', (messageData, message) => {
  // do something
})

messenger.send('some:topic', { data: {/* data... */} })
```

### Options

| **option** | **meaning** | **options** |  **default** |
|--|--|--|
| mhubURI | The URI of the MHub server | Any valid WebSockets URI | `process.env.MHUB_URI` |
| node | The node to which the messenger is connected | String | `'default'` |
| clientId | An ID for the client | String | Random base64 string |
| reconnectTimeout | Time between connection attempts | Any number | 10 seconds |
| credentials | An object of the pattern `{ username, password }` to be used to login to the node. If none is specified, no login will be performed | Object with fields `username` and `password` | undefined |

## Contribution
To contribute to this repository, simply create a PR and set one of the Code Owners to be a reviewer.
Please notice the linting and UT, because they block merge.
Keep the package lightweight and easy to use.
Thank you for contributing!
