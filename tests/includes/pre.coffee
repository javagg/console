casper.test.begin 'test host should be provided via --test_host=<host>', 1, (test) ->
  casper.start().then(->
    test.assertTruthy casper.cli.options.test_host
    test.comment "Running CasperJS #{phantom.casperVersion} via " +
                 "PhantomJS #{phantom.version.major}.#{phantom.version.minor}.#{phantom.version.patch}"
  ).run( (done) ->
    test.done()
  )

# Include global wait timeout / error handling to produce base64 images for debugging.
casper.options.onWaitTimeout = (timeout, condition) ->
  casper.log('A WAIT TIMEOUT OCCURRED, OUTPUTTING BASE64 CAPTURE:', 'warning')
  casper.log('', 'warning')
  casper.log('', 'warning')
  casper.log("data:image/png;base64, " + casper.captureBase64('png'), "warning")
  casper.log('', 'warning')
  casper.log('', 'warning')
  casper.log("Timed out after #{timeout/1000} seconds waiting for: #{JSON.stringify(condition)}")
  @exit 1

casper.options.onError = ->
  casper.log('AN ERROR OCCURRED, OUTPUTTING BASE64 CAPTURE:', 'warning')
  casper.log('', 'warning')
  casper.log('', 'warning')
  casper.log("data:image/png;base64, " + casper.captureBase64('png'), "warning")
  casper.log('', 'warning')
  casper.log('', 'warning')
  @exit 1