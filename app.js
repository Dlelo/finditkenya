var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');


var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var session = require('express-session');
var flash = require('connect-flash');
var bcrypt = require('bcryptjs');
var cookieSession = require('cookie-session');
var FacebookStrategy = require('passport-facebook');
var mailer = require('express-mailer');

var users = require('./routes/users');
var business = require('./routes/business');
var index = require('./routes/index');
var User = require('./models/User');
var admin = require('./routes/admin');
var Business = require('./models/Business');
var transporter = require('./config/Email');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

/*app.use(session({
  secret: 'cookie_secret',
  resave: true,
  saveUninitialized: true
}));*/

app.use(cookieSession({
  name: 'session',
  keys: ['m@ckl3mor3!sth#b0mb'],

  // Cookie Options
  // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id).then(function(user){
    done(null, user);
  });
});


passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    User.findOne({ 'username': username }).then(function(user){
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    }).catch(function(err){
      console.log(err);
    });
  }
));


passport.use(new GoogleStrategy({
    clientID:     '118322684414-q0vllioiccmtodvj62kc5n2rcivatj83.apps.googleusercontent.com',
    clientSecret: 'j5in8fHjSBfLkZi5mAc3k3bZ',
    callbackURL: "https://findit.ke/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOne({ googleId: profile.id }, function (err, user) {
      if(!user){
        User.create({
          googleId: profile.id,
          names : profile.displayName,
          email: profile.email,
          username: profile.email
        },function(err, user){
          var holder = email.app;
          var mailer = email.mailer;
          holder.mailer.send('email/welcome', {
            to: email, // REQUIRED. This can be a comma delimited string just like a normal email to field. 
            subject: 'Welcome To FindIt', // REQUIRED.
            otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
          }, function (err) {
            if (err) {
              // handle error
              console.log(err);
              res.send('There was an error sending the email');
              return;
            }
          });
          return done(err, user);
        })
      }else{        
        return done(null, user);
      }      
    }).catch(function(err){
      console.log(err);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: '152589045423306',
    clientSecret: 'e7e3ae226db70be289d5eb8c2ff2dd19',
    callbackURL: "https://findit.ke/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ facebookid: profile.id }, function (err, user) {
      if(!user){
        User.create({
          facebookid: profile.id,
          names : profile.displayName,
          email: profile.id,
          username: profile.id
        },function(err, user){
          return done(err, user);
        })
      }else{        
        return done(null, user);
      }
    }).catch(function(err){
      console.log(err);
    });
  }
));

app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg') || null;
  res.locals.error_msg = req.flash('error_msg') || null;
  res.locals.error = req.flash('error') || null;
  res.locals.user = req.user || null;
  res.locals.forgotpassword = req.get('host');
  if(req.user != null){
    next();
  }else{
     next();
  }
});

app.get('/mail', function (req, res, next) {
  app.mailer.send('email/welcome', {
    to: 'kelvinchege@gmail.com', // REQUIRED. This can be a comma delimited string just like a normal email to field. 
    subject: 'Test Email', // REQUIRED.
    otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
  }, function (err) {
    if (err) {
      // handle error
      console.log(err);
      res.send('There was an error sending the email');
      return;
    }
    res.send('Email Sent');
  });
});

app.get('/logout', function(req, res){
  req.logout();
  req.session = null;
  res.redirect("/");
  res.end();
});

app.post('/login', passport.authenticate('local', {failureRedirect: '/login',
                                   failureFlash: true })
  , function(req, res){
    ssn = req.session;
    console.log(ssn);
    if(ssn.returnUrl){
      res.redirect(ssn.returnUrl);
    }
    res.redirect('/');
});

app.get('/auth/google', passport.authenticate('google', { scope: [
       'https://www.googleapis.com/auth/plus.login',
       'https://www.googleapis.com/auth/plus.profile.emails.read'] 
}));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get( '/auth/google/callback', 
      passport.authenticate( 'google', { 
        failureRedirect: '/login'
  }),
  function(req, res) {
    ssn = req.session;
    if(ssn.returnUrl){
      res.redirect(ssn.returnUrl);
    }
    res.redirect('/');
  });

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    ssn = req.session;
    if(ssn.returnUrl){
      res.redirect(ssn.returnUrl);
    }
    res.redirect('/');
  });

app.use('/users', users);
app.use('/business', business);
app.use('/admin', admin);
app.use('/', index);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
