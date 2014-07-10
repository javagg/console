casper.options.waitTimeout = 10000

casper.test.begin "Should test the app store", 4, (test) ->

  casper.start "#{casper.stackato.console_url}/index.html", ->
    test.assertExists 'title'
    test.assertHttpStatus(200)

  casper.waitForSelector 'a[href="#store"]', ->
    @click 'a[href="#store"]'

  casper.waitForSelector 'li.store-app', ->

    apps = @evaluate ->
      return document.querySelectorAll('li.store-app')

    test.assert apps.length > 5

  casper.waitForSelector 'li[data-app-id="env"]', ->
    @click 'li[data-app-id="env"] div.store-app-footer div.app-actions a.deploy_app'

  casper.waitForSelector '#deploy-app-btn', ->

    casper.options._app_name =
    app_name = 'test-env-'  + casper.stackato.getRandom(1, 10000)

    @fill '#app-deploy-form',
      autostart: true # force download?
      name: app_name

    @click '#deploy-app-btn'

  # Check if an error happens
  casper.waitUntilVisible '#error-dialog', ( ->
    error = @evaluate ->
      return document.querySelector('#error-dialog .alert-danger').innerText
    test.fail "Error occurred: " + error
  ), ( ->
    casper.log "No errors after deploy", "debug"
  ), 3000

  # Look for the app id

  app_id = null
  casper.waitUntilVisible '.app-name', ( ->
    url = casper.page.url
    hash = url.split("#")[1]
    app_id = hash.split("/")[1]
  )

  casper.then ->
      casper.log "App ID: " + app_id, "debug"
      test.assertMatch app_id, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      casper.options._app_id = app_id

  .run ->
    test.done()

