function makeBookmarkArray() {
    return [
        {
            id: 1,
            title: 'First Bookmark',
            url: 'http://www.first.com',
            description: '',
            rating: '5'
          },
          {
            id: 2,
            title: 'Second Bookmark',
            url: 'http://www.second.com',
            description: 'This is the second bookmark',
            rating: '5'
          },
          {
            id: 3,
            title: 'Third Bookmark',
            url: 'http://www.third.com',
            description: 'I almost placed. YAYA!!!!',
            rating: '5'
          },
    ];
  }
  
  module.exports = {
    makeBookmarkArray,
  }