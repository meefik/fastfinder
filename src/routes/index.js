const express = require('express');
const router = express.Router();

router.use('/debug', require('./debug'));

module.exports = router;
