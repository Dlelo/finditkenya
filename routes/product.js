var express = require('express');
var router = express.Router();

var slug = require('slug');
var multer  = require('multer');
var mime = require('mime');
var moment = require('moment');
var hmacsha1Generate = require('hmacsha1-generate');
var crypto = require("crypto");
var Jimp = require("jimp");
var bcrypt = require('bcryptjs');
const OpeningTimes = require('moment-opening-times');

var role = require(__dirname + '/../config/Role');
var Category = require(__dirname + '/../models/Category');
var Subcategory = require(__dirname + '/../models/Subcategory');
var Business = require(__dirname + '/../models/Business');
var Agents = require(__dirname + '/../models/Agent');
var Users = require(__dirname + '/../models/User');
var Analytics = require(__dirname + '/../models/Analytics');
var Coupons = require(__dirname + '/../models/Coupons');
var emailModel = require(__dirname + '/../config/Mail');
var Product = require(__dirname + '/../models/Product');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/product/')
  },
  filename: function (req, file, cb) {
    var fileName = Date.now() + slug(file.originalname) +'.'+ mime.extension(file.mimetype);
    cb(null, fileName);
  }
});

var upload = multer({ storage: storage });
var cpUpload = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'catalog', maxCount: 5 }, { name: 'gallery', maxCount: 20 }])

router.get('/',function(req, res){
  console.log(req.session.cart);
  Product.find({
  })
  .then(function(data){
    //console.log(data);
    res.render('product/index',{title: "Products on Findit", products: data});
  })
  .catch(function(err){
     console.log(err);
  });
});

router.get('/new',role.auth, function(req, res){
  if(res.locals.user.role == '1'){
    Business.find({
    })
    .then(function(data){
      res.render('product/new',{title: "New Product", businesses: data});
    })
    .catch(function(err){
       console.log(err);
    });
  }else{
    Business.find({
      user_id : res.locals.user.username
    })
    .then(function(data){
      res.render('product/new',{title: "New Product", businesses: data});
    })
    .catch(function(err){
       console.log(err);
    });
  }
});

router.post('/create',role.auth, cpUpload, function(req, res){
  var p = new Product();
  p.name = req.body.name;
  p.slug = slug(req.body.name);
  p.description = req.body.description;
  if (req.files['photo'] != null){
		p.photo = req.files['photo'][0].filename;
	}
  p.price = req.body.price;
  p.quantity = req.body.quantity;
  p.status = req.body.status;
  p.save(function(err){
    if(err)
      console.log("err");
    Jimp.read("./public/uploads/product/"+p.photo).then(function (cover) {
        return cover.resize(200, 140)     // resize
             .quality(100)                // set greyscale
             .write("./public/uploads/product/thumbs/"+p.photo); // save
    }).catch(function (err) {
        console.error(err);
    });
    res.redirect('/product/new');
  });
});

router.get('/cart',function(req, res){
  if(req.session.cart){
    res.render('product/cart',{cart: req.session.cart});
  }else{
    res.render('product/cart',{cart: []});
  }
});

router.get('/clearcart',function(req, res){
  req.session.cart = [];
  res.redirect('/product');
});

router.get('/api/:slug',function(req, res){
  Product.findOne({
    slug: req.params.slug,
    //status: true
  }).lean().then(function(d){
    if(req.session.cart > 0){
      d.count = 1;
      var unique = false;
      console.log("parameters");
      console.log(req.session.cart.length);
      console.log(index);
      req.session.cart.forEach(function(i,index){
        if(i.id == d.id){
          i.count = i.count + 1;
          unique = true;
        }

        if(index == req.session.cart.length - 1){
          if(unique == false){
            req.session.cart.push(d);
          }
        }
      });
    }else{
      req.session.cart = [];
      d.count = 1;
      console.log(d);
      req.session.cart.push(d);
    }
    console.log(req.session.cart);
    res.json(req.session.cart.length);
  })
});

router.get('/:slug',function(req, res){
  Product.findOne({
    slug: req.params.slug,
    //status: true
  })
  .then(function(d){
    //console.log(d);
    res.render('product/detail',{product: d,title: d.name});
  })
});

module.exports = router;
