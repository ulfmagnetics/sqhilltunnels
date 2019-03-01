const moment = require('moment');
const maps = require('./libs/maps');
const dynamoDb = require('./libs/dynamodb');

function init() {
  console.log("initializing Analyzer");
}

async function analyze(route) {
  const params = {
    origins: [route.start],
    destinations: [route.finish],
    units: 'imperial'
  };
  
  try {
    const result = await maps.call('distanceMatrix', params);
    const element = result.json.rows[0].elements[0];    
    const routeStatus = {
      routeId: route.id,
      createdAt: moment().unix(),
      direction: route.direction,
      distance: element.distance.value,
      duration: element.duration.value
    };
    
    // If the Distance Matrix API reports a route distances that's more than 10% greater
    // than expected, consider the route closed.
    if (((element.distance.value - route.expectedDistance) / route.expectedDistance) > 0.10) {
      routeStatus.status = 'closed';
    } else {
      routeStatus.status = 'open';
    }
        
    return routeStatus;
  } catch(e) {
    console.log(e);
    return null;
  }
}

module.exports.init = init;
module.exports.analyze = analyze;