var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()
var request = require('superagent')

var SandCastle = require('sandcastle').SandCastle
var sandcastle = new SandCastle({
	timeout: 6000,
	api: './api.js'
})

function generateSlug() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

mongoose.connect('mongodb://localhost/microku')

var Service = mongoose.model('Service', { code: String, slug: String });

router.get('/', function(req, res) {
	res.render('index', { title: 'Microku' });
})

router.post('/', function(req, res) {
	var slug = generateSlug()
	var service = new Service({ code: req.body.code, slug: slug })
	service.save(function(err) {
		if(err) { return res.send({}) }
		res.redirect('/services/' + slug)
	})
})

router.get('/:slug', function(req, res) {

	Service.findOne({ 'slug': req.params.slug }, 'code slug', function(err, service) {
		console.log(err, service)
		if(!err && service) {
			var script = sandcastle.createScript(service.code)

			script.on('exit', function(err, output) {
				res.send(output)
			})

			script.on('timeout', function(err, output) {
				res.send({})
			})

			script.run({name: 'Ben'})
		} else {
			res.send({ service: 'not found' })
		}
	})

})

module.exports = router