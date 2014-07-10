casper.test.begin "Should create a space", 3, (test) ->
  casper.start "#{casper.stackato.console_url}/index.html", ->
    test.assertExists 'title'
    test.assertHttpStatus(200)

  # wait for 'loading console' splash to go away
  casper.waitUntilVisible 'div.navbar-header', ->
    @click 'a[href="#organizations"]'

  casper.waitUntilVisible 'div.organizations-table', ->
      true

  casper.waitForSelector 'tr.organization', ->

    casper.test.comment 'Selecting first organization'
    @click 'tr.organization'

  casper.waitForSelector 'button.btn-add-space', ->
    @click 'button.btn-add-space'

  casper.waitForSelector 'form.create-space-form', ->

    casper.stackato.space_name = 'test' + casper.stackato.getRandom(1, 10000)

    casper.test.comment "Adding a new space: #{casper.stackato.space_name}"

    @fill 'form.create-space-form',
        name: casper.stackato.space_name

    @click 'button.btn-create-space'

    casper.test.comment 'waiting for space table to appear'

  casper.waitForSelector 'span.space-name', ->

    test.assertSelectorHasText('span.space-name', casper.stackato.space_name);

  .run ->
    test.done()

