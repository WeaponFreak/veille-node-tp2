const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const util = require("util");
const peupler = require("./mes_module/peupler");
const tableau = require("./mes_module/peupler/tableau.js")
const maxNom = tableau.tabNom.length;
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs'); // générateur de template


app.get('/', (req, res) => {
    let cursor = db.collection('adresse')
                  .find()
                  .toArray(function(err, resultat){
                     if (err) return console.log(err);
                     // transfert du contenu vers la vue index.ejs (renders)
                     // affiche le contenu de la BD       
                      res.render('gabarit.ejs', {adresse: resultat});
                    });
})


//////////////////////////////// conextion à mongodb et au serveur express
let db; // variable qui contiendra le lien sur la BD

MongoClient.connect('mongodb://127.0.0.1:27017/carnet_adresse', (err, database) => {
 if (err) return console.log(err);
 db = database.db('carnet_adresse');
// lancement du serveur Express sur le port 8081
 app.listen(8081, () => {
 console.log('connexion à la BD et on écoute sur le port 8081');
 })
})
/////// ajouter nom dans mongo db 

app.post('/ajouter', (req, res) => {
 db.collection('adresse').save(req.body, (err, resultat) => {
 if (err) return console.log(err)
 console.log('sauvegarder dans la BD')
 res.redirect('/')
 })
})
///// destruction de personne dans la bd

app.get('/detruire/:id', (req, res) => {
	var critere = ObjectID(req.params.id)

	db.collection('adresse').findOneAndDelete( {'_id': critere} ,(err, resultat) => {
		if (err) return res.send(500, err)
		var cursor = db.collection('adresse').find().toArray(function(err, resultat) {
			if (err) return console.log(err)
			res.render('gabarit.ejs', {adresse: resultat})
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

		res.render('gabarit.ejs', {adresse: resultat, cle, ordre})
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
		 res.redirect('/')
	 })
})
////peupler

app.get('/peupler', (req, res) => {

 for (var i = 0; i <= maxNom; i++) {
 	 db.collection('adresse').save(peupler(), (err, resultat) => {
	 if (err) return console.log(err)

	 })
 }

 res.redirect('/')
})
///// vider
app.get('/vider', (req, res) => {
 db.collection("adresse").drop(function(err, resultat) {
    if (err) return console.log(err)
  });
 res.redirect('/')
})