
# ms-messenger
A MHub client working by the Module Standard

## Usage

```javascript
const { Messenger } = require('@first-lego-league/ms-messenger')

// Create a new object
const messenger = new Messenger(options)

messenger.listen('some:topic', (messageData, message) => {
	// do something
})

messenger.send('some:topic', { data })

```

### options

| **option** | **meaning** |  **default** |
|--|--|--|
| mhubURI | The URI of the MHub server | `process.env.MHUB_URI` |
| node | The node to which the messenger is connected | `'default'` |
| clientId| An ID for the client | Random base64 text |
| reconnectTimeout | Time between connection attempts | 10 seconds |
| logger | A logger object of the pattern `{ debug, info, warn, error, fatal }`, can axcept `ms-logger` | empty logger |
| credentials | An object of the pattern `{ username, password }` to be used to login to the node. If none is specified, no login will be performed | none |