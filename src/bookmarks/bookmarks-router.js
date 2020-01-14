const express = require('express')
//const uuid = require('uuid/v4')
const logger = require('../logger')
const regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i
//const { bookmarks } = require('../store')
const BookmarksService = require('../bookmarks-service')
const xss = require('xss')

const bookmarksRouter = express.Router()
const jsonParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: Number(bookmark.rating),
  })

bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(bookmarks => {
            res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, url, description, rating } = req.body
        const newBookmark = { title, url, description, rating  }
        const reqNewBookmark = { title, url, rating }
        for (const [key, value] of Object.entries(reqNewBookmark)) {
            if (value == null) {
                logger.error(`invalid ${key} is supplied`)
              return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
              })
            }
          }  

        if (!url.match(regex)){
            logger.error(`invalid ${url} is supplied`)
            return res
                    .status(400)
                    .json({
                        error: {message:'URL has to start with http:// and be valid'}
                })
        }

        if (isNaN(rating) || rating > 5 || rating < 0 ){
            logger.error(`Invalid rating ${rating} is supplied`)
            return res
                    .status(400)
                    .json({
                        error: {message: 'Rating has to be a numeral from 0 - 5'}
                })
        }

        BookmarksService.insertBookmark(
          req.app.get('db'),
          newBookmark
        )
          .then(bookmark => {
            res
              .status(201)
              .json(serializeBookmark(bookmark))
          })
          .catch(next)
      
    })

bookmarksRouter
    .route('/bookmarks/:bookmark_id')
    .all((req, res, next) => {
        const { bookmark_id } = req.params
        BookmarksService.getById(req.app.get('db'), bookmark_id)
        .then(bookmark => {
          if (!bookmark) {
            logger.error(`Bookmark with id ${bookmark_id} not found.`)
            return res.status(404).json({
              error: { message: `Bookmark Not Found` }
            })
          }
          res.bookmark = bookmark
          next()
        })
        .catch(next)
      })
    .get((req, res) => {
            res.json(serializeBookmark(res.bookmark))
        })
    .delete((req, res, next) =>{
        BookmarksService.deleteBookmark(
                req.app.get('db'),
                req.params.bookmark_id
        )
        .then(numRowsAffected => {
            res.status(204)
                .end()
          })
          .catch(next)
    })


module.exports = bookmarksRouter