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
var Review = require(__dirname + '/../models/Reviews');
var role = require(__dirname + '/../config/Role');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    //var fileName = file.originalname + '-' + Date.now() + '.' + mime.extension(file.mimetype);
    var fileName = Date.now() + slug(file.originalname) +'.'+ mime.extension(file.mimetype);
    //var catalogName = file.originalname + '-' + Date.now() + '.' + mime.extension(file.mimetype);
    cb(null, fileName);
  }
});

var upload = multer({ storage: storage });
var cpUpload = upload.fields([
	{ name: 'photo', maxCount: 1 },
	{ name: 'coverphoto', maxCount: 1 },
  { name: 'profile', maxCount: 1 },
  { name: 'catalog', maxCount: 5 },
  { name: 'gallery', maxCount: 30 }
]);
router.post('/add', role.auth, cpUpload, function(req, res, next) {
	var instance = new Business();
	instance.name = req.body.name
	instance.slug = slug(req.body.name);
	instance.description = req.body.description;
	instance.city = req.body.city;
  let mappy = {
    type:"Point",
    coordinates:[Number(req.body.long),Number(req.body.lati)],
    zoom:req.body.zoom
  }
  instance.map = mappy;
	if (req.files['catalog'] != null){
		instance.catalog = req.files['catalog'];
	}
  if (req.files['profile'] != null){
		instance.profile = req.files['profile'][0].filename;
	}
	instance.website = req.body.website;
	instance.phone = req.body.phone;
	instance.email = req.body.email;
	if (req.files['photo'] != null){
		instance.photo = req.files['photo'][0].filename;
	}
	if (req.files['coverphoto'] != null){
		instance.coverphoto = req.files['coverphoto'][0].filename;
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
    if(req.body.youtube){
      if(req.body.youtube.includes("watch?v=")){
				instance.youtube = req.body.youtube.replace("watch?v=", "embed/");
			  
			}
    }

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
  if(req.body.branch){
    instance.branch = true;
    instance.bizparent = req.body.bizparent;
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
					    res.render('business/freeadd',{title: "Find It Categories", categories: data, errors: err});
					})
					.catch(function(err){
					     console.log(err);
					});
				}else{
					if (req.files['photo'] != null){
						Jimp.read("./public/uploads/"+instance.photo).then(function (cover) {
						    return cover.resize(200, 140)     // resize
						         .quality(100)                 // set greyscale
						         .write("./public/uploads/thumbs/cover"+instance.photo); // save
						}).catch(function (err) {
						    console.error(err);
						});
					}
					if (req.files['coverphoto'] != null){
						Jimp.read("./public/uploads/"+instance.coverphoto).then(function (cover) {
						    return cover.resize(1000, 200)     // resize
						         .quality(100)                 // set JPEG quality
						         .write("./public/uploads/thumbs/cover"+instance.coverphoto); // save
						}).catch(function (err) {
						    console.error(err);
						});
					}
					if (req.files['profile']){
						Jimp.read("./public/uploads/"+b.profile).then(function (cover) {
								return cover.write("./public/uploads/"+b.profile); // save
						}).catch(function (err) {
								console.error(err);
						});
					}
					if(instance.gallery){
						instance.gallery.forEach(function(gallery) {
						  	Jimp.read("./public/uploads/"+gallery.filename).then(function (cover) {
							    return cover.resize(200, 140)     // resize
							         .quality(100)                 // set JPEG quality
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
			});
	    }else{
	    	req.flash('error', 'Business already exists');
	    	res.redirect('/biz/'+instance.slug);
	    }
	})
	.catch(function(err){
	    console.log(err);
	    res.redirect('/');
	});

});

router.get('/freeadd',role.auth, function(req, res, next){
	Category.find({})
	.then(function(data){
	    res.render('business/freeadd',{title: "Find It Categories", categories: data});
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
    //console.log(data);
		if(req.params.package == "free"){
			res.redirect('/business/freeadd');
		}else{
			res.redirect('/business/freeadd')
		}
	})
	.catch(function(err){
	     console.log(err);
	});
	//res.render('business/new');
});

router.get('/fetchcategory/:name', function(req, res, next){
	//console.log(req.params.name);
	Category.findOne({name: req.params.name})
	.then(function(data){
		//console.log(data.subcategories);
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
router.get('/profile/:name', function(req, res, next){
	//res.send("hello");
	res.render('business/profile',{title:'View Company profile', fileurl: req.params.name});
});

router.post('/review',role.auth, function(req, res, next){
	Business.findById(req.body.bizid)
	.then(function(b){
		b.reviews.push({rate: req.body.rating, msg: req.body.review});
		//b.user_id = res.role.user.username;
		b.user_id = res.locals.user.names;
		b.save(function(err){
			if(err){
          console.log(err);
          res.redirect('/'+b.slug);
      }else{
        var review = new Review();
        review.message = req.body.review;
				review.user_id = res.locals.user._id;
				//review.user_id = res.locals.user._id;
        review.bizid = req.body.bizid;
        review.star = req.body.rating;
        review.created_at = new Date();
        review.save(function(err){
          console.log(review);
          if(err){
            console.log(err);
            req.flash("error_msg",err);
            res.redirect('/biz/'+b.slug);
          }else{
            res.redirect('/biz/'+b.slug);
          }
        });
      }
		});
	})
	.catch(function(err){
	     console.log(err);
	});
});
//delete review
// router.get('/review/delete/:id', role.admin, function (req, res) {
// 	Business.findById(req.body.bizid)
// 	.then(function(b){
// 		b.reviews.splice(b.reviews.indexOf({rate: req.body.rating, msg: req.body.review}), 1);
// 		//b.user_id = res.role.user.username;
// 		b.user_id = res.locals.user.names;
		
// 	})
// 	.catch(function(err){
// 	     console.log(err);
// 	});
// });

router.get('/gallery/reorder/:bizid',role.auth,function(req, res, next){
	//res.json(req.query.order);
  if(req.user.role == 1){
    Business.findById(req.params.bizid)
    .then(function(data){
      data.gallery = JSON.parse(req.query.order);
      data.save(function(rst){
        res.send("Gallery reordered");
      });
    })
    .catch(function(err){
       console.log(err);
    });
  }else{
    Business.findOne({
      _id: req.params.bizid,
      user_id : res.locals.user.username
    })
    .then(function(data){
      data.gallery = JSON.parse(req.query.order);
      data.save(function(rst){
        res.send("Gallery reordered");
      });
    })
    .catch(function(err){
       console.log(err);
    });
  }
});

//categories reorder
router.get('/subcategory/reorder/:bizid',role.auth,function(req, res, next){
	//res.json(req.query.order);
    console.log(req.params.bizid);
    Category.findById(req.params.bizid)
    .then(function(data){
      console.log(req.query.order);
      data.subcategories = JSON.parse(decodeURI(req.query.order.replace(/~/g,'&')));
      data.save(function(err,rst){
        if(err){
          console.log(err);
        }else{
          res.send("Subcategories Reordered!");
        }
      });
    })
    .catch(function(err){
       console.log(err);
    });
});

router.get('/viewmore/:id', function(req, res, next){
  var products = Product.find({bizid: req.params.id});
  Promise.all([products]).then(values => {
    res.render('business/viewmore',{products: values[0], title: "View More Products"});
  });
});

router.get('/:name',function(req, res, next){
	res.render('business/new');
});

module.exports = router;
