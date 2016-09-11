var express = require('express');
var bodyParser = require('body-parser');
var shell = require('shelljs');
var app = express();

app.use(bodyParser.json());

app.post('/', function (req, res) {
  payload = req.body; //throw to some kind of queue?
  res.sendStatus(200);

  if(payload.ref != 'refs/heads/master'){
    shell.echo('Push changes to master to trigger a build');
    shell.exit(1);
  }
  else{
    shell.cd('~/repository');
    if(shell.exec('git pull origin').code != 0){
      shell.echo('Git pull failed');
      shell.exit(1);
    }
    shell.cd('src/TYK');
    shell.exec('dotnet restore');
    shell.exec('dotnet publish -f netcoreapp1.0 -c Release');
    shell.exec('rsync -r --delete ~/tykrepository/src/TYK/bin/Release/netcoreapp1.0/publish/ /var/dotnettest/');
    shell.exec('supervisorctl restart TYK_Dotnet');
  }
});

app.listen(9554, function () {
  console.log('Waiting for Github ping on port 9554');
});