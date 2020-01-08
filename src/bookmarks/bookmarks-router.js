const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require('../store')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get((req,res) => {
        res.json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const {title, url, rating, desc} = req.body;

        if (!title){
            logger.error('Title is required')
            return res
                    .status(400)
                    .send('Input a Title')
        }
    
        if (!url){
            logger.error('URL is required')
            return res
                    .status(400)
                    .send('input a URL')
        }

        if (!url.match(/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i)){
            logger.error('URL is not a proper URL')
            return res
                    .status(400)
                    .send('URL has to start with http:// or ftp://')
        }

        if (!rating){
            logger.error('Rating is required')
            return res
                    .status(400)
                    .send('Input a Rating')
        }

        if (isNaN(rating)){
            logger.error('Rating is has to be a number')
            return res
                    .status(400)
                    .send('Rating is has to be a number')
        }

        if (rating > 5 || rating < 0 ){
            logger.error('Rating has to be from 0 - 5')
            return res
                    .status(400)
                    .send('Rating has to be from 0 - 5')
        }

        if (!desc){
            logger.error('Description is required')
            return res
                    .status(400)
                    .send('Input a Description')
        }
    
        const id = uuid();
    
        const bookmark = {
            id,
            title,
            url,
            rating,
            desc
        };
        
        bookmarks.push(bookmark);

        logger.info(`Bookmark with id ${id} created`);
        
        res
          .status(201)
          .location(`http://localhost:8000/bookmark/${id}`)
          .json(bookmark);
    
    })


bookmarksRouter
    .route('/bookmarks/:id')
    .get((req,res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(bm => bm.id == id);
  
        // make sure we found a card
        if (!bookmark) {
          logger.error(`Bookmark with id ${id} not found.`);
          return res
            .status(404)
            .send('Bookmark Not Found');
        }
      
        res.json(bookmark);
      })
    .delete((req, res) =>{
        const { id } = req.params;
        const bookmarkIndex = bookmarks.findIndex(bm => bm.id == id);
        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
              .status(404)
              .send('Not found');
          }

          bookmarks.splice(bookmarkIndex, 1);
        
          logger.info(`Card with id ${id} deleted.`);
          res
            .status(204)
            .end();
    })


module.exports = bookmarksRouter