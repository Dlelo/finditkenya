'use strict';
var express = require('express');
var mailer = require('express-mailer');
var path = require('path');
var config = require(__dirname + '/../config.json');
var app = express();

app.set('views', path.join(__dirname, '/../views'));
app.set('view engine', 'pug');

mailer.extend(app, {
  from: 'noreply@findit.ke',
  host: 'smtp.zoho.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: config.noreplyEmail.username,
    pass: config.noreplyEmail.password
  }
});

module.exports = {
	app : app,
	mailer: mailer
};