var express = require('express');
var app = require('express')();
var router = express.Router();

var bcrypt = require('bcryptjs');
var slug = require('slug');
var moment = require('moment');
var url = require('url');
var crypto = require("crypto");
const fs = require('fs');
var path = require('path');
const { URL } = require('url');
const OpeningTimes = require('moment-opening-times');
var request = require('request');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
var nodemailer = require('nodemailer');
var md5 = require('md5');
var validator = require('validator');

var sys = require(__dirname + '/../config/System');
var role = require(__dirname + '/../config/Role');
var User = require('./../models/User');
var Business = require('./../models/Business');
var Category = require(__dirname + '/../models/Category');
var transporter = require(__dirname + '/../config/Email');
var emailModel = require(__dirname + '/../config/Mail');

var mailer = require('express-mailer');

/* GET home page. */
router.get('/nss/:name',function(req, res, next){
	//wait for the initialization
  console.log(req.params.name);
  Business.find({$or: [
    {
      name: { "$regex": req.params.name, "$options": "i" }
    }, 
    {
      keywords: { "$regex": req.params.name, "$options": "i" }
    },
    {
      subcategory: { "$regex": req.params.name, "$options": "i" }
    }
    ],approved: true})
  .select('-_id slug description name website')
  .then(function(data){
    res.json(data);
  });
});

router.get('/email', function (req, res, next) {
  var holder = emailModel.app;
  var mailer = emailModel.mailer;
  holder.mailer.send('email/forgotpassword', {
    to: 'kelvinchege@gmail.com', // REQUIRED. This can be a comma delimited string just like a normal email to field. 
    subject: 'Welcome To FindIt', // REQUIRED.
    forgotpasswordlink:  req.get('host') + '/resetpassword/xxxxxx',// All additional properties are also passed to the template as local variables.
  }, function (err) {
    if (err) {
      // handle error
      console.log(err);
      res.send('There was an error sending the email');
      return;
    }
  });
});

router.get('/search',function(req, res, next){
  //wait for the initialization
  var businesses = Business.find({$or: [
    {
      name: { "$regex": req.query.search, "$options": "i" }
    },
    {
      keywords: { "$regex": req.query.search, "$options": "i" }
    },
    {
      subcategory: { "$regex": req.query.search, "$options": "i" }
    },
    {
      slug: { "$regex": req.query.search, "$options": "i" }
    },
    {
      features: { "$regex": req.query.search, "$options": "i" }
    }
    ],approved: true})
  .sort([['paid', -1],['datepaid', 1],['slug', 1]]);

  var searchstring = req.query.search.charAt(0).toUpperCase() + req.query.search.slice(1)

  var features = Category.find({name: searchstring });
  Promise.all([businesses, features]).then(values => {
    console.log(values[1]);
      res.render('business/list', { 
          title: req.params.search,
          businesses: values[0],
          features: values[1],
          host: req.get('host')
      });
    });
});

router.get('/moment',function(req,res){
    console.log(moment('20-01-2012 19:43:00', 'DD-MM-YYYY HH:mm'));
});

router.get('/fetchCat/:name',function(req, res, next){
  //wait for the initialization
  Category.findOne({name: req.params.name})
  .then(function(data){
    res.json(data);
  });
});

router.get('/', function(req, res, next) {
  Category.find({approved: true})
  .then(function(data){
      res.render('index', { title: 'Find It Kenya | Find businesses and service providers in Kenya' , categories: data});
  })
  .catch(function(err){
       console.log(err);
  });  
});

router.get('/category/:cat',function(req, res, next){
  if(req.params.cat == 'Events'){
    var businesses = Business.find({
      $query: {subcategory: req.params.cat, approved: true},
      $orderby: { starteventdate: -1 },
      "starteventdate": { $gt: new Date() }
    });
    var features = Category.find({name: req.params.cat });
    Promise.all([businesses, features]).then(values => {
      res.render('business/eventslist', { 
          title: req.params.cat,
          businesses: values[0],
          features: values[1],
          host: req.get('host')
      });
    });
  }else{
    var businesses = Business.find({
      $query: {
        subcategory: req.params.cat,
        approved: true
      }
    }).sort([['paid', -1],['datepaid', 1],['slug', 1]]);
    var features = Category.find({name: req.params.cat });
    Promise.all([businesses, features]).then(values => {
      res.render('business/list', { 
          title: req.params.cat,
          businesses: values[0],
          features: values[1]
      });
    });
  }
      //res.render('business/list', { title: 'Businesses on ', businesses: data});
});

