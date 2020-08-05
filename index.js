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
  const town_id_path = __dirname+'/database/towns/'+user_town_name;
  
  var infolog;
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
      
    </ul>
  </body>
</html>
  `;

  var mailHTMLSuburbs = `
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
    <img class="center" src="https://www.tcdhomes.com/wp-content/uploads/2016/02/hemlock01.jpg" width="650" height="500"></img>

    <ul>
      <li><a href="https://emailtown.codesalvageon.repl.co/invite" target="_blank"><h2>Invite More People to Town</h2></a></li>
      <li><a href="https://emailtown.codesalvageon.repl.co/build" target="_blank"><h2>Build Building</h2></a></li>
      
    </ul>
  </body>
</html>
  `;

  let scriptAppend = `<script src="https://emailtown.codesalvageon.repl.co/scripts/javascript/append.js"></script>`;

  let scriptAlert = `<script src="https://emailtown.codesalvageon.repl.co/scripts/javascript/town_create.js"></script>`;

  let space = `
  `;

  if (user_town_type == 'coastal'){
    mailHTML = mailHTMLCoastal;
  }
  else if (user_town_type == 'rural'){
    mailHTML = mailHTMLRural;
  }
  else if (user_town_type == 'suburbs'){
    mailHTML = mailHTMLSuburbs;
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
      infolog = info.messageId;

      var idMail = {
        from: 'noreplyimpala@gmail.com',
        to: mailingList,
        subject: 'Thread ID for '+user_town_name,
        text: 'The thread ID for your town is '+infolog+' You will need to use this ID later to add buildings to your town.'
      }

      transporter.sendMail(idMail, function(err, info){
        if (err){
          console.err;
        }
        else{
          console.log();
        }
      }); 

      if (user_town_visibility == 'public'){
        if (fs.existsSync(town_id_path)){
          fs.readFile(__dirname+'/public/index.html', 'utf8', function(err, data){
            if (err){
              console.err;
            }
            else{
              res.send(data+scriptAppend);
            }
          });

        }
        else{
          fs.appendFile(town_id_path, info.messageId, function(err){
            if (err){
              console.err;
            }
            else{
              console.log('ID Stored at: '+town_id_path);
            }
          });

          fs.appendFile(__dirname+'/database/towns.gun', space+'<h2>'+user_town_name+' Thread ID: <label>'+info.messageId+'</label></h2>', function(err){
            if (err){
              console.err;
            }
            else{
              console.log('Town Logged at: '+__dirname+'/database/towns.gun');
            }
          });
        }
      }
      else{
        console.log('PRIVATE Email Town created');
      }

    fs.readFile(__dirname+'/public/index.html', 'utf8', function(err, data){
      if (err){
        console.err;
      }
      else{
        if (fs.existsSync(town_id_path)){
          console.log('EXISTS');
          res.send(data+scriptAlert);
        }
        else{

          res.send(data+scriptAlert);
        }
      }
    });

    }
  });

});

app.get('/create-town', function(req, res){
  res.redirect('/');
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});