'use strict';
const express = require('express');
const superagent = require('superagent');

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;

const pg = require('pg');
const client = new pg.Client( process.env.DATABASE_URL);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

client.connect().then(()=>{
  app.listen(PORT, () => { console.log('Listening on ', PORT);});
})
app.use(errorFunction);

app.set('view engine', 'ejs');
app.get('/',homePage);

app.get('/searches/new', formShow);

function homePage(req ,res){
  let sql = "SELECT * FROM books";
  client.query(sql).then(data =>{
    console.log(data.rows);
    let number =data.rows.length;
     res.render('pages/index',{bookResult:data.rows , num:number});
    
    
  })

}
function formShow(req, res) {
  res.render('pages/searches/new');
};
app.post('/searches', createSearch);
app.post('/',saveDataFrom);
app.get('/books/:id',datailsFunction);
 
function datailsFunction(req ,res){
 let idD = req.params.id
 let sql ="SELECT * FROM books WHERE id=$1"
 
 client.query(sql,[idD]).then(element =>{
  res.render('pages/books/detail', {detialView:element.rows[0]})
 })
}

function saveDataFrom(req ,res){
 let info = req.body;
 console.log(info);
 let sql = "INSERT INTO books (author, title, isbn, image_url, description) Values ($1,$2,$3,$4,$5) RETURNING *";
 let values =[info.author,info.title,'',info.img ,info.desc];
 client.query(sql,values).then(result=>{
  let idData = result.rows[0].id;
  console.log(idData);
   res.redirect(`/book/${idData}`)
 })

}

app.get('*', (req, res) => { res.status(404).send('Page Not Found');
});

function errorFunction(err, req, res, next) {
  res.status(500).render('pages/error', { error: err });
}
function createSearch(req, res) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (req.body['search'] === 'title') { url += `+intitle:${req.body['name']}`; }
  if (req.body['search'] === 'author') {url += `+inauthor:${req.body['name']}`;}
  superagent.get(url).then(data => {
      return data.body.items.map(items => new Books(items));
    })
    .then(result => res.render('pages/searches/show', { searchResult: result }));
}


function Books(data) {
  // console.log(data);
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors.join(', ');
  this.description = data.volumeInfo.description;
  this.image = (data.volumeInfo.imageLinks) ? data.volumeInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
}


