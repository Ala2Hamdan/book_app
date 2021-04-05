'use strict';
const express = require('express');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use(errorFunction);

app.set('view engine', 'ejs');
app.get('/',homePage);

app.get('/searches/new', formShow);

function homePage(req ,res){
  res.render('pages/index');
}
function formShow(req, res) {
  res.render('pages/searches/new');
};
app.post('/searches', createSearch);

app.listen(PORT, () => { console.log('Listening on ', PORT);});
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
  console.log(data);
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors.join(', ');
  this.description = data.volumeInfo.description;
  this.image = (data.volumeInfo.imageLinks) ? data.volumeInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
}
