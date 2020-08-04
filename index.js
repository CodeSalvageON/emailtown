const fs = require('fs');
const express = require('express');

var app = require('express')();
var io = require('socket.io')(http);
var nodemailer = require('nodemailer');
var http = require('http').Server(app);
var bodyParser = require('body-parser');

var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreplyimpala@gmail.com',
    pass: process.env.PWD
  }
});

app.get('/towns', function(req, res){
  const towns_file = __dirname+'/database/towns.gun';

  fs.readFile(towns_file, 'utf8', function(err, data){
    if (err){
      console.err;
    }
    else{
      res.send(data);
    }
  });
});

app.post('/create-town', function(req, res){
  let user_email_address = req.body.user_email;
  let user_town_type = req.body.user_town;
  let user_town_visibility = req.body.public_private;
  let user_town_name = req.body.town_name;
  let user_first_resident = req.body.first_resident;

  const towns_file = __dirname+'/database/towns.gun';

  var mailHTML;
  
  var mailingList = [
    user_email_address,
    user_first_resident
  ];

  var mailHTMLCoastal = `
<!DOCTYPE html>
<html>
  <head>
    <title>The Town of `+user_town_name+`</title>
    <link href="https://emailtown.codesalvageon.repl.co/external/css/style.min.css" rel="stylesheet"/>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Merriweather&display=swap" rel="stylesheet">
  </head>
  <body>
    <h1 class="center">The Town of `+user_town_name+`</h1>
    <img class="center" src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fs3.amazonaws.com%2Ffiles.usmre.com%2F5422%2FMotif%2520Rockport%2520MA.jpg&f=1&nofb=1" width="650" height="500"></img>

    <ul>
      <li><a href="https://emailtown.codesalvageon.repl.co/invite" target="_blank"><h2>Invite More People to Town</h2></a></li>
      <li><a href="https://emailtown.codesalvageon.repl.co/build" target="_blank"><h2>Build Building</h2></a></li>
      <li><a href=""><h2>Check for Changes(If any)</h2></a></li>
    </ul>
  </body>
</html>
  `;

  var mailHTMLRural = `
<!DOCTYPE html>
<html>
  <head>
    <title>The Town of `+user_town_name+`</title>
    <link href="https://emailtown.codesalvageon.repl.co/external/css/style.min.css" rel="stylesheet"/>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Merriweather&display=swap" rel="stylesheet">
  </head>
  <body>
    <h1 class="center">The Town of `+user_town_name+`</h1>
    <img class="center" src="https://learn.sharedusemobilitycenter.org/wp-content/uploads/Small-town-1024x623.jpeg" width="650" height="500"></img>

    <ul>
      <li><a href="https://emailtown.codesalvageon.repl.co/invite" target="_blank"><h2>Invite More People to Town</h2></a></li>
      <li><a href="https://emailtown.codesalvageon.repl.co/build" target="_blank"><h2>Build Building</h2></a></li>
      <li><a href=""><h2>Check for Changes(If any)</h2></a></li>
    </ul>
  </body>
</html>
  `;

  if (user_town_type == 'coastal'){
    mailHTML = mailHTMLCoastal;
  }
  else if (user_town_type == 'rural'){
    mailHTML = mailHTMLRural;
  }
  else if (user_town_type == 'suburbs'){
    
  }
  
  var mailOptions = {
    from: 'noreplyimpala@gmail.com',
    to: mailingList,
    subject: 'The Town of '+user_town_name,
    html: mailHTML
  }

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      console.log('Message ID: '+info.messageId);
    }
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});