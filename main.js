"use strict";

// const tableau = requier ("./mes_module/peupler/tableau.js")
const peupler = require("./mes_module/peupler")
const util = require("util")
console.log("dans main.js =" + util.inspect(peupler()));

