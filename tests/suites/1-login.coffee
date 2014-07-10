phantom.cookiesEnabled = true

casper.test.begin "Should login to the console", 2, (test) ->

  phantom.deleteCookie 'cf_token'

  casper.start "#{casper.stackato.https_console_url}/", ->
    test.assertExists 'title'

  casper.waitUntilVisible 'form#login_form', ( ->
    @fill 'form#login_form',
      auth_key: 'stackato',
      password:  'stackato'
    , true
  )

  casper.waitUntilVisible '.welcome_content'

  casper.then ->
    cookie = @evaluate ->
        return document.cookie
    cookies = cookie.split(/;\s*/)
    for c in cookies
      spl = c.split('=')
      if spl[0] == 'cf_token'
        casper.stackato.auth_token = spl[1]

    test.assertTruthy(casper.stackato.auth_token)

  .run ->
    test.done()

