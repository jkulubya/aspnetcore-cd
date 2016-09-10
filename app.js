var express = require('express');
var app = express();

app.post('/', function (req, res) {
  console.log('Github event received');
  res.sendStatus(200);
});

app.listen(9554, function () {
  console.log('Waiting for Github ping on 9554');
});