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
var User = require(__dirname + '/../models/User');

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
  //console.log(req.session.cart);
  if(req.query.search){
    var categories = Category.find({group:'shopping'});
    var products = Product.find({$text: {$search: req.query.search}}).limit(50);
    var total = 0;
    if(req.session.cart){
      req.session.cart.forEach(function(i,index){
        total += i.count * i.price;
      });
    }
  	Promise.all([products, categories]).then(values => {
      res.render('product/index',{title: "Products on Findit", products: values[0],categories: values[1],cart: req.session.cart,total:total});
    });
  }else{
    var categories = Category.find({group:'shopping'});
    var products = Product.find({}).limit(50);
    var total = 0;
    if(req.session.cart){
      req.session.cart.forEach(function(i,index){
        total += i.count * i.price;
      });
    }
  	Promise.all([products, categories]).then(values => {
      res.render('product/index',{title: "Products on Findit", products: values[0],categories: values[1],cart: req.session.cart,total:total});
    });
  }

});

router.get('/featured',function(req, res){
  //console.log(req.session.cart);
  var categories = Category.find({group:'shopping'});
  var products = Product.find({featured: true}).limit(100);
  var total = 0;
  if(req.session.cart){
    req.session.cart.forEach(function(i,index){
      total += i.count * i.price;
    });
  }
	Promise.all([products, categories]).then(values => {
    res.render('product/index',{title: "Featured Products on Findit", products: values[0],categories: values[1],cart: req.session.cart,total:total});
  });
});

router.get('/topdeals',function(req, res){
  //console.log(req.session.cart);
  var categories = Category.find({group:'shopping'});
  var products = Product.find({topdeals: true}).limit(100);
  var total = 0;
  if(req.session.cart){
    req.session.cart.forEach(function(i,index){
      total += i.count * i.price;
    });
  }
	Promise.all([products, categories]).then(values => {
    res.render('product/index',{title: "Featured Products on Findit", products: values[0],categories: values[1],cart: req.session.cart,total:total});
  });
});

router.get('/fetchcategory/:name', function(req, res, next){
	//console.log(req.params.name);
	Category.findById(req.params.name)
	.then(function(data){
		//console.log(data.subcategories);
	    res.json(data.subcategories);
	})
	.catch(function(err){
	     console.log(err);
	});
	//res.render('business/new');
});

router.get('/new',role.auth, function(req, res){
  if(res.locals.user.role == '1'){
    var cat = Category.find({group:'shopping'});
    var businesses = Business.find({paid: 1});
    Promise.all([cat, businesses ]).then(values => {
      console.log(values[0]);
      res.render('product/new', {title: "New Product", categories: values[0], businesses: values[1] });
    });
  }else{
    var cat = Category.find({group:'shopping'});
    var businesses = Business.find({
      user_id : res.locals.user.username
    });
    Promise.all([cat, businesses ]).then(values => {
      console.log(values[0]);
      res.render('product/new', {title: "New Product", categories: values[0], businesses: values[1] });
    });
  }
});

router.get('/edit/:id',role.auth, function(req, res){
  var product = Product.findOne({
    _id: req.params.id
  });
  var businesses = Business.find({
    user_id : res.locals.user.username
  })
  Promise.all([product, businesses ]).then(values => {
    console.log(values[0]);
    res.render('product/edit', {title: "Edit Product: "+values[0].name, product: values[0],businesses: values[1]});
  });
});

router.post('/update/:id',role.auth,cpUpload, function(req,res){
  var product = Product.findOne({
    _id: req.params.id
  }).then(function(p){
    //console.log(p);
    p.name = req.body.name;
    p.description = req.body.description;
    if (req.files['photo'] != null){
  		p.photo = req.files['photo'][0].filename;
  	}
    if (req.body.vat != null){
  		p.vat = 1;
  	}
    p.gallery = req.files['gallery'];
    p.price = req.body.price;
    p.quantity = req.body.quantity;
    p.status = req.body.status;
    p.oldprice = req.body.oldprice;
    p.bizid = req.body.bizid;
    p.subcategory = req.body.subcategory;
    p.category = req.body.cat;
    p.subcategory = req.body.subcat;
    p.save(function(err){
      if(err)
        console.log("err");
      if (req.files['photo']){
        Jimp.read("./public/uploads/product/"+p.photo).then(function (cover) {
            return cover.resize(200, 140)     // resize
                 .quality(100)                // set greyscale
                 .write("./public/uploads/product/thumbs/"+p.photo); // save
        }).catch(function (err) {
            console.error(err);
        });
      }
      if(p.gallery){
        p.gallery.forEach(function(gallery) {
            Jimp.read("./public/uploads/product/"+gallery.filename).then(function (cover) {
              return cover.resize(200, 140)     // resize
                   .quality(100)                // set greyscale
                   .write("./public/uploads/product/thumbs/gallery-"+gallery.filename); // save
          }).catch(function (err) {
              console.error(err);
          });
        });
      }
      req.flash('success_msg', 'Edited Successfully');
      res.redirect('/product/'+p.slug);
    });
  })
})

