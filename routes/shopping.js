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
var request = require('request');
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
var Sale = require(__dirname + '/../models/Sales');

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

router.get('/newcategory',function(req, res){
  res.render('admin/addcategory');
});

router.get('/newsubcategory',function(req, res){
  Category.find({{group:'shopping'}})
	.then(function(data){
	  	//console.log(data);
	    res.render('admin/addsubcategory',{title: "Find It Categories", categories: data, group: 'shopping'});
	})
	.catch(function(err){
	     console.log(err);
	});
});

router.post('/category/add', role.admin, cpUpload, function(req, res, next){
  var i = new Category();
	i.name = req.body.name;
	i.icon = req.body.icon;
	i.order = req.body.order;
  i.group = req.body.group;
  if (req.files['photo'] != null){
		i.photo = req.files['photo'][0].filename;
	}
	i.save(function(err){
		if(err)
			res.render('admin/addcategory');
    if (req.files['photo'] != null){
				Jimp.read("./public/uploads/"+i.photo).then(function (cover) {
				    return cover.resize(200, 150)     // resize
				         .quality(100)              // set greyscale
				         .write("./public/uploads/thumbs/categories/"+i.photo); // save
				}).catch(function (err) {
				    console.error(err);
				});
			}else{
				req.flash("success_msg", "Category Successfully Created");
				res.redirect('/admin/category');
			}
		res.redirect('/admin/category');
	});
});

router.get('/viewcategories',function(req, res){
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
