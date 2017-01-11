var User = require('./models/user');
var multer = require('multer');
var upload = multer({des : '../uploads'});
var fs = require('fs');

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);
    // process the login form
    app.post('/login', function(req, res, next){
            console.log('login - about to invoke passport.authenticate');
            next();
        },
        passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
        //session : false     //disabling session support
    }));

    
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
    // process the signup form
    app.post('/signup', 
        /**/
        upload.single('profilePic'),
        function(req, res, next){
            var _username = req.body.username;
            var _password = req.body.password;

            var base64Encoded = req.file.buffer.toString('base64');

            console.log('Encoded String : ', base64Encoded);

            User.findOne({'local.username' : _username}, function(err, user){
                if(err){
                    return next(err);
                }
                if(user){
                    req.flash('signupMessage', 'User with same username exist already.');
                    return res.redirect('/signup');
                }

                var newUser = new User();
                newUser.local.username = _username;
                newUser.local.password = _password;
                newUser.local.displayName = req.body.displayName;
                newUser.local.profilePic.contentType = req.file.mimetype;
                newUser.local.profilePic.base64EncodedImage = ' ';
                newUser.local.profilePic.base64EncodedImage = 'data:' + req.file.mimetype + ';base64,' + base64Encoded;

                newUser.save(function(err){
                    if(err)
                        return next(err);

                    console.log('saved user. Calling passport.authenticate() now');
                    return next();
                });
            })
        },
        /**/
         passport.authenticate('local-signup', {
            successRedirect:'/profile',
            failureRedirect:'/signup',        
            failureFlash:true
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
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
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}