router.post('/create',role.auth, cpUpload, function(req, res){
  var p = new Product();
  p.name = req.body.name;
  p.slug = slug(req.body.name);
  p.description = req.body.description;
  if (req.files['photo'] != null){
		p.photo = req.files['photo'][0].filename;
	}
  if (req.body.vat != null){
		p.vat = 1;
	}
  p.gallery = req.files['gallery'];
  p.price = req.body.price;
  p.quantity = req.body.quantity;
  p.subcategory = req.body.subcat;
  p.minicategory = req.body.minicat;
  p.status = req.body.status;
  p.oldprice = req.body.oldprice;
  p.bizid = req.body.bizid;
  p.category = req.body.cat;
  p.subcategory = req.body.subcat;
  p.save(function(err){
    if(err)
      console.log("err");
      if (req.files['photo']){
        Jimp.read("./public/uploads/product/"+p.photo).then(function (cover) {
          return cover.resize(200, 140)     // resize
             .quality(100)                // set greyscale
             .write("./public/uploads/product/thumbs/"+p.photo); // save
        }).catch(function (err) {
          console.error(err);
        });
      }
      if(p.gallery){
        p.gallery.forEach(function(gallery) {
            Jimp.read("./public/uploads/product/"+gallery.filename).then(function (cover) {
              return cover.resize(200, 140)     // resize
                   .quality(100)                // set greyscale
                   .write("./public/uploads/product/thumbs/gallery-"+gallery.filename); // save
          }).catch(function (err) {
              console.error(err);
          });
        });
      }
      req.flash('success_msg', 'Added Successfully');
      res.redirect('/admin/product/'+req.body.bizid);
  });
});

//CART FUNCTIONS HERE //

router.get('/cart',function(req, res){
  var categories = Category.find({group:'shopping'});
  Promise.all([categories]).then(values => {
    if(req.session.cart){
      var total = 0;
      req.session.cart.forEach(function(i,index){
        total += i.count * i.price;
      });
      res.render('product/cart',{cart: req.session.cart, total: total, categories: values[0]});
    }else{
      res.render('product/cart',{cart: [], categories: values[0]});
    }
  });
});

router.get('/feature_product/:bizid/:id',function(req, res){
  Product.findById(req.params.id)
    .then(function(data){
      if(data.featured == true){
    		data.featured = false;
    	}else{
    		data.featured = true;
    	}
    	data.save(function(err){
    		res.redirect('/admin/product/'+req.params.bizid);
    	});
    })
    .catch(function(err){
       console.log(err);
    });
});

router.get('/topdeal_product/:bizid/:id',function(req, res){
  Product.findById(req.params.id)
    .then(function(data){
      if(data.topdeals == true){
    		data.topdeals = false;
    	}else{
    		data.topdeals = true;
    	}
    	data.save(function(err){
    		res.redirect('/admin/product/'+req.params.bizid);
    	});
    })
    .catch(function(err){
       console.log(err);
    });
});

router.get('/shipping',function(req, res){
  var total = 0;
  req.session.cart.forEach(function(i,index){
    total += i.count * i.price;
  });
  var categories = Category.find({group:'shopping'});
    Promise.all([categories]).then(values => {
      res.render('procategory/duct/checkout',{
        cart: req.session.cart,
        total: total,
        categories: values[0]
      });
    });
});



