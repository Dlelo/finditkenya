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

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    var fileName = file.originalname + '-' + Date.now() + '.' + mime.extension(file.mimetype);
    cb(null, fileName);
  }
});

var upload = multer({ storage: storage });
var cpUpload = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'catalog', maxCount: 5 }, { name: 'gallery', maxCount: 20 }])

router.post('/edit/:id', role.auth, cpUpload, function(req, res, next) {
	Business.findById(req.params.id)
	.then(function(b){
	    b.name = req.body.name
		b.slug = slug(req.body.name);
		b.description = req.body.description;
		b.city = req.body.city;
		b.map = {lati: req.body.lati, long: req.body.long, zoom: req.body.zoom };
		b.website = req.body.website;
		b.phone = req.body.phone;
		b.email = req.body.email;
		if (req.files['catalog'] != null){
			b.catalog = req.files['catalog'];
		}
		if (req.files['photo']){
		  b.photo = req.files['photo'][0].filename;
		}
		if(req.body.category){
			b.category = req.body.category;
		}
		b.startdate = req.body.startdate;
		if(req.body.subcategory){
			b.subcategory = req.body.subcategory;
		}
		if(req.body.ssubcategory){
			b.features = req.body.ssubcategory;
		}
		b.keywords = req.body.keywords;

		if(req.files['gallery']){
			b.gallery = req.files['gallery'];
		}
		b.user_id = res.locals.user.username;
	    b.hoursopen = req.body.hoursopen;
	    b.hoursclose = req.body.hoursclose;
	    b.extras = req.body.extras;
	    b.street = req.body.street;
	    b.building = req.body.building;

	    //Social links
	    b.facebook = req.body.facebook;
	    b.twitter = req.body.twitter;
	    b.instagram = req.body.instagram;
	    b.youtube = req.body.youtube;
	    b.linkedin = req.body.linkedin;

	    //Booking and Ordering
	    b.bookinglink = req.body.bookinglink;
	    b.deliverylink = req.body.deliverylink;

	    if(req.body.hoursopensun){
	    	b.hours.sunday = [];
	    	b.hours.sunday.push({opens: req.body.hoursopensun, closes: req.body.hoursclosesun});
		}
		if(req.body.hoursopenmon){
			b.hours.monday = [];
			b.hours.monday.push({opens: req.body.hoursopenmon, closes: req.body.hoursclosemon});
		}
		if(req.body.hoursopentue){
			b.hours.tuesday = [];
			b.hours.tuesday.push({opens: req.body.hoursopentue, closes: req.body.hoursclosetue});
		}
		if(req.body.hoursopenwed){
			b.hours.wednesday = [];
			b.hours.wednesday.push({opens: req.body.hoursopenwed, closes: req.body.hoursclosewed});
		}
		if(req.body.hoursopenthu){
			b.hours.thursday = [];
			b.hours.thursday.push({opens: req.body.hoursopenthu, closes: req.body.hoursclosethu});
		}
		if(req.body.hoursopenfri){
			b.hours.friday = [];
			b.hours.friday.push({opens: req.body.hoursopenfri, closes: req.body.hoursclosefri});
		}
		if(req.body.hoursopensat){
			b.hours.saturday = [];
			b.hours.saturday.push({opens: req.body.hoursopensat, closes: req.body.hoursclosesat});
		}

	    if(req.body.starteventdate){
	    	b.starteventdate = new Date(moment(req.body.starteventdate, 'MM-DD-YYYY HH:mm:ss'));
	    }
	    if(req.body.endeventdate){
	    	b.endeventdate = new Date(moment(req.body.endeventdate, 'MM-DD-YYYY HH:mm:ss'));
	    }

		b.save(function(err){
			if(err){
				console.log(err);
				res.redirect('/dashboard');
			}else{
				if (req.files['photo']){
					Jimp.read("./public/uploads/"+b.photo).then(function (cover) {
					    return cover.resize(200, 140)     // resize
					         .quality(100)                // set greyscale
					         .write("./public/uploads/thumbs/cover"+b.photo); // save
					}).catch(function (err) {
					    console.error(err);
					});
				}
				if(b.gallery){
					b.gallery.forEach(function(gallery) {
					  	Jimp.read("./public/uploads/"+gallery.filename).then(function (cover) {
						    return cover.resize(200, 140)     // resize
						         .quality(100)                // set greyscale
						         .write("./public/uploads/thumbs/gallery-"+gallery.filename); // save
						}).catch(function (err) {
						    console.error(err);
						});
					});
				}
				res.redirect('/dashboard');
			}
			b.on('es-indexed', function(err, res){
		    if (err) throw err;
		    /* Document is indexed */
		    });
		});
	})
	.catch(function(err){
	     console.log(err);
	});
	//res.send("post data");
});

