'use strict';
const express =require('express');
require('dotenv').config();
const superagent = require('superagent');

let app = express();
const PORT =process.env.PORT || 3000 ;

app.set('view engine', 'ejs');

app.get('/hello',homePage);
// app.get('/',(req ,res)=>res.send('hello '));

app.listen( PORT,()=>{
console.log(`this application listen to port${PORT}`);
});

function homePage(require,response){
    response.render('pages/index');
}



