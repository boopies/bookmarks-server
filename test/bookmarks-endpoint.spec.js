const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmark.fixtures')

describe.only('Bookmarks Endpoints', function() {
    let db

    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
      })
      app.set('db', db)
    })
  
    after('disconnect from db', () => db.destroy())
  
    before('clean the table', () => db('bookmarks').truncate())

    afterEach('cleanup', () => db('bookmarks').truncate())

describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
             it(`responds with 200 and an empty list`, () => {
              return supertest(app)
                .get('/bookmarks')
                 .expect(200, [])
             })
           })
    context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarksArray()

        beforeEach('insert bookmarks', () => {
          return db
            .into('bookmarks')
            .insert(testBookmarks)
        })

        it('responds with 200 and all of the articles', () => {
            return supertest(app)
              .get('/bookmarks')
              .expect(200, testBookmarks)
          })
    })
       
context(`Given an XSS attack bookmark`, () => {
    const { maliciousBookmark , expectedBookmark } = makeMaliciousBookmark()

    beforeEach('insert malicious bookmark', () => {
      return db
        .into('bookmarks')
        .insert([ maliciousBookmark ])
    })

    it('removes XSS attack content', () => {
      return supertest(app)
        .get(`/bookmarks`)
        .expect(200)
        .expect(res => {
          expect(res.body[0].title).to.eql(expectedBookmark.title)
          expect(res.body[0].content).to.eql(expectedBookmark.content)
        })
    })
  })
})

describe(`GET /bookmarks/:bookmark_id`, () => {
    context(`Given no bookmarks`, () => {
             it(`responds with 404`, () => {
               const bookmarkId = 123456
               return supertest(app)
                 .get(`/bookmarks/${bookmarkId}`)
                 .expect(404, { error: { message: `Bookmark Not Found` } })
             })
           })
        
    context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarksArray()

        beforeEach('insert bookmarks', () => {
          return db
            .into('bookmarks')
            .insert(testBookmarks)
        })

          it('GET /bookmarks/:bookmark_id responds with 200 and the specified bookmark', () => {
            const bookmarkId = 2
            const expectedBookmark = testBookmarks[bookmarkId - 1]
            return supertest(app)
              .get(`/bookmarks/${bookmarkId}`)
              .expect(200, expectedBookmark)
          })
      })
})

describe(`POST /bookmarks`, () => {
    it(`creates a new bookmark, responding with 201 and the bookmark`,  function() {
        it(`creates an article, responding with 201 and the new article`, function() {
            this.retries(3)
        const newBookmark = {
            title: 'New Bookmark',
            url: 'http://www.newBookmark.com',
            description: 'This is a new bookmark',
            rating: '5'
        }
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(201)
            .expect(res => {
                expect(res.body.title).to.eql(newBookmark.title)
                expect(res.body.url).to.eql(newBookmark.url)
                expect(res.body.description).to.eql(newBookmark.description)
                expect(res.body.rating).to.eql(newBookmark.rating)
                expect(res.body).to.have.property('id')
            })
            .then(postRes =>
                supertest(app)
                .get(`/bookmarks/${postRes.body.id}`)
                .expect(postRes.body)
            )
        })
    })

  const requiredFields = ['title', 'url', 'rating']

  requiredFields.forEach(field => {
    const newBookmark = {
      title: 'Test new bookmark',
      url: 'http://www.google.com',
      rating: '5'
    }

    it(`responds with 400 and an error message when the '${field}' is missing`, () => {
      delete newBookmark[field]
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(400, {
          error: { message: `Missing '${field}' in request body` }
        })
    })
  })

  it(`responds with a 400 and and error message when the rating field is not a number`, () => {
  const newBookmark = {
    title: 'Test new bookmark',
    url: 'http://www.google.com',
    rating: 'five'
  }
  return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(400, {
          error: { message: `Rating has to be a numeral from 0 - 5` }
        })
    })

    it(`responds with a 400 and and error message when the rating field is not a number`, () => {
        const newBookmark = {
          title: 'Test new bookmark',
          url: 'http://www.google.com',
          rating: '-1'
        }
        return supertest(app)
              .post('/bookmarks')
              .send(newBookmark)
              .expect(400, {
                error: { message: `Rating has to be a numeral from 0 - 5` }
              })
          })

    it(`responds with a 400 and and error message when the rating field is not a number`, () => {
        const newBookmark = {
          title: 'Test new bookmark',
          url: 'http://www.google.com',
          rating: '10'
        }
        return supertest(app)
              .post('/bookmarks')
              .send(newBookmark)
              .expect(400, {
                error: { message: `Rating has to be a numeral from 0 - 5` }
              })
          })


          it(`responds with a 400 and and error message when the rating field is not a number`, () => {
            const newBookmark = {
              title: 'Test new bookmark',
              url: 'www.google.com',
              rating: '3'
            }
            return supertest(app)
                  .post('/bookmarks')
                  .send(newBookmark)
                  .expect(400, {
                    error: { message: `URL has to start with http:// and be valid` }
                  })
              })

  it('removes XSS attack content from response', () => {
    const { maliciousBookmark , expectedBookmark } = makeMaliciousBookmark()
    return supertest(app)
      .post(`/bookmarks`)
      .send(maliciousBookmark)
      .expect(201)
      .expect(res => {
        expect(res.body.title).to.eql(expectedBookmark.title)
        expect(res.body.description).to.eql(expectedBookmark.description)
      })
  })
})

describe(`DELETE /bookmarks/:id`, () => {
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()
 
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })
 
      it('responds with 204 and removes the article', () => {
        const idToRemove = 2
        const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/bookmarks`)
              .expect(expectedBookmarks))
      })
    }) 
     
    context(`Given no bookmarks`, () => {
        it(`responds with 404`, () => {
          const bookmarkId = 123456
          return supertest(app)
            .delete(`/bookmarks/${bookmarkId}`)
            .expect(404, { error: { message: `Bookmark Not Found` } })
        })
      })
})
})
