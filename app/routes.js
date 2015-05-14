var feed = require('../public/javascripts/feed.js')

module.exports = function(app, passport) {

	// =====================================
	// HOME FEED ===========================
	// =====================================
  // want this protected so you have to be logged in to visit
  // use route middleware to verify this (the isLoggedIn function)
	app.get('/',isLoggedIn, function(req, res) {
    //res.render('loading.ejs',{user:req.user});
    feed.fetch(res, req.user);
  });

	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// want this protected so you have to be logged in to visit
	// use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

  // =============================================================================
  // USER NOT YET LOGGED IN ======================================================
  // =============================================================================

  // =====================================
  // LOCAL LOGIN =========================
  // =====================================
  // show the login form
  app.get('/login', isLoggedOut, function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // =====================================
  // LOCAL SIGNUP ========================
  // =====================================
  // show the signup form
  app.get('/signup', isLoggedOut, function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

	// =====================================
	// FACEBOOK ROUGHTS ====================
	// =====================================
	// send to facebook to do the authentication
  // profile gets us their basic information including their name
  // email gets their emails
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
      passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
      }));

    // =====================================
    // TWITTER ROUTES ======================
    // =====================================
    // send to twitter to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
      passport.authenticate('twitter', {
        successRedirect : '/profile',
        failureRedirect : '/'
      }));

    // =====================================
    // GOOGLE ROUTES ======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email', 'https://www.googleapis.com/auth/youtube'], accessType: 'offline', approvalPrompt: 'force' }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
      passport.authenticate('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
      }));

    // =====================================
    // INSTAGRAM ROUTES ====================
    // =====================================
    // route for instagram authentication
    app.get('/auth/instagram', passport.authenticate('instagram'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/instagram/callback',
      passport.authenticate('instagram', {
        successRedirect : '/profile',
        failureRedirect : '/'
      }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.local.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function(req, res) {
        var user           = req.user;
        user.local.twitter.token = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.local.google.token = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });

    // instagram ---------------------------------
    app.get('/unlink/instagram', function(req, res) {
        var user          = req.user;
        user.local.instagram.token = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });
    
};

// route middleware to make sure the user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}

// route middleware ensures the user is logged out
// some content is only accessable by LoggedOut users
// They cannot return to login/register
function isLoggedOut(req, res, next) {

  // if user is authenticated in the session, carry on
  if (!req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}