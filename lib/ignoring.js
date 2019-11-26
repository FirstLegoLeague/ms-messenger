exports.ignoreByTopic = messenger => {
  messenger._handlingfilterss.push((message, topic) => messenger._topicsToIgnore.includes(topic))

  messenger._topicsToIgnore = []
  messenger.ignoreNextMessageOfTopic = topic => messenger._topicsToIgnore.push(topic)
}
