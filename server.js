const _ = require('lodash');
const util = require('util');
const express = require('express');
const cors = require('cors');
const app = express();

const routes = require('./routes.json');
const analyzer = require('./analyzer.js');
const routeStatus = require('./route_status.js');

analyzer.init();

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/route_status/:id", cors(), async function(request, response) {
  const direction = _.isEmpty(request.query.dir) ? 'inbound' : request.query.dir
  const route = _.get(routes, request.params.id + '.' + direction);
  if (!_.isEmpty(route)) {
    try {
      const status = await routeStatus.get(route);
      response.json(status);
    } catch (e) {
      console.log(e, e.stack);
      response.status(500).send('Internal Server Error');
    } 
  } 
  else {
    response.status(422).send('Unprocessable Entity');
  }
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
