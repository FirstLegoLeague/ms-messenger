const topicsToIgnore = []

exports.ignoreNextMessageOfTopic = topic => {
  topicsToIgnore.push(topic)
}

exports.shouldIgnoreMessage = message => {
  if (topicsToIgnore.includes(message.topic)) {
    topicsToIgnore.splice(topicsToIgnore.indexOf(message.topic), 1)
    return true
  }
  return false
}
