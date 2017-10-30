var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var router = express.Router();

let port = process.env.PORT || 80;

app.use(bodyParser.json({
    limit: '25mb'
}));

app.use(express.static(__dirname + '/public'));

router.use(function (req, res, next) {
    next();
})

router.route('/').get(function (req, res) {
    console.log('DEBUG: accessed \'/\'');
    res.sendFile()
});

app.use('/', router);

app.listen(port, function () {
    console.log('DEBUG: app started on port ' + port);
});