router.get('/edit/:id',role.auth, function(req, res, next){
	var business = Business.findOne({
	  _id: req.params.id
	});
	var categories = Category.find({});

	Promise.all([business, categories]).then(values => {
		var now = moment();
	    delete values[0].hours.$init;
	    //console.log(data);
	    var openingTimesMoment = new OpeningTimes(values[0].hours, 'Africa/Nairobi');
	    values[0].openstatus = openingTimesMoment.getStatus(now);
	    console.log(values[0].openstatus);
	    res.render('admin/edit', {
	        title: "Edit "+values[0].name,
	        biz: values[0],
	        categories: values[1]
	    });
	  });
});

router.get('/delete/:id',role.auth, function(req, res, next){
	if(req.user.role == 1){
		Business.findOneAndRemove({
		  _id: req.params.id
		})
		.then(function(data){
		    res.redirect('/dashboard');
		})
		.catch(function(err){
		     console.log(err);
		});
	}else{
		Business.findOneAndRemove({
		  _id: req.params.id,
		  user_id : res.locals.user.username
		})
		.then(function(data){
		    res.redirect('/dashboard');
		})
		.catch(function(err){
		     console.log(err);
		});
	}
});

router.get('/fakepaid/:id',role.admin, function(req, res, next){
		Business.findById(req.params.id)
		.then(function(data){
		    if(data.paid == true){
		    	data.paid = false;
		    	data.fakepaid = false;
		    }else if(data.paid == false){
		    	data.paid = true;
		    	data.fakepaid = true;
		    	data.packagepaid = 'silver';
		    }else{
		    	data.paid = true;
		    	data.fakepaid = true;
		    	data.packagepaid = 'silver';
		    }
		    data.save(function(err){
				if(err)
					res.redirect('/dashboard');
				res.redirect('/dashboard');
			});
		})
		.catch(function(err){
		     console.log(err);
		});
});

router.get('/analytics/:id',role.auth, function(req, res, next){
	Analytics.aggregate([
    {"$match": { "bizid": req.params.id}},
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
    { "$sort": { "_id": 1 } }
  ], function(err, rst){
    var result = Object.keys(rst).map(function(key) {
      return [rst[key]._id, rst[key].views, rst[key].contacts];
    });
    //END OF RAW DATA COLLECTION
    console.log(result);
    Analytics.find({
		bizid: req.params.id
	})
	.then(function(data){
	   res.render('admin/analytics', {data: data, title: "Analytics", graph: JSON.stringify(result)});
	})
	.catch(function(err){
	    console.log(err);
	});
  });
});

router.get('/allanalytics',role.auth, function(req, res, next){
	Analytics.aggregate([
    {"$match": {}},
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
    { "$sort": { "_id": 1 } }
  ], function(err, rst){
    var result = Object.keys(rst).map(function(key) {
      return [rst[key]._id, rst[key].views, rst[key].contacts];
    });
    //END OF RAW DATA COLLECTION
    console.log(result);
    Analytics.find({})
	.then(function(data){
	   res.render('admin/analytics', {data: data, title: "Analytics", graph: JSON.stringify(result)});
	})
	.catch(function(err){
	    console.log(err);
	});
  });
});

router.get('/approve/:id',role.admin, function(req, res, next){
	Business.findById(req.params.id)
	.then(function(b){
		if(b.approved == true){
			b.approved = false;
		}else if(b.approved == false){
			b.approved = true;
		}else{
			b.approved = true;
		}

		b.save(function(err){
			if(err)
				res.redirect('/dashboard');
			res.redirect('/dashboard');
		});
	})
	.catch(function(err){
	     console.log(err);
	});
});

router.get('/category',role.auth, function(req, res, next) {
  Category.find({})
  .then(function(data){
    res.render('admin/category', {title: "Find It Categories", categories: data});
  })
  .catch(function(err){
     console.log(err);
  });
});


router.get('/category/edit/:id',role.admin, function(req, res, next){
	var category = Category.findOne({
	  _id: req.params.id
	});
	Promise.all([category]).then(values => {
	    console.log(values);
	    res.render('admin/editcategory', {
	        title: "Edit "+values[0].name,
	        category: values[0]
	    });
	  });
});

