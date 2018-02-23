"use strict";
const tableau = require("./tableau.js")
const maxNom = tableau.tabNom.length;
const maxPrenom = tableau.tabPrenom.length;
const maxTelephone = tableau.tabTelephone.length;
 const maxCourriel =  tableau.tabCourriel.length;

  const peupler = () => {
  	
  	let position= Math.floor(Math.random()*maxNom)
  	let nom = tableau.tabNom[position]
    position =  Math.floor(Math.random()*maxPrenom)
    let prenom = tableau.tabPrenom[position]
    position =  Math.floor(Math.random()*maxTelephone)
    let telephone = tableau.tabTelephone[position]

  	return {
  		nom: nom,
      prenom : prenom,
      telephone: telephone
  	}
  }
module.exports = peupler;
