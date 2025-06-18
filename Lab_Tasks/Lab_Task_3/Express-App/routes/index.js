var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET admin dashboard */
router.get('/admin', function(req, res, next) {
  res.render('admin/admin', { layout: 'admin/adminlayout' });
});

module.exports = router;
