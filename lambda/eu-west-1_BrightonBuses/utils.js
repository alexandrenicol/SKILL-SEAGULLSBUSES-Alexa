function userHasAccessToken(handlerInput) {
  return handlerInput.requestEnvelope.session.user.accessToken;
}

function getUserAccessToken(handlerInput) {
  return handlerInput.requestEnvelope.session.user.accessToken;
}

function returnLinkCard(handlerInput, message) {
  return handlerInput.responseBuilder
    .speak(message)
    .withLinkAccountCard()
    .withShouldEndSession(true)
    .getResponse();
}

function returnNoBusMessage(handlerInput, message) {
  return handlerInput.responseBuilder
    .speak(message)
    .withShouldEndSession(true)
    .getResponse();
}


module.exports = {
  userHasAccessToken,
  getUserAccessToken,
  returnLinkCard,
  returnNoBusMessage,
};
