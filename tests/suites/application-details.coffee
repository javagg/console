x = require('casper').selectXPath

casper.test.begin "Should have application details", 10, (test) ->

  if not casper.options._app_id
    test.skip 10, '[SKIP] Application was not deployed correctly'

  else
    casper.start "#{casper.stackato.console_url}/", ->
      test.assertExists 'title'
      test.assertHttpStatus(200)

    casper.waitForSelector 'a[href="#applications"]', ->
      @click 'a[href="#applications"]'

    casper.waitForSelector "[id='#{casper.options._app_id}']", ->
      @click "[id='#{casper.options._app_id}']"

    casper.waitForSelector '.app-name', ->
      test.assertSelectorHasText '.app-name', casper.options._app_name,
        "App should be named #{casper.options._app_name}"

    casper.waitForSelector '.app-view', ->
      test.assertVisible '.app_description_plain', 'Should show app description'
      test.assertVisible '.app_description_plain.text-muted',
        'App description should show placeholder text'
      test.assertVisible '.app_description_btn',
        'Button to edit description should be visible'

    casper.thenClick '.app_description_btn'

    casper.waitUntilVisible '.app_description_text', ->
      test.assertVisible '.app_description_save'
      @evaluate ->
        document.querySelector('.app_description_text').value = 'Test Description'

    casper.thenClick '.app_description_save'

    casper.waitUntilVisible '.app_description_plain', ->
      # Wait for the text to update
      casper.wait 500, ->
        # Remove the zero width space inserted for line wrapping
        text = @fetchText('.app_description_plain').replace(/\u200b/g, "")
        test.assertEquals text, 'Test Description', "got application description #{escape(text)}"

    # Get back to the app page and check that it's been updated
    casper.thenOpen "#{casper.stackato.console_url}/"

    casper.waitForSelector 'a[href="#applications"]', ->
      @click 'a[href="#applications"]'

    casper.waitForSelector "[id='#{casper.options._app_id}']", ->
      @click "[id='#{casper.options._app_id}']"

    casper.waitUntilVisible '.app_description_plain', ->
      # Wait for the text to update
      casper.wait 500, ->
        # Remove the zero width space inserted for line wrapping
        text = @fetchText('.app_description_plain').replace(/\u200b/g, "")
        test.assertEquals text, 'Test Description', "got application description #{escape(text)}"

    # Wait for the app to finish starting. (It was requested on app store deploy)
    casper.then ->
      test.comment 'Waiting for application to start running...'

    casper.stackato.waitUntilVisibleThenClick 'a[href="#tab_instances"]'

    casper.waitUntilVisible x('//div[@id="tab_instances"]//tr[@class="instance"]/td[contains(text(), "RUNNING")]'), (->
      casper.log 'App running, waiting to make sure it stays up...', 'debug'
      casper.wait 5000
    ), null, 120000 # Could take two minutes on the nightly test machine

    # Check again, half the time it goes down again :|
    casper.waitUntilVisible x('//div[@id="tab_instances"]//tr[@class="instance"]/td[contains(text(), "RUNNING")]'), (->
      casper.log 'App still running'
    ), null, 60000

    casper.stackato.waitUntilVisibleThenClick 'a[href="#tab_logs"]'

    # Change something to require restart
    casper.waitUntilVisible 'a[href="#tab_settings"]', ->
      casper.click 'a[href="#tab_settings"]'
      test.assertNotVisible '.restart_required'

    casper.stackato.waitUntilVisibleThenClick '#input-single-signon2'

    casper.stackato.waitUntilVisibleThenClick '.save-settings:not([disabled])'

    casper.waitUntilVisible '.save-settings:not(.disabled)'

    casper.waitUntilVisible '.restart_required'

  casper.run ->
    test.done()
