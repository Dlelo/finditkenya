var express = require('express');
var router = express.Router();

var slug = require('slug');
var multer  = require('multer');
var mime = require('mime');
var moment = require('moment');
var Jimp = require("jimp");
const OpeningTimes = require('moment-opening-times');

var Business = require(__dirname + '/../models/Business');
var Category = require(__dirname + '/../models/Category');
var Subcategory = require(__dirname + '/../models/Subcategory');
var role = require(__dirname + '/../config/Role');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    var fileName = file.originalname + '-' + Date.now() + '.' + mime.extension(file.mimetype);
    //var catalogName = file.originalname + '-' + Date.now() + '.' + mime.extension(file.mimetype);
    cb(null, fileName);
  }
});

var upload = multer({ storage: storage });
var cpUpload = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'catalog', maxCount: 5 }, { name: 'gallery', maxCount: 10 }])

router.post('/add', role.auth, cpUpload, function(req, res, next) {
	var instance = new Business();
	instance.name = req.body.name
	instance.slug = slug(req.body.name);
	instance.description = req.body.description;
	instance.city = req.body.city;
	instance.map = {lati: req.body.lati, long: req.body.long, zoom: req.body.zoom };
	if (req.files['catalog'] != null){
		instance.catalog = req.files['catalog'];
	}
	instance.website = req.body.website;
	instance.phone = req.body.phone;
	instance.email = req.body.email;
	if (req.files['photo'] != null){
		instance.photo = req.files['photo'][0].filename;
	}
	instance.category = req.body.category;
	instance.reviews = req.body.reviews;
	instance.subcategory = req.body.subcategory;
	instance.features = req.body.ssubcategory;
	instance.gallery = req.files['gallery'];
	instance.paid = req.body.paid;
	instance.keywords = req.body.keywords;
	instance.extras = req.body.extras;
	instance.youtube = req.body.youtube;
	instance.user_id = res.locals.user.username;
	instance.date = new Date();
	instance.startdate = req.body.startdate;
	instance.hoursopen = req.body.hoursopen;
	instance.hoursclose = req.body.hoursclose;
	instance.street = req.body.street;
	instance.building = req.body.building;
	instance.starteventdate = req.body.starteventdate;
	instance.endeventdate = req.body.endeventdate;
	instance.approved = true;
	//Social links
    instance.facebook = req.body.facebook;
    instance.twitter = req.body.twitter;
    instance.instagram = req.body.instagram;
    instance.youtube = req.body.youtube;
    instance.linkedin = req.body.linkedin;
	if(req.body.hoursopensun){
		instance.hours.sunday.push({opens: req.body.hoursopensun, closes: req.body.hoursclosesun});
	}
	if(req.body.hoursopenmon){
		instance.hours.monday.push({opens: req.body.hoursopenmon, closes: req.body.hoursclosemon});
	}
	if(req.body.hoursopentue){
		instance.hours.tuesday.push({opens: req.body.hoursopentue, closes: req.body.hoursclosetue});
	}
	if(req.body.hoursopenwed){
		instance.hours.wednesday.push({opens: req.body.hoursopenwed, closes: req.body.hoursclosewed});
	}
	if(req.body.hoursopenthu){
		instance.hours.thursday.push({opens: req.body.hoursopenthu, closes: req.body.hoursclosethu});
	}
	if(req.body.hoursopenfri){
		instance.hours.friday.push({opens: req.body.hoursopenfri, closes: req.body.hoursclosefri});
	}
	if(req.body.hoursopensat){
		instance.hours.saturday.push({opens: req.body.hoursopensat, closes: req.body.hoursclosesat});
	}
	if(req.body.pending){
		instance.pending = true;
		instance.packagepaid = req.body.packagepaid;
	}
	Business.findOne({
	   slug: instance.slug
	})
	.then(function(data){
	    if(!data){
	     	instance.save(function(err){
				if(err){
					Category.find({})
					.then(function(data){
					    res.render('business/new',{title: "Find It Categories", categories: data, errors: err});
					})
					.catch(function(err){
					     console.log(err);
					});
				}else{
					if (req.files['photo'] != null){
						Jimp.read("./public/uploads/"+instance.photo).then(function (cover) {
						    return cover.resize(200, 140)     // resize
						         .quality(100)                 // set JPEG quality
						         .greyscale()                 // set greyscale
						         .write("./public/uploads/thumbs/cover"+instance.photo); // save
						}).catch(function (err) {
						    console.error(err);
						});
					}
					if(instance.gallery){
						instance.gallery.forEach(function(gallery) {
						  	Jimp.read("./public/uploads/"+gallery.filename).then(function (cover) {
							    return cover.resize(200, 140)     // resize
							         .quality(100)                 // set JPEG quality
							         .greyscale()                 // set greyscale
							         .write("./public/uploads/thumbs/gallery-"+gallery.filename); // save
							}).catch(function (err) {
							    console.error(err);
							});
						});
					}
					if(req.body.pending){
						res.redirect('/preview/'+instance.slug);
					}else{
						res.redirect('/dashboard');
					}
				}
				instance.on('es-indexed', function(err, res){
			    if (err) throw err;
			    /* Document is indexed */
			    });
			});
	    }else{
	    	req.flash('error', 'Business already exists');
	    	res.redirect('/'+instance.slug);
	    }
	})
	.catch(function(err){
	    console.log(err);
      req.flash('error',err);
	    res.redirect('/');
	});

});

router.get('/freeadd',role.auth, function(req, res, next){
	Category.find({})
	.then(function(data){
	    res.render('business/newfree',{title: "Find It Categories", categories: data});
	})
	.catch(function(err){
	     console.log(err);
	});
	//res.render('business/new');
});

router.get('/newpackage',role.auth, function(req, res, next){
	res.render('business/package');
});

router.post('/newpackage',role.auth, function(req, res, next){
	res.redirect('/business/add/'+req.body.package);
});

router.get('/add/:package',role.auth, function(req, res, next){
	Category.find({})
	.then(function(data){
		data.packagepaid = req.params.package;
		data.pendingstatus = true;
		if(req.params.package == "free"){
			res.render('business/newfree',{title: "Find It Categories", categories: data});
		}else{
			res.render('business/new',{title: "Find It Categories", categories: data});
		}
	})
	.catch(function(err){
	     console.log(err);
	});
	//res.render('business/new');
});

router.get('/fetchcategory/:name', function(req, res, next){
	console.log(req.params.name);
	Category.findOne({name: req.params.name})
	.then(function(data){
		console.log(data.subcategories);
	    res.json(data.subcategories);
	})
	.catch(function(err){
	     console.log(err);
	});
	//res.render('business/new');
});

router.get('/catalog/:name', function(req, res, next){
	//res.send("hello");
	res.render('business/catalog',{title:'View Catalog', fileurl: req.params.name});
});

router.post('/review',role.auth, function(req, res, next){
	console.log(req.body);
	Business.findById(req.body.bizid)
	.then(function(b){
		console.log(b);
		b.reviews.push({rate: req.body.rating, msg: req.body.review});
		b.user_id = res.locals.user.username;;
		b.save(function(err){
			if(err)
				res.redirect('/'+b.slug);
			res.redirect('/'+b.slug);
		});
	})
	.catch(function(err){
	     console.log(err);
	});
});

router.get('/:name',function(req, res, next){
	res.render('business/new');
});

module.exports = router;
