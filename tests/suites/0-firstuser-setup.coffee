phantom.cookiesEnabled = true


casper.test.begin "Should setup the firstuser if necessary", 5, (test) ->

  casper.start "#{casper.stackato.console_url}", ->
    test.assertHttpStatus(200) # 1

  casper.options.waitTimeout = 60 * 1000 # page may take a while to load on a cold start

  casper.waitUntilVisible '#setup-form, #login_form', ( ->
  ), timeout = ->
    casper.test.fail "Neither first user setup or login page appeared"

  casper.then ->

      if @exists '#setup-form'
        casper.then ->

          @fill 'form#setup-form',
            username: 'stackato',
            email: 'stackato@stackato.com',
            password:  'stackato',
            password2:  'stackato',
            org: 'test-org',
            space: 'test-space',
            agree: true

          @click 'button.btn-setup'

        casper.waitUntilVisible '#login_form', ( ->
          casper.test.pass 'First user setup' # 2

        ), timeout = ->
          casper.test.fail "Login form did not load"

        casper.then ->

          @fill 'form#login_form',
            auth_key: 'stackato',
            password: 'stackato'
          , true

        casper.waitUntilVisible '.welcome_content', ( ->
          casper.test.pass 'Logged in' # 3
        ), timeout = ->
          casper.test.fail("Could not log in; currently on " +
            casper.page.frameUrl)

        casper.then ->
          @click 'a[href="#organizations"]'

        casper.waitUntilVisible '.organization', ( ->
          @click '.organization'
        ), timeout = ->
          casper.test.fail "Could not find organization"

        casper.waitUntilVisible '.space', ( ->
          @click '.space'
        ), timeout = ->
          casper.test.fail "Could not find space"

        casper.waitUntilVisible '#space_tabs a[href="#tab_managers"]', ( ->
          @click '#space_tabs a[href="#tab_managers"]'
        ), timeout = ->
          casper.test.fail "Could not list managers"

        casper.waitUntilVisible '.table-managers-list .user', ( ->
          casper.test.pass "Found manager" # 4
        ), timeout = ->
          casper.test.fail "Could not find manager"

        casper.then ->
          @click '.logout'

        casper.waitUntilVisible '#login_form', ( ->
          casper.test.pass "Logged out"
        ), timeout = ->
          casper.test.fail "Could not log out"
      else
        casper.test.skip 4, '[SKIP] First user already set up'

      casper.options.waitTimeout = 10 * 1000

  .run ->
    test.done()

