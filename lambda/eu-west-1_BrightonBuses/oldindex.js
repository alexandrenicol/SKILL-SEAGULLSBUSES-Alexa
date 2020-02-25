/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * TODO
 **/

'use strict';

const Alexa = require('alexa-sdk');
const request = require('request-promise');

const APP_ID = 'amzn1.ask.skill.231f9a10-1c8d-4362-8a22-9aec01960eab';

//common phrase
const languageStrings = {
    'en-GB': {
        translation: {
            SKILL_NAME: 'Seagulls Buses',
            HELP_MESSAGE: 'You can ask for the next buses at your home stop, or you can set a new home stop, what can I help you with?',
            WELCOME_MESSAGE: 'Welcome to the Seagulls Buses skill, you can ask for the next buses at your home stop, or you can set a new home stop, what can I help you with?',
            LINK_MESSAGE: 'Welcome to the Seagulls Buses skill, you have not set your home bus stop yet, open the Alexa app and click on, Link account, to choose your home stop.',
            SETSTOP_MESSAGE: 'OK, open the Alexa app and click on, Link account, to change your home stop.',
            HELP_REPROMPT: 'What can I help you with?',
            UNHANDLED_MESSAGE: 'Sorry, I didn\'t get that. What can I help you with?',
            NOBUS_MESSAGE: 'There will be no buses leaving from this stop today.',
            STOP_MESSAGE: 'Goodbye!',
            OK: 'OK'
        }
    }
};

//Intent handler
const handlers = {
    //Launch request handler
    'LaunchRequest': function () {
        console.log('this.event', JSON.stringify(this.event));
        const speechOutput = this.t('WELCOME_MESSAGE');
      
        //setup check
        if(this.event.session.user.accessToken){
            //setup has been done
            //ask for an action
            const reprompt = this.t('HELP_REPROMPT');
            this.emit(':ask', speechOutput, reprompt);
        } else {
            //setup has not been done
            //send a link account card
            const speechOutput = this.t('LINK_MESSAGE');
            this.emit(':tellWithLinkAccountCard', speechOutput);
        }
    },
    //SetHomeStop intent handler
    'SetHomeStop': function () {
        //send a link account card
        console.log('this.event', JSON.stringify(this.event));
        const speechOutput = this.t('SETSTOP_MESSAGE');
        this.emit(':tellWithLinkAccountCard', speechOutput);
    },
    //GetNextBuses
    'GetNextBuses': function () {
        //check if setup has been done, if not then send link account card
        if(!this.event.session.user.accessToken){      
            const speechOutput = this.t('LINK_MESSAGE');
            this.emit(':tellWithLinkAccountCard', speechOutput);
        } 
      
        console.log('this.event', JSON.stringify(this.event));
        var self = this;
        //use the atcocode fetch from the setup to get the bus stop ID
        var atcocode = this.event.session.user.accessToken;
        //prepare request to the transport API
        var options = {
            uri: `http://transportapi.com/v3/uk/bus/stop/${atcocode}/live.json`,
            qs: {
                app_id: '028a1093',
                app_key: 'ca003319d1ec4ec922fdc92561eb7e4f',
                group: 'no',
                nextbuses: 'yes'
            },
            json: true
        };

        //send the request to transport API
        request(options)
        .then(function (data) {
            console.log('data', data);
            
            
          
            if(!data.departures.all) {
              self.emit(':tell', self.t('NOBUS_MESSAGE'));
            } 
          
            //get the list of the next buses
            const buses = data.departures.all;
          
            //create the speech output
            let speechOutput = 'Your next buses are: ';
            
            for (let i = 0; i < Math.min(5, buses.length); i++) {
                let bus = buses[i];
                let time = (bus.expected_departure_time) ? bus.expected_departure_time : bus.aimed_departure_time;
                speechOutput += `the ${bus.line_name} to ${bus.direction}, departing at ${time}`;
                if (i !== buses.length - 1) {
                    speechOutput += ', '
                }
            }
            
            speechOutput += '.';
            //send the output
            self.emit(':tellWithCard', speechOutput, self.t('SKILL_NAME'), speechOutput);
        })
        .catch(function (err) {
            
        });

    },
    'GetNextBusLine': function () {
        //check if setup has been done, if not then send link account card
        if(!this.event.session.user.accessToken){      
            const speechOutput = this.t('LINK_MESSAGE');
            this.emit(':tellWithLinkAccountCard', speechOutput);
        } 
      
        console.log('this.event', JSON.stringify(this.event));
        var self = this;
        //use the atcocode fetch from the setup to get the bus stop ID
        var atcocode = this.event.session.user.accessToken;
        //prepare request to the transport API
        var options = {
            uri: `http://transportapi.com/v3/uk/bus/stop/${atcocode}/live.json`,
            qs: {
                app_id: '028a1093',
                app_key: 'ca003319d1ec4ec922fdc92561eb7e4f',
                group: 'route',
                nextbuses: 'yes'
            },
            json: true
        };
      
        const requestedLine = this.event.request.intent.slots.Line.value.replace(/\s/g,'').toUpperCase();

        //send the request to transport API
        request(options)
        .then(function (data) {
            console.log('data', data);
            
            //get the list of the next buses
            const buses = data.departures[requestedLine];
            
            if(!buses) {
              self.emit(':tell', self.t('NOBUS_MESSAGE'));
            } 
          
            //create the speech output
            let speechOutput = 'Your next buses are: ';
            
            for (let i = 0; i < Math.min(5, buses.length); i++) {
                let bus = buses[i];
                let time = (bus.expected_departure_time) ? bus.expected_departure_time : bus.aimed_departure_time;
                speechOutput += `the ${bus.line_name} to ${bus.direction}, departing at ${time}`;
                if (i !== buses.length - 1) {
                    speechOutput += ', '
                }
            }
            
            speechOutput += '.';
            //send the output
            self.emit(':tellWithCard', speechOutput, self.t('SKILL_NAME'), speechOutput);
        })
        .catch(function (err) {
            
        });

    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'Unhandled': function() {
        this.emit(':ask', this.t('UNHANDLED_MESSAGE'), this.t('HELP_REPROMPT'));
    }
};


// Lambda handler
exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'BrightonBuses';
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