router.post('/pay',function(req, res){
  ssn = req.session;
  ssn.hashkey = "852sokompare963001";
  ssn.vendor_id = "sokompare";
  //var package = req.body.package;
  //ssn.agentnumber = req.body.agentnumber;
  if(req.body.shippingaddress){
    //console.log(req.body.shippingaddress);
    //console.log("new address");
    ssn.email = req.body.email;
    ssn.phone = req.body.phone;
    ssn.address = req.body.address;
    ssn.area = req.body.area;
    Users.update(
      {_id: req.user.id},
      { $set: { shippingaddress: {
            phone: req.body.phone,
            email: req.body.email,
            building: req.body.address,
            area: req.body.area
          }
      }},function (err, doc){
        //console.log(doc);
      });
  }else{
    //console.log(req.body.shippingaddress);
    //console.log("Existing address");
    ssn.email = req.user.shippingaddress.email;
    ssn.phone = req.user.shippingaddress.phone;
    ssn.address = req.user.shippingaddress.address;
    ssn.area = req.user.shippingaddress.area;
  }
  if(req.session.cart){
    var total = 0;
    req.session.cart.forEach(function(i,index){
      total += i.count * i.price;
    });
    var timestamp = new Date().getTime();
    var fields = {
      "live":"1",
      "oid": timestamp,
      "inv": "invoiceid"+req.params.id,
      "ttl": total,
      "tel": ssn.phone,
      "eml": ssn.email,
      "vid": ssn.vendor_id,
      "curr": "KES",
      "p1": timestamp,
      "p2": "",
      "p3": "",
      "p4": "",
      "lbk": 'https://'+req.get('host')+'/cancel',
      "cbk": 'https://'+req.get('host')+'/product/receive',
      "cst": "1",
      "crl": "0"
    };
    var datastring =  fields['live']+fields['oid']+fields['inv']+
      fields['ttl']+fields['tel']+fields['eml']+fields['vid']+fields['curr']+fields['p1']+fields['p2']
      +fields['p3']+fields['p4']+fields['cbk']+fields['cst']+fields['crl'];
    var hash = crypto.createHmac('sha1',ssn.hashkey).update(datastring).digest('hex');
    res.render('product/save',{
      cart: req.session.cart,
      total: total,
      hash: hash,
      inputs: fields,
      datastring: datastring
    });
  }else{
    res.redirect('/product');
  }
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

  var ssn = req.session;
  var sale = new Sale();
  sale.phone = ssn.phone;
  sale.email = ssn.email;
  sale.address = ssn.address;
  sale.area = ssn.area;
  sale.amount = amount;
  sale.cart = req.session.cart;
  sale.timestamp = new Date();
  sale.orderid = val1;
  req.session.cart = [];

  request(ipnurl, function (error, response, body) {
    //console.log(body); // Print the HTML for the Google homepage.
    console.log(response);
    //res.send("Status > " + status + ", Body > " +body);
    //res.end();
    if(body == status){
      sale.save(function(err){
        req.flash('success_msg', 'Payment Successfully Done!');
        if(err)
          res.redirect('/product');
        res.redirect('/product');
      });
    }else{
      req.flash('error', 'Transaction Already Authenticated!');
      res.redirect('/product');
    }
  });
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
    if(req.session.cart){
      d.count = 1;
      var unique = false;
      req.session.cart.forEach(function(i,index){
        if(i._id == d._id){
          i.count = i.count + 1;
          unique = true;
        }
        if(index == req.session.cart.length - 1){
          if(unique == false){
            req.session.cart.push(d);
          }
        }
      });
      if(req.session.cart.length == 0){
        req.session.cart.push(d);
      }
    }else{
      req.session.cart = [];
      d.count = 1;
      req.session.cart.push(d);
    }
    var total = 0;
    req.session.cart.forEach(function(i,index){
      total += i.count * i.price;
    });
    res.json({itemsincart: req.session.cart.length,cart:req.session.cart, total:total});
  })
});
//change cart number of Items
router.get('/editcart/:id/:count', function(req, res){
  var no = req.params.count;
  var id = req.params.id;
  req.session.cart.forEach(function(i,index){
    if(i._id == id){
      i.count = no;
    }
  });
  res.json("Cart Updated");
});
//Remove from cart.
router.get('/removefromcart/:id', function(req, res){
  var id = req.params.id;
  var cart = req.session.cart.filter( el => el._id !== id );
  req.session.cart = cart;
  res.redirect("/product/cart");
});
// END OF CART FUNCTIONS

router.get('/delete/:id', role.auth, function(req, res){
    if(req.user.role == 1){
      Product.findOneAndRemove({
        _id: req.params.id
      })
      .then(function(data){
          res.redirect('/admin/product/'+data.bizid);
      })
      .catch(function(err){
           console.log(err);
      });
  }else{
    Product.findOneAndRemove({
      _id: req.params.id,
      ownerid: res.locals.user.id
    })
    .then(function(data){
        res.redirect('/admin/product/'+data.bizid);
    })
    .catch(function(err){
         console.log(err);
    });
  }
});

router.get('/:bizname/:category/:subcat/:minicat/:slug',function(req, res){
  var categories = Category.find({group:'shopping'});
  var product = Product.findOne({
    slug: req.params.slug,
    //status: true
  }).populate('bizid').populate('category');
  Promise.all([categories,product]).then(values => {
  console.log(values[1].bizid.id);
  owner = values[1].bizid.user_id;
  
  console.log(owner.names);
  console.log(owner.phone);
  console.log(owner.email);


  console.log(owner);

  //   User.findOne({ username: values[1].bizid.user_id }).populate('user_id').then(function(u){
  //     //if(err) console.log(err);
  //     console.log(values[1]);
      res.render('product/detail',{product: values[1],title: values[1].name, categories: values[0], owner});
    }).catch(function(){
        // want to handle errors here
        console.log("error happened");
    });
  });


module.exports = router;
