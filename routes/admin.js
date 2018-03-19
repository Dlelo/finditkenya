var express = require('express');
var router = express.Router();

var slug = require('slug');
var multer  = require('multer');
var mime = require('mime');
var moment = require('moment');
var hmacsha1Generate = require('hmacsha1-generate');
var crypto = require("crypto");
var Jimp = require("jimp");

var role = require(__dirname + '/../config/Role');
var Category = require(__dirname + '/../models/Category');
var Subcategory = require(__dirname + '/../models/Subcategory');
var Business = require(__dirname + '/../models/Business');
var Agents = require(__dirname + '/../models/Agent');

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
var cpUpload = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'catalog', maxCount: 5 }, { name: 'gallery', maxCount: 10 }])

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
		b.reviews = req.body.reviews;
		b.startdate = req.body.startdate;
		if(req.body.subcategory){
			b.subcategory = req.body.subcategory;
		}
		if(req.body.ssubcategory){
			b.features = req.body.ssubcategory;
		}	
		
		b.keywords = req.body.keywords;
		b.youtube = req.body.youtube;	
		if(req.files['gallery']){
			b.gallery = req.files['gallery'];
		}
		b.user_id = res.locals.user.username;
	    b.hoursopen = req.body.hoursopen;
	    b.hoursclose = req.body.hoursclose;
	    b.extras = req.body.extras;
	    b.street = req.body.street;
	    b.building = req.body.building;
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
	    console.log(values);
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
		if(b.approved == true){
			b.approved = false;
		}else if(b.approved == false){
			b.approved = true;
		}else{
			b.approved = true;
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

router.post('/category/add', function(req, res, next){
	var i = new Category();
	i.name = req.body.name;
	i.icon = req.body.icon;
	i.slug = slug(req.body.name);
	i.save(function(err){
		if(err)
			res.render('admin/addcategory');
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

router.get('/subcategory/add', function(req, res, next){
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

router.get('/agents', function(req, res){
	Agents.find({})
	.then(function(data){
	    res.render('agents/index', {title: "Agents", agents: data});
	})
	.catch(function(err){
	     console.log(err);
	}); 
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

router.get('/agent/add',role.admin, function(req, res){
	res.render('agents/new', {title: "New Agent"});
});

router.post('/agent/create',role.admin, function(req, res){
	var i = new Agents();
	i.name = req.body.name;
	i.phone = req.body.phone;
	i.save(function(err){
		if(err){
			console.log(err);
			res.redirect('/admin/agents');
		}
		res.redirect('/admin/agents');
	})
});

router.get('/agent/number/:number', function(req, res){
	Business.find({
    agentphone: req.params.number
  })
  .then(function(data){
  	console.log(data);
  	res.render('admin/index', {title: "Find It Dashboard", businesses: data});
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  }); 
});

router.get('/user/:number', function(req, res){
	Business.find({
    user_id: req.params.number
  })
  .then(function(data){
  	res.render('admin/bizadded', {title: "Find It Dashboard", businesses: data});
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  }); 
});

module.exports = router;