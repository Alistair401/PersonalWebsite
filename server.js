var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

var router = express.Router();

let port = process.env.PORT || 80;

app.use(bodyParser.json({
    limit: '25mb'
}));

app.use(express.static(__dirname + '/public'));

router.use(function (req, res, next) {
    next();
})

router.route('/github').get(function (req, res) {
    console.log('DEBUG: accessed \'/github\'');
    var request_options = {
        url: 'https://api.github.com/users/Alistair401/repos?client_id=556e2296fcd4cdd9a966&client_secret=44e5efffaafbd594de0aa2c455af25681618317d',
        headers: {
            'User-Agent': 'Alistair401'
        }
    };
    console.log('DEBUG: requesting repos from https://api.github.com/users/Alistair401/repos');
    request(request_options, function (error, response, body) {
        if (error) {
            console.log('DEBUG: error retrieving github repos - ' + error);
            return res.json([{
                name: 'error',
                language: 'error',
                html_url: 'error'
            }])
        }
        res.json(JSON.parse(body));
    });
});

app.use('/', router);

app.listen(port, function () {
    console.log('DEBUG: app started on port ' + port);
});