router.get('/category/showhome/:id',role.admin, function(req, res, next){
	Category.findById(req.params.id)
	.then(function(b){
		if(b.approved == "true"){
			b.approved = "false";
		}else{
			b.approved = "true";
		}

		b.save(function(err){
			if(err)
				res.redirect('/admin/category');
			res.redirect('/admin/category');
		});
	})
	.catch(function(err){
	     console.log(err);
	});
});

router.get('/subcategory/bizlist/:name',role.auth, function(req, res, next){
  var businesses = Business.find({ features: req.params.name, approved: true });
  var features = Category.find({ subcategories: {$elemMatch: { name: req.params.name}} });

  Promise.all([businesses,features]).then(values => {
    res.render('admin/indexbackup', {
        title: req.params.cat,
        businesses: values[0],
        features: values[1],
        subcategory: req.params.name
    });
  });
});

router.get('/subcategory/delete/:id/:name',role.auth, function(req, res, next){
		Category.update(
			{_id: req.params.id},
			{ $pull: { subcategories: { name: req.params.name} }
    	})
		.then(function(data){
		    res.redirect('/admin/category');
		})
		.catch(function(err){
		     console.log(err);
		});
});

router.post('/category/update/:id',role.admin, function(req, res, next){
	var category = Category.findOne({
	  _id: req.params.id
	}).then(function(data){
		data.name = req.body.name;
		data.icon = req.body.icon;
		data.order = req.body.order;
		data.save(function(err){
			if(err){
				console.log(err);
				res.redirect('/admin/category');
			}
			res.redirect('/admin/category');
		});
	});

});


router.get('/category/add',role.admin, function(req, res, next){
	res.render('admin/addcategory');
});

