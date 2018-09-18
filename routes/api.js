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
var Typo = require("typo-js");
var dictionary = new Typo("en_US");
var Fuse = require("fuse.js");
var _ = require('lodash');
var nationalities = require(__dirname + '/../models/Nationalities');

var sys = require(__dirname + '/../config/System');
var role = require(__dirname + '/../config/Role');
var User = require('./../models/User');
var Business = require('./../models/Business');
var Category = require(__dirname + '/../models/Category');
var emailModel = require(__dirname + '/../config/Mail');
var Analytics = require(__dirname + '/../models/Analytics');
var Coupons = require(__dirname + '/../models/Coupons');
var Review = require(__dirname + '/../models/Reviews');

var mailer = require('express-mailer');

router.get('/home',function(req, res){
  var categories = Category.find({approved: true,group: 'general'}).sort([['order', 1]]);
  Promise.all([categories]).then(values => {
    //console.log(values[4]);
    res.json({
        categories: values[0]
    });
  });
});

router.get('/category/:cat',function(req, res, next){
    var businesses = Business.find({
      $query: {
        subcategory: req.params.cat,
        approved: true
        //pending: { $ne: true }
      }
    }).sort([['paid', -1],['datepaid', 1],['slug', 1]]);

    var features = Category.aggregate([
      { $match: { name: req.params.cat } },
      { "$unwind": "$subcategories" },
      { "$sort": { "subcategories.name": 1 } }
    ]);
    var categories = Category.find({approved: true,group: 'general'}).sort([['order', 1]]);
    Promise.all([businesses, features, categories]).then(values => {
      //console.log(values[1]);
      res.json({
          title: req.params.cat,
          businesses: values[0],
          features: values[1],
          categories: values[2],
          host: req.get('host')
      });
    });
      //res.render('business/list', { title: 'Businesses on ', businesses: data});
});

module.exports = router;