router.get('/subcategory/:name', function(req, res, next){
  var businesses = Business.find({ features: req.params.name, approved: true });
  var features = Category.find({ subcategories: {$elemMatch: { name: req.params.name}} });
  Promise.all([businesses,features]).then(values => {
    res.render('business/list', { 
        title: req.params.cat,
        businesses: values[0],
        features: values[1],
        subcategory: req.params.name
    });
  });
});

router.get('/nearby/:category/:name', function(req, res, next){
  var businesses = Business.find({subcategory: req.params.category, features: req.params.name});
  var features = Category.find({ subcategories: {$elemMatch: { name: req.params.name}} });
  Promise.all([businesses, features]).then(values => {
    res.render('business/nearby', {
        title: req.params.cat,
        businesses: values[0],
        features: values[1][0],
        cuisine: req.params.name
    });
  });
});

router.post('/register',
  [
  check('names', 'Full name can not be empty')
    .exists(),
  check('phone', 'Phone should have 10 characters')
    .isLength({ min: 10, max: 10 }),
  check('email')
    .isEmail().withMessage('must be an email')
    .trim()
    .normalizeEmail(),

  // General error messages can be given as a 2nd argument in the check APIs
  check('password', 'passwords must be at least 5 chars long and contain one number')
    .isLength({ min: 4 })
    .matches(/\d/)
    .custom((value,{req, loc, path}) => {
        if (value !== req.body.cpassword) {
            // trow error if passwords do not match
            throw new Error("Passwords don't match");
        } else {
            return value;
        }
    }),  
  ],
   (req, res, next) => {
    // Get the validation result whenever you want; see the Validation Result API for all options!
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.mapped());
      res.render('user/register', { validationerrors: errors.mapped() });
    }else{
      var names = req.body.names;
      var phone = req.body.phone;
      var username = req.body.email;
      var email = req.body.email;
      var password = req.body.password;
      var role = 0;
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);

      User.findOne({username: req.body.email}, function(err, resad){
          if(err){
            console.log(err);
            throw new Error('Something went wrong, kindly try again');
          }
          if (!resad){
            User.create({
                id: slug(names),
                username: email,
                email: email,
                names: names,
                password: hash,
                phone: phone,
                role: role,
            }, function (err, small) {
              if (err) {
                console.log(err.errmsg);
                throw new Error(err);
                //res.json(err);
                //return handleError(err);
              }
              if(small){
                var holder = emailModel.app;
                var mailer = emailModel.mailer;
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
                req.flash('success_msg','Registration was Successful. Kindly Login');
                res.redirect(200, '/login');
              }
            // saved!
            });
          }               
      });
    }
  }
);

router.get('/dashboard', role.auth, function(req, res){
  if(req.user.role == 1){
    Business.find({})
    .then(function(data){
      res.render('admin/index', {title: "Find It Dashboard", businesses: data});
    })
    .catch(function(err){
       console.log(err);
    });
  }else{
    Business.find({
      user_id : res.locals.user.username
    })
    .then(function(data){
      res.render('admin/index', {title: "Find It Dashboard", businesses: data});
    })
    .catch(function(err){
       console.log(err);
    });
  }
    
});

router.get('/profile', function(req, res){
  res.render('admin/profile', {title: "Profile"});
});

router.get('/login', function(req, res){
  res.render('user/login', {title: "Sign Up"});
});

router.get('/register', function(req, res){
  res.render('user/register', {title: "Login"});
});

router.get('/terms-and-conditions',function(req, res, next){
  res.render('site/terms');
});

router.get('/privacy-policy',function(req, res, next){
  res.render('site/privacy');
});

router.get('/claim-form/:id/', role.auth, function(req, res, next){
  res.render('site/formclaim', {title: "Choose Package", bizid: req.params.id});
});

