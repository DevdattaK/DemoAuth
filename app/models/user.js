// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var SALT_FACTOR = 10;

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        username     : {
            type : String,
            required : true,
            unique : true
        },
        password     : {
            type : String,
            required : true
        },
        createdAt   : {
            type : Date,
            default : Date.now()
        },
        displayName : {
            type : String
        }
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.name = function(){
    //pass displayName if populated, otherwise pass username
    return this.displayName || this.username;
};

// pre-save to apply uniform logic for every user that gets added to DB
/*steps :
    1. Check if this user exists. If it does, throw error. If not, hash the password and store the user.    
*/
userSchema.pre('save', function(next){
    var curUser = this;

    if(!curUser.isModified('local.password')){
        console.log('password is not modified. So, skip hashing logic.');
        next();
    }
 
    bcrypt.genSalt(SALT_FACTOR, function(err, salt){
        if(err) {return next(err);}
        bcrypt.hash(curUser.local.password, salt, null, function(err, hashedPwd){
            if(err) {return next(err);}

            curUser.local.password = hashedPwd;
            console.log('hashed pwd to be saved.');
            next();
        });
    });
        
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);