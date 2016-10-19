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

  let vars = {
    user: "user",
    apps: [
      {
        appName: "appName",
        basePath: "~/basepath",
        outputPath: "~/outputpath",
        projectPath: "~/project-path",
        repoName: "repoName"
      },
      {
        appName: "appname",
        basePath: "~/basepath",
        outputPath: "~/outputpath",
        projectPath: "~/project-path",
        repoName: "repoName"
      }
    ]    
  };

  let currentVars = {};

  if(payload.ref != 'refs/heads/master'){
    shell.echo('Push changes to master to trigger a build');
  }
  else{

      for (var i=0, iLen=vars.apps.length; i<iLen; i++) {
        if (vars.apps[i].repoName == payload.repository.full_name) currentVars = arr[i];
      }

    if(currentVars = {}){
      shell.echo('Unregistered repo. Add repo to apps array.');
    }
    else{
      shell.echo('Changing into git repository');
      shell.cd(currentVars.basePath);

      shell.echo('git pull-ing down latest bits');
      if(shell.exec('sudo -u '+vars.user+' git pull origin').code != 0){
        shell.echo('Git pull failed');
      }
      
      shell.echo('Changing to project directory');
      shell.cd(currentVars.projectPath);
      
      shell.echo('Running dotnet restore');
      shell.exec('sudo -u '+vars.user+' dotnet restore');
      
      shell.echo('Running dotnet publish');
      shell.exec('sudo -u '+vars.user+' dotnet publish -f netcoreapp1.0 -c Release');

      shell.echo('Copying to output directory');
      shell.exec('rsync -r --delete '+currentVars.projectOutputPath+' '+currentVars.outputPath);

      shell.echo('Restarting app');
      shell.exec('supervisorctl restart '+currentVars.appName);
      shell.echo('App online');
    };    
  };
});

app.listen(9554, function () {
  console.log('Waiting for Github push event');
});