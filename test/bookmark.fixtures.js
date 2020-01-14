function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'First Bookmark',
            url: 'http://www.first.com',
            description: '',
            rating: 5
          },
          {
            id: 2,
            title: 'Second Bookmark',
            url: 'http://www.second.com',
            description: 'This is the second bookmark',
            rating: 5
          },
          {
            id: 3,
            title: 'Third Bookmark',
            url: 'http://www.third.com',
            description: 'I almost placed. YAYA!!!!',
            rating: 5
          },
    ];
  }
  
function makeMaliciousBookmark() {
    const maliciousBookmark = {
      id: 911,
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      url: 'http://www.dangerousewebsite.com',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      rating: 5
    }
    const expectedBookmark = {
      ...maliciousBookmark,
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousBookmark,
      expectedBookmark,
    }
  }

  module.exports = {
    makeBookmarksArray, makeMaliciousBookmark,
  }