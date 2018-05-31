function ensureAuthenticated(req, res, next){
	console.log('testing auth');
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('error_msg','You must be logged in');
		ssn = req.session;
		ssn.returnUrl = req.originalUrl;
		req.
		res.redirect('/login');
	}
}

function ensureAdmin(req, res, next){
	if(req.isAuthenticated()){
		if(req.user.role == 1){
			return next();
		}else{
			req.flash('error_msg','Sorry, You are not allowed to access this page');
			res.redirect('/');
		}
	}else{
		req.flash('error_msg','You must be logged in');
		res.redirect('/login');
	}
}


module.exports = {
	auth:ensureAuthenticated,
	admin:ensureAdmin
};