router.post('/claim/:id/', role.auth, function(req, res){
  ssn = req.session;
  ssn.hashkey = "852sokompare963001";
  ssn.vendor_id = "sokompare";
  var package = req.body.package;
  ssn.agentnumber = req.body.agentnumber;
  ssn.email = req.body.email;
  var amount = 0;
  if(package == "bronze"){
    //amount = "2320";
    amount = "10";
  }else if(package == "silver"){
    amount = "11";
  }else if(package == "gold"){
    amount = "9";
  }
  var fields = {
    "live":"1",
    "oid": req.params.id,
    "inv": "invoiceid"+req.params.id,
    "ttl": amount,
    "tel": req.body.phone,
    "eml": req.body.email,
    "vid": ssn.vendor_id,
    "curr": "KES",
    "p1": req.params.id,
    "p2": "",
    "p3": "",
    "p4": "",
    "lbk": 'https://'+req.get('host')+'/cancel',
    "cbk": 'https://'+req.get('host')+'/receive',
    "cst": "1",
    "crl": "0"
  };
  var datastring =  fields['live']+fields['oid']+fields['inv']+
    fields['ttl']+fields['tel']+fields['eml']+fields['vid']+fields['curr']+fields['p1']+fields['p2']
    +fields['p3']+fields['p4']+fields['cbk']+fields['cst']+fields['crl'];
  var hash = crypto.createHmac('sha1',ssn.hashkey).update(datastring).digest('hex');
  res.render('business/claim', {title: "Pay",hash: hash, inputs: fields, datastring: datastring, package: package});
});

router.get('/receive', function(req, res){
  var val = "sokompare";
  var val1 = req.query.id;
  var val2 = req.query.ivm;
  var val3 = req.query.qwh;
  var val4 = req.query.afd;
  var val5 = req.query.poi;
  var val6 = req.query.uyt;
  var val7 = req.query.ifd;
  var bizId = req.query.p1;
  var array = req.query.p2;
  var status = req.query.status;
  var amount = req.query.mc;

  var ipnurl = "https://www.ipayafrica.com/ipn/?vendor="+val+"&id="+val1+"&ivm="+val2+"&qwh="+val3+"&afd="+val4+"&poi="+val5+"&uyt="+val6+"&ifd="+val7;
  //console.log(ipnurl);
  Business.findById(val1)
  .then(function(b){
    b.paid = true;
    b.amountpaid = amount;
    b.datepaid = new Date();
    b.user_id = res.locals.user.username;
    var ssn = req.session;
    b.agentphone = ssn.agentnumber;
    //if(amount == "2320"){
    if(amount == "10.00"){
      b.packagepaid = "bronze";

          var holder = emailModel.app;
          var mailer = emailModel.mailer;
          holder.mailer.send('email/bronze', {
            to: ssn.email, // REQUIRED. This can be a comma delimited string just like a normal email to field. 
            subject: 'Payment Confirmed', // REQUIRED.
            otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
          }, function (err) {
            if (err) {
              // handle error
              console.log(err);
              res.send('There was an error sending the email');
              return;
            }
          });
    }else if(amount == "11.00"){
      b.packagepaid = "silver";
          var holder = emailModel.app;
          var mailer = emailModel.mailer;
          holder.mailer.send('email/silver', {
            to: ssn.email, // REQUIRED. This can be a comma delimited string just like a normal email to field. 
            subject: 'Payment Confirmed', // REQUIRED.
            otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
          }, function (err) {
            if (err) {
              // handle error
              console.log(err);
              res.send('There was an error sending the email');
              return;
            }
          });
    }else if(amount == "9.00"){
      b.packagepaid = "gold";
      var holder = emailModel.app;
          var mailer = emailModel.mailer;
          holder.mailer.send('email/gold', {
            to: ssn.email, // REQUIRED. This can be a comma delimited string just like a normal email to field. 
            subject: 'Payment Confirmed', // REQUIRED.
            otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
          }, function (err) {
            if (err) {
              // handle error
              console.log(err);
              res.send('There was an error sending the email');
              return;
            }
          });
    }
    request(ipnurl, function (error, response, body) {
      //console.log(body); // Print the HTML for the Google homepage.
      //res.send("Status > " + status + ", Body > " +body);
      //res.end();
      if(body == status){        
        b.save(function(err){
          req.flash('success_msg', 'Payment Successfully Done!');
          if(err)
            res.redirect('/'+b.slug);
          res.redirect('/'+b.slug);
        });
      }else{
        req.flash('error', 'Transaction Already Authenticated!');
        res.redirect('/'+b.slug);
      }
    });
  })
  .catch(function(err){
    console.log(err);
  });
});

