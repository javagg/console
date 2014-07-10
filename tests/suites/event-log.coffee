casper.test.begin "Should test the event log page", 3, (test) ->

  casper.start "#{casper.stackato.console_url}/index.html", ->
    test.assertExists 'title'
    test.assertHttpStatus(200)

  casper.wait '3000', ->
    @click 'a[href="#eventlog"]'

  casper.waitForSelector '#cloud-events_wrapper', ->

  casper.wait '3000', ->
    casper.test.comment 'Checking the cloud event log entries'

    log_entries = @evaluate ->
      return document.querySelectorAll("tr.cloud_event")

    test.assert log_entries.length > 2

  .run ->
    test.done()

