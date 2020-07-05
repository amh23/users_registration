const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

// User Model
const User = require('../models/User');

//Login Page
router.get('/login',(req, res) => res.sendFile(path.join(__dirname+'/../views/login.html')));

//Regiser Page
router.get('/register',(req, res) => res.sendFile(path.join(__dirname+'/../views/register.html')));

// Register Handle
router.post('/register',(req, res) => {
    const { name, email, password, confirmed_password } = req.body;
    let errors = [];

    // Check required fields
    if(!name || !email || !password || !confirmed_password){
        errors.push({ msg: 'Please fill in all fields'});
    }

    // Check passwords match
    if(password !== confirmed_password){
        errors.push({ msg: 'Passwords do not match'});
    }

    // Check password length
    if(password.length < 6){
        errors.push({ msg: 'Password should be at least 6 characters'});
    }

    if(errors.length > 0){
        res.sendFile((path.join(__dirname+'/../views/register.html')),{
            errors,
            name,
            email,
            password,
            confirmed_password
        });
    } else {
        // Validation pass
        User.findOne({ email: email })
            .then(user => {
                if(user){
                    // User exists
                    errors.push({ msg: 'Email is already registered'});
                    res.sendFile((path.join(__dirname+'/../views/register.html')),{
                        errors,
                        name,
                        email,
                        password,
                        confirmed_password
                    }); 
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    // Hash Password
                    bcrypt.genSalt(10,(err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;

                            // Set password to hashed password
                            newUser.password = hash;
                        }));

                        newUser.save()
                        .then(user => {
                            req.flash('success_msg','You are now registered and can log in');
                            res.redirect('/users/login');
                        })
                        .catch(err => console.log(err));
                }
            });
    }
})

// Login Handle
router.post('/login', (req, res, next) => {
    console.log('login handle')
    passport.authenticate('local',{ 
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;