router.get('/agent/:slug', function(req, res){
  res.render('site/agent');
});

router.get('/forgotpassword', function(req, res){
  res.render('user/forgotpassword');
});

router.post('/resetpassword/:id', function(req, res){
  var rst = validator.equals(req.body.password, req.body.cpassword);
  if(rst == false){
    req.flash('error','Password Mismatch');
    res.redirect(ssn.returnUrl);
  }
  else if(req.body.password.length < 4){
    req.flash('error','Password Length Should be More Than Four Characters');
    res.redirect(ssn.returnUrl);
  }else{
    User.findById(req.params.id)
    .then(function(d){
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(req.body.password, salt);
      d.password = hash;
      console.log(d);
      d.save(function(err){
        if(err){
          req.flash('error','Some Error Occured, Kindly try again');
          res.redirect(ssn.returnUrl);
        }else{
          req.flash('success_msg','Password Changed Successfully');
          res.redirect('/login');
        }
      });
    })
    .catch(function(err){
       console.log(err);
    });
  }
});

router.get('/resetpassword/:id/:resetcode', function(req, res){
  User.findOne({
    _id: req.params.id,
    resetcode: req.params.resetcode
  })
  .then(function(d){
    if(!d){
      req.flash('error_msg','The Password Reset Link is not Valid');
      res.redirect('/forgotpassword');
    }else{
      ssn = req.session;
      ssn.returnUrl = req.originalUrl;
      res.render('user/passwordreset',{id: req.params.id});
    }    
  })
  .catch(function(err){
     console.log(err);
  });
});


router.post('/forgotpassword', function(req, res){
  User.findOne({
    email: req.body.email
  })
  .then(function(d){
    var salt = bcrypt.genSaltSync(10);
    var date = new Date();
    var hash = md5(date.toString());
    console.log(hash);
    
    d.resetcode = hash;
    console.log(d);
    d.save(function(err){
      if(err){
        req.flash('error', 'Error occured when updating agent number');
        res.redirect('/');
      }
      var holder = emailModel.app;
      var mailer = emailModel.mailer;
      holder.mailer.send('email/forgotpassword', {
        to: d.email, // REQUIRED. This can be a comma delimited string just like a normal email to field. 
        subject: 'FindIt Password Recovery', // REQUIRED.
        forgotpasswordlink:  'https://' + req.get('host') + '/resetpassword/'+d.id+'/'+hash, // All additional properties are also passed to the template as local variables.
      }, function (err) {
        if (err) {
          // handle error
          console.log(err);
          res.send('There was an error sending the email');
          return;
        }
      });
      req.flash('success_msg', 'Email Sent');
      res.redirect('/');
    });
  })
  .catch(function(err){
     req.flash('error_msg', 'Email Sent');
      res.redirect('/forgotpassword');
  });
});

router.post('/agent/:slug', function(req, res){
  Business.findOne({
    slug: req.params.slug
  })
  .then(function(data){ 
    console.log(data);
    data.agentphone = req.body.phone;
    data.save(function(err){
      console.log(err);
      if(err){
        req.flash('error', 'Error occured when updating agent number');
        res.redirect('/'+req.params.slug);
      }
      req.flash('success_msg', 'Agent number Successfully Updated');
      res.redirect('/'+req.params.slug);
    });    
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  });
});

router.get('/:name',function(req, res, next){
  Business.findOne({
    slug: req.params.name,
    approved: true
  })
  .then(function(data){
    var phones = data.phone.split(",");
    var emails = data.email.split(",");
    var now = moment();
    delete data.hours.$init;
    //console.log(data);
    var openingTimesMoment = new OpeningTimes(data.hours, 'Africa/Nairobi');     
    data.openstatus = openingTimesMoment.getStatus(now);  
    console.log(data.openstatus.isOpen); 
    if(data.paid == false || typeof data.paid === 'undefined'){
      res.render('business/freedetail',{title: data.name, biz: data, phones: phones, emails: emails});
      res.end();
    }else{
      res.render('business/detail',{title: data.name, biz: data, phones: phones, emails: emails});
      res.end();
    }    
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  });
});


module.exports = router;