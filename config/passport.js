var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions    
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log("calling callback of serializer..");
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log("calling callback of deserializer..");
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({        
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { 
        // find a user whose username is the same as the username typed by current user
        
        User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

/**/
    passport.use('local-signup', new LocalStrategy(function(username, password, done){
        console.log('In LocalStrategy constructor, which is empty. Calling done() now.');
        var newUser = null;
        User.findOne({'local.username' : username}, function(err, user){
            if(err)
                return done(err);
            console.log('found the user that is saved in prev step', user);
            newUser = user;
            done(null, newUser);
        });
        
    }));
/**/

/*
    passport.use('local-signup', new LocalStrategy({        
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
    function(req, username, password, done) {

        console.log("signup - calling callback of 'LocalStrategy'..");

        // asynchronous
        // User.findOne wont fire unless data is sent back
        //process.nextTick(function() {

        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that username
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {

                // if there is no user with that username
                // create the user
                var newUser = new User();

                // set the user's local credentials
                newUser.local.username    = username;
                newUser.local.displayName = req.body.displayName;
                newUser.local.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        return done(err, false);
                        //throw err;
                    return done(null, newUser);
                });
            }

        });    

        //});

    }));
*/

};