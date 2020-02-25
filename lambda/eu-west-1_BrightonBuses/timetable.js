const querystring = require('querystring');
const fetch = require('node-fetch');

const CONFIG = {
  app_id: process.env.APP_ID,
  app_key: process.env.APP_KEY,
  nextbuses: 'yes',
};

function constructURL(atcocode) {
  return `http://transportapi.com/v3/uk/bus/stop/${atcocode}/live.json`;
}

function constructQueryString(group = 'no') {
  CONFIG.group = group;
  return querystring.stringify(CONFIG);
}

function getTimeTable(atcocode, filter = null) {
  const group = (filter ? 'route' : 'no');
  const url = `${constructURL(atcocode)}?${constructQueryString(group)}`;

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          console.log(json.error);
          reject(json.error);
          return;
        }
        if (!filter) {
          resolve(json.departures.all);
        } else if (json.departures[filter]) {
          resolve(json.departures[filter]);
        } else {
          resolve([]);
        }
      })
      .catch((error) => reject(error));
  });
}

function createBusResponse(busData) {
  // TODO maybe there's a smater way to do this?
  let speechOutput = 'Your next buses are: ';

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < Math.min(3, busData.length); i++) {
    const bus = busData[i];
    const time = (bus.expected_departure_time) ? bus.expected_departure_time : bus.aimed_departure_time;
    speechOutput += `the ${bus.line_name} to ${bus.direction}, departing at ${time}`;
    if (i !== busData.length - 1) {
      speechOutput += ', ';
    }
  }

  speechOutput += '.';
  return speechOutput;
}

module.exports = {
  getTimeTable,
  createBusResponse,
};
