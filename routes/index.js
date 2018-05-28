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
var elasticsearch = require('elasticsearch');
var Jimp = require("jimp");

var sys = require(__dirname + '/../config/System');
var role = require(__dirname + '/../config/Role');
var User = require('./../models/User');
var Business = require('./../models/Business');
var Category = require(__dirname + '/../models/Category');
var emailModel = require(__dirname + '/../config/Mail');
var Analytics = require(__dirname + '/../models/Analytics');
var Coupons = require(__dirname + '/../models/Coupons');

var mailer = require('express-mailer');

/* GET home page. */
router.get('/nss/:name',function(req, res, next){
	//wait for the initialization
  //console.log(req.params.name);
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
    ],
    approved: true,
    pending: { $ne: true }
  })
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
  var search = Business.search(
    {query_string: {query: req.query.search}},
    {
      from : 0,
      size : 50,
      hydrate: true
    });
  var features = Category.find({name: req.query.search });
  Promise.all([search, features]).then(values => {
    console.log(values[0]);
      res.render('business/list', {
          title: req.query.search,
          businesses: values[0].hits.hits,
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
  var topsearches = Analytics.aggregate([
    {"$group":{
        _id: '$bizid',
        count:{$sum:1}
      }
    },
    { "$sort": { "count": -1 } },
    { "$limit": 5 },
    {
     $lookup:
       {
         from: "businesses",
         localField: "_id",
         foreignField: "_id",
         as: "biz"
       }
     }
  ]);
  var toprestaurants = Analytics.aggregate([
    {"$group":{
        _id: '$bizid',
        count:{$sum:1}
      }
    },
    { "$sort": { "count": -1 } },
    { "$limit": 500},
    {
     $lookup:
       {
         from: "businesses",
         localField: "_id",
         foreignField: "_id",
         as: "biz"
       }
     },
     {
       $project :{
         count: '$count',
         category: {
           $filter: {
             input: "$biz",
             as: "biz",
             cond : [
                 { '$eq': ['$biz.subcategory', 'Restaurants']},
                     1,
                     0
             ]
           }
         }
       }
     }
  ]);

  var coupons = Coupons.find({
    status: true
  }).sort([['order', 1],['star', 1]]);
  var categories = Category.find({approved: true}).sort([['order', 1]]);
  var description = "Find It is a leading online directory to find businesses, service providers and their information in one single platform. Find it or be found. Register today and add your business.";
  var keywords = "Find Restaurants, professional services, Financial help, travel agencies, medical and legal help in Kenya on our platform Findit";
  var title = 'Find It Kenya | Find businesses and service providers in Kenya';
  Promise.all([categories, toprestaurants, topsearches, coupons ]).then(values => {
    res.render('index', {
        title: title,
        categories: values[0],
        toprestaurants: values[1],
        topsearches: values[2],
        coupons: values[3],
        top: req.get('host')
    });
  });
});

router.get('/with-images', function(req, res, next) {
  Business.find({ paid: true }).select('slug photo paid').sort([['order', 1]])
  .then(function(data){
    res.json(data);
    data.forEach(function(element){
      console.log(element);
      element.photo = null;
      element.gallery = null;
      /*element.save(function(err){
        if(err)
          console.log(err);
      });*/
    });
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
    var features = Category.find({
      $query: {
          name: req.params.cat
        }
    }).sort({'subcategories.name': -1});
    Promise.all([businesses, features]).then(values => {
      res.render('business/list', {
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
        approved: true,
        pending: { $ne: true }
      }
    }).sort([['paid', -1],['datepaid', 1],['slug', 1]]);
    var features = Category.find({
        $query: {
          name: req.params.cat
        }
      })
    .sort({'subcategories.name': -1});
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
  var businesses = Business.find({ features: req.params.name, approved: true })
  .sort([['paid', -1],['datepaid', 1],['slug', 1]]);
  var features = Category.find({ subcategories: {$elemMatch: { name: req.params.name}} });

  Promise.all([businesses,features]).then(values => {
    //console.log(values[1]);
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


router.get('/dashboard', role.auth, function(req, res){
  res.render('admin/index', {title: "Find It Dashboard"});
  /*if(req.user.role == 1){
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
  }*/

});

router.get('/businesses', role.auth, function(req, res){
  if(req.user.role == 1){
    Business.find({})
    .then(function(data){
      res.json({ recordsTotal: data.length, data: data});
    })
    .catch(function(err){
      console.log(err);
    });
  }else{
    Business.find({
      user_id : res.locals.user.username
    })
    .then(function(data){
      res.json({ recordsTotal: data.length, data: data});
    })
    .catch(function(err){
      console.log(err);
    });
  }

});

router.get('/datatables', role.auth, function(req, res) {
  if(req.user.role == 1){
    Business.dataTables({
      limit: req.body.length,
      skip: req.body.start,
      sort: {
        name: 1
      }
    }).then(function (table) {
      res.json(table); // table.total, table.data
    })
  }else{
    Business.dataTables({
      limit: req.body.length,
      skip: req.body.start,
      find: {
        user_id: res.locals.user.username
      },
      sort: {
        name: 1
      }
    }).then(function (table) {
      res.json(table); // table.total, table.data
    })
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

router.get('/add-agent',role.auth,function(req, res, next){
  res.render('site/agent');
});

router.get('/elasticmapping', function(req, res){
  Business.createMapping(function(err, mapping){
    if(err){
      console.log('error creating mapping (you can safely ignore this)');
      console.log(err);
    }else{
      console.log('mapping created!');
      console.log(mapping);
    }
  });
});

router.get('/indexsearch/:string', function(req, res){
  console.log(req.params.string);
  var search = Business.search(
    {query_string: {query: req.params.string}},
    {hydrate: true });
  Promise.all([search]).then(values => {
    console.log(values[0]);
      res.render('business/list', {
          title: req.params.string,
          businesses: values[0].hits.hits,
          host: req.get('host')
      });
  });
});

router.get('/indexall', function(req, res){
  var stream = Business.synchronize();
  var count = 0;

  stream.on('data', function(err, doc){
    count++;
  });
  stream.on('close', function(){
    console.log('indexed ' + count + ' documents!');
  });
  stream.on('error', function(err){
    console.log(err);
  });
});

router.get('/elasticsearch', function(req, res){
  var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
  });
  client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
  }, function (error) {
    if (error) {
      console.trace('elasticsearch cluster is down!');
    } else {
      console.log('All is well');
    }
  });
});

router.get('/pay/:bizid', function(req, res){
  Business.findById(req.params.bizid)
  .then(function(b){
    console.log(b);
    res.render('business/pay',{ biz: b });
  });
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
    amount = "2320";
  }else if(package == "silver"){
    amount = "5600";
  }else if(package == "gold"){
    amount = "13920";
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
    data.fakepaid = false;
    b.datepaid = new Date();
    b.user_id = res.locals.user.username;
    var ssn = req.session;
    b.agentphone = ssn.agentnumber;
    //if(amount == "2320"){
    if(amount == "2320.00"){
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
    }else if(amount == "5600.00"){
      b.packagepaid = "silver";
          var holder = emailModel.app;
          var mailer = emailModel.mailer;
          holder.mailer.send('email/silver', {
            to: ssn.email, // REQUIRED. This can be a comma delimited string just like a normal email to field.
            subject: 'Payment Confirmed', // REQUIRED.
            otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
          }, function (err) {
            if (err) {
              console.log(err);
              res.send('There was an error sending the email');
              return;
            }
          });
    }else if(amount == "13920.00"){
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
        }else{
          req.flash('success_msg', 'Email Sent');
          res.redirect('/');
        }
      });

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

router.get('/biz/analytics/:bizid', function(req, res, next){
  var analytics = new Analytics();
    analytics.ip = req.headers['x-forwarded-for'];
    analytics.time = new Date();
    analytics.bizid = req.params.bizid;
    analytics.category = "2";
    analytics.save(function(err){
      if(err){
        console.log(err);
      }else{
        console.log("logged");
      }
    });

});

router.get('/coupons',role.auth, function(req, res){
  Coupons.find({
    status: true
  })
    .populate('bizid')
    .then(function(data){
        res.render('coupons/index', {title: "Coupons", coupons: data});
    })
    .catch(function(err){
         console.log(err);
    });
});

router.get('/getcoupon/user/:id', role.auth, function(req, res){
  couponCode = 'coupon-' + Math.random().toString(36).substr(2, 8);
  Coupons.findById(req.params.id)
    .populate('bizid')
    .then(function(coupon){
      console.log();
      if(coupon.users.some(function(x) { return x.user_id == res.locals.user.id })){
        res.json({msg: 'You Have Already Used This Coupon'});
      }else{
        coupon.users.push({
          user_id: res.locals.user.id,
          code: couponCode,
          status: true
        });
        coupon.save(function(err){
          if(err){
            res.json({msg: 'You Probably Had a Coupon From This Offer Already'});
          }else{
            res.json({msg: 'Coupon Obtained'});
          }
        });
      }

    })
    .catch(function(err){
         console.log(err);
    });
});

router.get('/removecoupon/:id', role.auth, function(req, res){
  Coupons.findOne({
    'users.user_id' : req.params.id
  })
  .then(function(coupon){
    if(coupon.users.some(function(x) { return x.user_id == res.locals.user.id })){
      newusers = coupon.users.filter(function(el) {
          return el.user_id != req.params.id;
      });
      coupon.users = newusers;
      coupon.save(function(err){
        if(err){
          res.json({msg: 'Kindly try later'});
        }else{
          res.json({msg: 'Coupon Removed'});
        }
      });
    }else{
      res.json({msg: 'You done have this coupon'});
    }
  })
  .catch(function(err){
       console.log(err);
  });
});

router.get('/api/mycoupons', role.auth, function(req, res){
  Coupons.find({
      'users.user_id' : res.locals.user.id,
      'status': true
    })
  .populate('bizid')
  .populate('users.user_id','status code')
    .then(function(data){
      res.json({mycoupons: data, code: 100});
    })
    .catch(function(err){
      res.json({msg: 'Error Occured', code: 101});
    });

});

/*
router.get('/analytics/graph/:bizid', function(req, res, next){
  Analytics.aggregate([
    {"$match": { "bizid": req.params.bizid}},
    {
      $project: {
        yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$time" } },
        category: '$category'
      }
    },
    {"$group":{
        _id: '$yearMonthDay',
        contacts: {
          $sum: {
            '$cond': [
                { '$eq': ['$category', '2']},
                    1,
                    0
            ]
          }
        },
        views: {
          $sum: {
            '$cond': [
                { '$eq': ['$category', '3']},
                    1,
                    0
            ]
          }
        }
      }
    },
    { "$sort": { "_id": -1 } }
  ], function(err, rst){
    var result = Object.keys(rst).map(function(key) {
      return [Number(key), rst[key].views, rst[key].contacts];
    });
    res.send(result);
  });
});*/

router.get('/popular', function(req, res, next){
  Analytics.aggregate([
    {"$group":{
        _id: '$bizid',
        count:{$sum:1}
      }
    },
    { "$sort": { "count": -1 } },
    { "$limit": 5 },
    {
     $lookup:
       {
         from: "businesses",
         localField: "_id",
         foreignField: "_id",
         as: "biz"
       }
     }
  ], function(err, rst){
    res.json(rst);
  });
});

router.get('/popular/hotels', function(req, res, next){
  Analytics.aggregate([
    {"$group":{
        _id: '$bizid',
        count:{$sum:1}
      }
    },
    { "$sort": { "count": -1 } },
    { "$limit": 500},
    {
     $lookup:
       {
         from: "businesses",
         localField: "_id",
         foreignField: "_id",
         as: "biz"
       }
     },
     {
       $project :{
         count: '$count',
         category: {
           $filter: {
             input: "$biz",
             as: "biz",
             cond : [
                 { '$eq': ['$biz.subcategory', 'Restaurants']},
                     1,
                     0
             ]
           }
         }
       }
     }
  ], function(err, rst){
    res.json(rst);
  });
});

router.get('/preview/:name',function(req, res, next){
  Business.findOne({
    slug: req.params.name,
    approved: true
  })
  .then(function(data){
    console.log(data);
    var phones = data.phone.split(",");
    var emails = data.email.split(",");
    var now = moment();
    delete data.hours.$init;
    //console.log(data);
    var openingTimesMoment = new OpeningTimes(data.hours, 'Africa/Nairobi');
    data.openstatus = openingTimesMoment.getStatus(now);

      //console.log(similarbiz);
      if(data.paid == false || typeof data.paid === 'undefined'){
        description = data.name + ', '+ data.subcategory + ', ' + data.street +', '+data.city + ' Kenya';
        res.render('business/freedetail',{title: data.name, biz: data, phones: phones, emails: emails, preview: true});
        res.end();
      }else{
        description = data.description;
        res.render('business/detail',{title: data.name, biz: data, phones: phones, emails: emails, description: description, preview: true});
        res.end();
      }
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  });
});

router.get('/:name',function(req, res, next){
  Business.findOne({
    slug: req.params.name,
    approved: true,
    pending: { $ne: true }
  })
  .then(function(data){
    var phones = data.phone.split(",");
    var emails = data.email.split(",");
    var now = moment();
    delete data.hours.$init;
    //console.log(data);
    var openingTimesMoment = new OpeningTimes(data.hours, 'Africa/Nairobi');
    data.openstatus = openingTimesMoment.getStatus(now);

    var analytics = new Analytics();
    analytics.ip = req.headers['x-forwarded-for'];
    analytics.time = new Date();
    analytics.bizid = data.id;
    analytics.category = "3";
    analytics.save(function(err){
      if(err){
        console.log(err);
      }else{
        console.log("logged");
      }
    });

    //SIMILAR BUSINESSES
    //"author": { "$in": userIds }
    var businesses = Business.find({
      $query: {
        subcategory: data.subcategory,
        features: { "$in": data.features },
        slug: { "$ne": data.slug },
        approved: true
      }
    })
    .sort([['paid', -1],['datepaid', 1],['slug', 1]])
    .limit(5)
    .then(function(similarbiz){
      //console.log(similarbiz);
      if(data.paid == false || typeof data.paid === 'undefined'){
        description = data.name + ', '+ data.subcategory + ', ' + data.street +', '+data.city + ' Kenya';
        keywords = data.keywords + " | on Findit Kenya";
        console.log(description);
        res.render('business/freedetail',{title: data.name, biz: data, phones: phones, emails: emails, similarbiz: similarbiz, keywords: keywords});
        res.end();
      }else{
        description = data.description;
        keywords = data.keywords + " | on Findit Kenya";
        console.log(description);
        res.render('business/detail',{title: data.name, biz: data, phones: phones, emails: emails, description: description, similarbiz: similarbiz, keywords: keywords});
        res.end();
      }
    });
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  });
});


module.exports = router;
