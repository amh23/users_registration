const express = require('express');
const router = express.Router();
const path = require('path');
const { ensureAuthenticated } = require('../config/auth');

// Welcome
router.get('/',(req, res) => res.sendFile(path.join(__dirname+'/../views/welcome.html')));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => res.sendFile(path.join(__dirname+'/../views/dashboard.html')));

module.exports = router;