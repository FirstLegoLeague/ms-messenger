exports.ignoreByTopic = messenger => {
  messenger._handlingFilters.push((message, topic) => {
    if (messenger._topicsToIgnore.includes(topic)) {
      messenger._topicsToIgnore = messenger._topicsToIgnore.filter(topicToIgnore => topicToIgnore !== topic)
      return false
    } else {
      return true
    }
  })

  messenger._topicsToIgnore = []
  messenger.ignoreNextMessageOfTopic = topic => messenger._topicsToIgnore.push(topic)
}
