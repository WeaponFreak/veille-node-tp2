const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const util = require("util");
const peupler = require("./mes_module/peupler");
const tableau = require("./mes_module/peupler/tableau.js")
const maxNom = tableau.tabNom.length;
const http = require('http')
///////
const server = http.createServer(app);
const io = require('./mes_module/chat_socket').listen(server);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs'); // générateur de template


/* on associe le moteur de vue au module «ejs» */
app.use(express.static('public'));
const i18n = require('i18n');
const cookieParser = require ('cookie-parser');
app.use(cookieParser())
/* Ajoute l'objet i18n à l'objet global «res» */
i18n.configure({
	locales : ['fr', 'en'],
	cookie : 'langueChoisie',
	directory : __dirname + '/locales'
})
app.use(i18n.init);



app.get('/', function (req, res) {

 	res.render('gabarit.ejs')
})

app.get('/accueil', function (req, res) {

  res.render('gabarit.ejs')
})


app.get('/list', function (req, res) {

	var cursor = db.collection('adresse').find().toArray(function(err, resultat){
	 if (err) return console.log(err)
	 	 console.log('util = ' + util.inspect(resultat));
	 // transfert du contenu vers la vue index.ejs (renders)
	 // affiche le contenu de la BD
	 res.render('list.ejs', {adresse: resultat})
	}) 
})


//////////////////////////////// conextion à mongodb et au serveur express
let db; // variable qui contiendra le lien sur la BD

MongoClient.connect('mongodb://127.0.0.1:27017/carnet_adresse', (err, database) => {
 if (err) return console.log(err);
 db = database.db('carnet_adresse');
// lancement du serveur Express sur le port 8081
 server.listen(8081, () => {
 console.log('connexion à la BD et on écoute sur le port 8081');
 })
})


/////////////////

app.get('/:local(en|fr)', function (req, res) {
	console.log("req.params.local = " + req.params.local)
	res.cookie('langueChoisie', req.params.local)
	res.setLocale(req.params.local)
	console.log(res.__('courriel'))
	res.redirect(req.get('referer'))
});
///////
app.get('/', function (req, res) {
	console.log("req.cookies.langueChoisie = "+ req.cookies.langueChoisie)
	console.log(res.__('courriel'))
	res.render('accueil.ejs')
});


/////// ajouter nom dans mongo db 

app.post('/ajouter', (req, res) => {
 db.collection('adresse').save(req.body, (err, resultat) => {
 if (err) return console.log(err)
 console.log('sauvegarder dans la BD')
 res.redirect('/list')
 })
})
///// destruction de personne dans la bd

app.get('/detruire/:id', (req, res) => {
	var critere = ObjectID(req.params.id)

	db.collection('adresse').findOneAndDelete( {'_id': critere} ,(err, resultat) => {
		if (err) return res.send(500, err)
		var cursor = db.collection('adresse').find().toArray(function(err, resultat) {
			if (err) return console.log(err)
			res.render('list.ejs', {adresse: resultat})
		})
	})
})

////ordre
app.get('/trier/:cle/:ordre', (req, res) => {
	let cle = req.params.cle

	console.log(req.params.ordre);

	let ordre = (req.params.ordre == "asc" ? 1 : -1)
	//ordre == "asc"? ordre="desc": ordre="asc"
	console.log(ordre);

	let cursor = db.collection('adresse').find().sort(cle,ordre).toArray(function(err, resultat) {

		ordre = (req.params.ordre == "asc" ? "desc" : "asc")

		console.log(ordre);

		res.render('list.ejs', {adresse: resultat, cle, ordre})
	})
	
})
/////sauvegarde
app.post('/modifier', (req, res) => {

	
	req.body._id = ObjectID(req.body._id)

	console.log('util = ' + util.inspect(req.body));

	 db.collection('adresse').save(req.body, (err, resultat) => 
	 {
	 if (err) return console.log(err)

		 console.log('sauvegarder dans la BD')
		 res.redirect('/list')
	 })
})
////peupler

app.get('/peupler', (req, res) => {

 for (var i = 0; i <= maxNom; i++) {
 	 db.collection('adresse').save(peupler(), (err, resultat) => {
	 if (err) return console.log(err)

	 })
 }

 res.redirect('/list')
})
///// vider
app.get('/vider', (req, res) => {
 db.collection("adresse").drop(function(err, resultat) {
    if (err) return console.log(err)
  });
 res.redirect('/list')
})

///// chercher
app.post('/recherche', (req, res) => {
	console.log('allo')
	let recherche = req.body.recherche;
	console.log("recherche = " + recherche);
	db.collection('adresse').find({$or : [{nom:req.body.recherche},{prenom:req.body.recherche}]}).toArray(function(err, resultat){
		if (err) return console.log(err)
	 	console.log('util = ' + util.inspect(resultat));
		res.render('list.ejs', {adresse: resultat})
	})
})
/////chat
var nsp = io.of('/mon-espace-de-nom');
nsp.on('connection', function(socket){
  console.log('une connexion');
  nsp.emit('bonjour', 'Bonjour tout le monde!');
});

app.get('/chat', (req, res) => {
	res.render('socket_vues.ejs')
})
/////
app.post('/modifier_ajax', (req, res) => {
	console.log('route /ajax_modifier');
	 console.log('req.body = ' + util.inspect(req.body));
	req.body._id = 	ObjectID(req.body._id);
	console.log('req.body._id = ' + req.body._id);
	db.collection('adresse').save(req.body, (err, result) => {
		if (err) return console.log(err);
		console.log('sauvegarder dans la BD');
		console.log('req.body = ' + util.inspect(req.body));
		res.send(JSON.stringify(req.body));
	})
})
///////////
app.post('/detruire_ajax', (req, res) => {
 console.log('route /detruire')
 console.log('utilreq.body = ' + util.inspect(req.body));	
 // console.log('util = ' + util.inspect(req.body));
 db.collection('adresse').findOneAndDelete({"_id": ObjectID(req.body._id)}, (err, resultat) => {

	if (err) return console.log(err)
	 res.send(JSON.stringify(resultat))  // redirige vers la route qui affiche la collection
 })

})
/////
app.post('/ajouter_ajax', (req,res) => {
console.log('route /ajax_ajouter')	
 db.collection('adresse').save(req.body, (err, result) => {
 if (err) return console.log(err)
 console.log('req.body._id =' + req.body._id)	
 console.log('sauvegarder dans la BD')
    res.send(JSON.stringify(req.body))
 })
})