router.get('/category/delete/:id', role.admin, function(req, res, next){
	Category.deleteOne({
		_id: req.params.id
	})
	  .then(function(data){
	    res.redirect('/category');
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

router.get('/subcategory', function(req, res, next) {
  Subcategory.find({})
  .then(function(data){
  	console.log(data);
    res.render('admin/subcategory', {title: "Find It Categories", subcategories: data});
  })
  .catch(function(err){
     console.log(err);
  });
});

router.get('/subcategory/add',role.admin, function(req, res, next){
	Category.find({})
	.then(function(data){
	  	console.log(data);
	    res.render('admin/addsubcategory',{title: "Find It Categories", categories: data});
	})
	.catch(function(err){
	     console.log(err);
	});
});

router.post('/subcategory/add', function(req, res, next){
	Category.findById(req.body.category).then(function(cat){
		cat.subcategories.push({name: req.body.name});
		console.log(cat);
		cat.save(function(err){
			if(err){
				console.log(err);
				res.render('admin/addcategory');
			}
			res.redirect('/admin/category');
		});
	});
});

router.get('/pay/:id', function(req, res){
  ssn = req.session;
  ssn.hashkey = "852sokompare963001";
  ssn.vendor_id = "sokompare";
  var fields = {
  	"live":"1",
    "oid": req.params.id,
    "inv": "invoiceid"+req.params.id,
    "ttl": "2230",
    "tel": "0710345130",
    "eml": "kelvinchege@gmail.com",
    "vid": ssn.vendor_id,
    "curr": "KES",
    "p1": req.params.id,
    "p2": "",
    "p3": "",
    "p4": "",
    "lbk": 'hwebinsurance/cancel',
    "cbk": 'car/promoteReceive',
    "cst": "1",
    "crl": "0"
  };
  var datastring =  fields['live']+fields['oid']+fields['inv']+
  	fields['ttl']+fields['tel']+fields['eml']+fields['vid']+fields['curr']+fields['p1']+fields['p2']
  	+fields['p3']+fields['p4']+fields['cbk']+fields['cst']+fields['crl'];
  var hash = crypto.createHmac('sha1',ssn.hashkey).update(datastring).digest('hex');
  res.render('admin/ipayafrica', {title: "Pay",hash: hash, inputs: fields, datastring: datastring});
});

router.get('/activate/all',role.admin, function(req, res){
	Business.find({})
	.then(function(data){
		data.forEach(function(b) {
			b.approved = true;
			console.log(b.approved);
			b.save(function(err){
				if(err)
					console.log(err);
			});
		});
		res.redirect('/dashboard');
	})
	.catch(function(err){
	     console.log(err);
	});
});

/***************** COUPONS ******************************/

router.get('/coupons', role.auth, function(req, res){
	if(req.user.role == 1){
		Coupons.find({})
		.populate('bizid')
		.populate('users.user_id')
		.then(function(data){
		    res.render('coupons/dashboard', {title: "Coupons", coupons: data});
		})
		.catch(function(err){
		     console.log(err);
		});
	}else{
		Coupons.find({
			ownerid: res.locals.user._id
		})
		.populate('bizid')
		.populate('users.user_id')
		.then(function(data){
			console.log(data);
		    res.render('coupons/dashboard', {title: "Coupons", coupons: data});
		})
		.catch(function(err){
		     console.log(err);
		});
	}
});

router.get('/coupon/add', role.auth, function(req, res){
	Business.find({
      user_id : res.locals.user.username
    })
    .then(function(data){
      res.render('coupons/create',{title: "Create Coupon", businesses: data});
    })
    .catch(function(err){
       console.log(err);
    });

});

router.get('/mycoupons', role.auth, function(req, res){
	Coupons.find({
      'users.user_id' : res.locals.user.id,
      'status': true
    })
	.populate('bizid')
	.populate('users.user_id','status code')
    .then(function(data){
      	res.render('coupons/mycoupons',{title: "Create Coupon", mycoupons: data});
    })
    .catch(function(err){
       console.log(err);
    });

});

router.get('/coupon/activate/:id', role.auth, function(req, res){
	Coupons.findById(req.params.id)
    .then(function(data){
    	if(data.status == true){
    		data.status = false;
    	}else{
    		data.status = true;
    	}
    	data.save(function(err){
    		res.redirect('/admin/coupons');
    	});
    })
    .catch(function(err){
       console.log(err);
    });
});

router.get('/coupon/delete/:id', role.auth, function(req, res){
    if(req.user.role == 1){
      Coupons.findOneAndRemove({
        _id: req.params.id
      })
      .then(function(data){
          res.redirect('/admin/coupons');
      })
      .catch(function(err){
           console.log(err);
      });
  }else{
    Coupons.findOneAndRemove({
      _id: req.params.id,
      ownerid: res.locals.user.id
    })
    .then(function(data){
        res.redirect('/admin/coupons');
    })
    .catch(function(err){
         console.log(err);
    });
  }
});

router.get('/coupon/markused/:id', role.auth, function(req, res){

    Coupons.update({'users.user_id': req.params.id}, {'$set': {
	    'users.$.status': false
	}}, function(err) {
		res.redirect('/admin/coupons');
	});
});

router.get('/email/coupon/:id', role.auth, function(req, res){
	Coupons.findById(req.params.id)
	.populate('bizid')
	.populate('users.user_id','status code')
    .then(function(data){
    	console.log(res.locals.user.email);
    	var holder = emailModel.app;
	  	var mailer = emailModel.mailer;
	  	holder.mailer.send('email/coupon', {
	    	to: res.locals.user.email, // REQUIRED. This can be a comma delimited string just like a normal email to field.
	    	subject: 'Coupon: ' + data.name, // REQUIRED.
	    	coupon:  data// All additional properties are also passed to the template as local variables.
	  	}, function (err) {
	    	if (err) {
	      		// handle error
	      		console.log(err);
	      		req.flash('error_msg','There was an error sending the email');
	      		res.redirect('/coupons');
	      		return;
	    	}else{
	    		res.redirect('/coupons');
	    	}
	  	});
    })
    .catch(function(err){
       console.log(err);
       res.redirect('/coupons');
    });
});


router.get('/email/coupons', role.auth, function(req, res){
	Coupons.find({
        'users.user_id' : res.locals.user.id,
        'status': true
  })
	.populate('bizid')
	.populate('users.user_id','status code')
    .then(function(data){
      var holder = emailModel.app;
  	  var mailer = emailModel.mailer;
      data.forEach(function(cp){
  	  	holder.mailer.send('email/coupon', {
  	    	to: res.locals.user.email, // REQUIRED. This can be a comma delimited string just like a normal email to field.
  	    	subject: 'Coupon: ' + cp.name, // REQUIRED.
  	    	coupon:  cp// All additional properties are also passed to the template as local variables.
  	  	}, function (err) {
  	    	if (err) {
  	    	}else{
  	    	}
  	  	});
      });
      res.redirect('/coupons');
    })
    .catch(function(err){
       console.log(err);
       res.redirect('/admin/mycoupons');
    });
});

router.post('/coupon/create', role.auth,cpUpload, function(req, res){
	var coupon = new Coupons();
	coupon.name = req.body.name;
	coupon.description = req.body.description;
	coupon.status = req.body.status;
	coupon.ownerid = res.locals.user._id;
	coupon.bizid = req.body.bizid;
	coupon.tagline = req.body.tagline;
	coupon.type = req.body.type;
	if (req.files['photo'] != null){
		coupon.photo = req.files['photo'][0].filename;
	}
	coupon.save(function(err){
		if(err){
			console.log(err);
			req.flash("error_msg", err);
			res.redirect('/admin/coupon/add');
		}else{
			if (req.files['photo'] != null){
				Jimp.read("./public/uploads/"+coupon.photo).then(function (cover) {
				    return cover.resize(200, 150)     // resize
				         .quality(100)              // set greyscale
				         .write("./public/uploads/thumbs/coupons/"+coupon.photo); // save
				}).catch(function (err) {
				    console.error(err);
				});
			}else{
				req.flash("success_msg", "Coupon Successfully Created");
				res.redirect('/admin/coupons');
			}
			req.flash("success_msg", "Coupon Successfully Created");
			res.redirect('/admin/coupons');
		}
	});
});

/***************** AGENTS *******************************/

router.get('/agents',role.admin, function(req, res){
	Agents.find({})
	.then(function(data){
	    res.render('agents/index', {title: "Agents", agents: data});
	})
	.catch(function(err){
	     console.log(err);
	});
});

router.get('/agent/add',role.admin, function(req, res){
	res.render('agents/new', {title: "New Agent"});
});

router.post('/agent/create',role.auth, function(req, res){

	Agents.findOne({
	   phone: req.body.phone
	})
	.then(function(data){
		if(!data){
			var i = new Agents();
			i.name = req.body.name;
			i.phone = req.body.phone;
			i.save(function(err){
				if(role.admin == '1'){
					if(err){
						console.log(err);
						res.redirect('/admin/agents');
					}
					res.redirect('/admin/agents');
				}else{
					req.flash("success_msg", "Agent details successfully submitted");
					res.redirect('/');
				}
			});
		}else{
			res.render('site/agent',{error_msg: "Agent already exists"})
		}
	});

});

router.get('/agent/number/:number',role.admin, function(req, res){
	Business.find({
    agentphone: req.params.number
  })
  .then(function(data){
  	console.log(data);
  	res.render('admin/indexbackup', {title: "Find It Dashboard", businesses: data});
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  });
});

router.get('/agent/delete/:id',role.admin, function(req, res){
	Agents.deleteOne({
    _id: req.params.id
  })
  .then(function(data){
  	res.redirect('/admin/agents');
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  });
});

router.get('/user/makeadmin/:id', role.admin, function(req, res){
	Users.findById(req.params.id)
	.then(function(data){
	  	console.log(data);
	  	if(data.role == "1"){
	  		data.role = "0";
	  	}else{
	  		data.role = "1";
	  	}
	  	data.save(function(err){
	  		if(err){
	  			req.flash('error',err);
	  			res.redirect('/users');
	  		}else{
	  			res.redirect('/users');
	  		}
	  	});
	})
	.catch(function(err){
	    console.log(err);
	});
});

router.get('/user/delete/:id', role.admin, function(req, res){
	Users.deleteOne({_id:req.params.id})
	.then(function(data){
  		res.redirect('/users');
	})
	.catch(function(err){
	    console.log(err);
	});
});

router.get('/user/:number', function(req, res){
	Business.find({
    user_id: req.params.number
  }).sort([['date', -1]])
  .then(function(data){
  	res.render('admin/bizadded', {title: "Find It Dashboard", businesses: data});
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  });
});

router.get('/changepassword', role.auth, function(req, res){
	res.render('user/changepassword');
});

router.post('/changepassword', role.auth, function(req, res){
	Users.findById(res.locals.user.id)
	.then(function(data){
  		console.log(data);
  		if(!bcrypt.compareSync(req.body.oldpassword, data.password)){
  			console.log("wrong password");
  			req.flash("error_msg","Wrong Current Password");
  			res.render("user/changepassword");
  		}else {
  			if(req.body.newpassword == req.body.confirmpassword){
  				var salt = bcrypt.genSaltSync(10);
      			var hash = bcrypt.hashSync(req.body.newpassword, salt);
      			data.password = hash;
      			console.log("new password match");
      			data.save(function(err){
      				if(err){
      					console.log("saving error");
      					req.flash("error_msg","Error Occured");
  						res.render("user/changepassword");
      				}else{
      					console.log("new password saved");
      					req.flash("success_msg","Password Successfully Changed");
  						res.redirect("/");
      				}

      			});
  			}else{
  				console.log("new password dont match");
  				req.flash("error_msg","Password Mismatch");
  				res.render("user/changepassword");
  			}
  		}
	})
	.catch(function(err){
	    console.log(err);
	});
});

module.exports = router;
