function call(action, params) {
  const googleMapsClient = require('@google/maps').createClient({
    key: process.env.ROUTES_API_KEY,
    Promise: Promise
  });
  return googleMapsClient[action](params).asPromise();
}

module.exports.call = call;