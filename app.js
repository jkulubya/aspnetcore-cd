var express = require('express');
var bodyParser = require('body-parser');
var shell = require('shelljs');
var app = express();

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Pong! Waiting for Github event.')
})

app.post('/', function (req, res) {
  payload = req.body; //throw to some kind of queue?
  res.sendStatus(200);

  if(payload.ref != 'refs/heads/master'){
    shell.echo('Push changes to master to trigger a build');
    shell.exit(1);
  }
  else{
    
    shell.echo('Changing into git repository');
    shell.cd('~/tykrepository');

    shell.echo('git pull-ing down latest bits');
    if(shell.exec('git pull origin').code != 0){
      shell.echo('Git pull failed');
      shell.exit(1);
    }
    
    shell.echo('Changing to project directory');
    shell.cd('src/TYK');
    
    shell.echo('Running dotnet restore');
    shell.exec('dotnet restore');
    
    shell.echo('Running dotnet publish');
    shell.exec('dotnet publish -f netcoreapp1.0 -c Release');

    shell.echo('Copying to output directory');
    shell.exec('rsync -r --delete ~/tykrepository/src/TYK/bin/Release/netcoreapp1.0/publish/ /var/dotnettest/');

    shell.echo('Restarting app');
    shell.exec('supervisorctl restart TYK_Dotnet');
    shell.echo('App online');
  }
});

app.listen(9554, function () {
  console.log('Waiting for Github push event');
});