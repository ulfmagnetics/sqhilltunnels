const util = require('util');
const _ = require('lodash');
const moment = require('moment');
const dynamoDb = require('./libs/dynamodb');
const analyzer = require('./analyzer');

async function get(route) {  
  try {
    const params = {
      TableName: "route_statuses",
      KeyConditionExpression: "routeId = :rid and createdAt >= :ts",
      FilterExpression: "direction = :dir",
      ExpressionAttributeValues: {
        ":rid": _.toInteger(route.id),
        ":ts": moment().unix() - _.get(process.env, 'STATUS_EXPIRATION_SECONDS', 15*60),
        ":dir": route.direction
      }
    };
    const result = await dynamoDb.call('query', params);
    
    if (!_.isEmpty(result.Items)) {
      // cached status exists
      const item = _.head(result.Items);
      console.log('using cached status: ' + util.inspect(item));
      return item;
    }
    else {
      // cache has expired (or no items exist yet)
      const params = {
        TableName: "route_statuses",
      };
      const status = await analyzer.analyze(route);
      params.Item = status;
      console.log('writing new item to table: ' + util.inspect(params));      
      await dynamoDb.call('put', params);
      return status;
    }
  } catch(err) {
    console.log(err, err.stack);
    return null;
  }
}

module.exports.get = get;