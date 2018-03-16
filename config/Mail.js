'use strict';
var express = require('express');
var mailer = require('express-mailer');
var path = require('path');
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
    user: 'noreply@findit.ke',
    pass: '12345678'
  }
});

module.exports = {
	app : app,
	mailer: mailer
};