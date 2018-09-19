var express = require('express');
var router = express.Router();
var Users = require(__dirname + '/../models/User');
var role = require(__dirname + '/../config/Role');

/* GET users listing. */
router.get('/', role.auth, function(req, res, next) {
  Users.find({})
  .then(function(data){
    res.render('admin/users', {title: "Find It Users", users: data});
  })
  .catch(function(err){
     console.log(err);
  });
});

module.exports = router;
