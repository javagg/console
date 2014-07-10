casper.test.begin "Should test the welcome page", 5, (test) ->

  casper.start "#{casper.stackato.console_url}/", ->
    test.assertExists 'title'

  casper.waitFor ->
      return @evaluate ->
          return document.querySelector('.welcome_content')

  casper.then ->
      casper.test.comment 'Checking presence of common welcome page areas'

      test.assertExists '.activity'
      test.assertExists '#about'
      test.assertExists '#blog_posts'

      test.assert @fetchText('span.profile-name') == 'stackato', 'profile-name is "stackato"'

  .run ->
    test.done()

