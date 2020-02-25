const Alexa = require('ask-sdk-core');
const languageStrings = require('../languageStrings');

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = languageStrings.en.HELP_MESSAGE;
    const helpReprompt = languageStrings.en.HELP_REPROMPT;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(helpReprompt)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
              || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = languageStrings.en.STOP_MESSAGE;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = languageStrings.en.UNHANDLED_MESSAGE;
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered
 * when a currently open session is closed for one of the following reasons:
 * 1) The user says "exit" or "quit".
 * 2) The user does not respond or says something that does not match an intent defined
 * in your voice model.
 * 3) An error occurs
 * */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};

module.exports = {
  ErrorHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler,
};
