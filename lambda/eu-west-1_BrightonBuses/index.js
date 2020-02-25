require('dotenv').config({ path: './env' });

const Alexa = require('ask-sdk-core');
const utils = require('./utils');
const languageStrings = require('./languageStrings');
const timetable = require('./timetable');
const commonHandlers = require('./handlers/common');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    if (!utils.userHasAccessToken(handlerInput)) {
      return utils.returnLinkCard(handlerInput, languageStrings.en.LINK_MESSAGE);
    }

    return handlerInput.responseBuilder
      .speak(languageStrings.en.WELCOME_MESSAGE)
      .reprompt(languageStrings.en.HELP_REPROMPT)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const SetHomeStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SetHomeStop';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(languageStrings.en.SETSTOP_MESSAGE)
      .withLinkAccountCard()
      .withShouldEndSession(true)
      .getResponse();
  },
};

const GetNextBusesIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetNextBuses';
  },
  async handle(handlerInput) {
    if (!utils.userHasAccessToken(handlerInput)) {
      return utils.returnLinkCard(handlerInput, languageStrings.en.LINK_MESSAGE);
    }

    const busesData = await timetable.getTimeTable(utils.getUserAccessToken(handlerInput));
    if (busesData.length === 0) {
      return utils.returnNoBusMessage(handlerInput, languageStrings.en.NOBUS_MESSAGE);
    }

    const busesSpeechResponse = timetable.createBusResponse(busesData);

    return handlerInput.responseBuilder
      .speak(busesSpeechResponse)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const GetNextBusLineIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetNextBusLine';
  },
  async handle(handlerInput) {
    if (!utils.userHasAccessToken(handlerInput)) {
      return utils.returnLinkCard(handlerInput, languageStrings.en.LINK_MESSAGE);
    }

    const busLine = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Line');

    const busesData = await timetable.getTimeTable(utils.getUserAccessToken(handlerInput), busLine);
    if (busesData.length === 0) {
      return utils.returnNoBusMessage(handlerInput, languageStrings.en.NOBUS_MESSAGE);
    }

    const busesSpeechResponse = timetable.createBusResponse(busesData);

    return handlerInput.responseBuilder
      .speak(busesSpeechResponse)
      .withShouldEndSession(true)
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    SetHomeStopIntentHandler,
    GetNextBusesIntentHandler,
    GetNextBusLineIntentHandler,
    commonHandlers.CancelAndStopIntentHandler,
    commonHandlers.HelpIntentHandler,
    commonHandlers.SessionEndedRequestHandler,
  )
// FallbackIntentHandler,
// IntentReflectorHandler)
  .addErrorHandlers(
    commonHandlers.ErrorHandler,
  )
// .addRequestInterceptors(
//     LocalisationRequestInterceptor)
  .withCustomUserAgent('sample/hello-world/v1.2')
  .lambda();
