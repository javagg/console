x = require('casper').selectXPath

casper.test.begin "Should support application auto-scaling", 9, (test) ->

  if not casper.options._app_id
    test.skip 9, '[SKIP] Application was not deployed correctly'

  else
    # Find the application
    casper.start "#{casper.stackato.console_url}/", ->
      test.assertExists 'title'
      test.assertHttpStatus(200)

    casper.stackato.waitUntilVisibleThenClick 'a[href="#applications"]'
    casper.stackato.waitUntilVisibleThenClick "tr[id='#{casper.options._app_id}']"

    casper.waitForSelector '.app-name', ->
      test.assertSelectorHasText '.app-name', casper.options._app_name,
        "App should be named #{casper.options._app_name}"

    casper.then ->
      test.comment 'Make sure app is running'
    casper.stackato.waitUntilVisibleThenClick 'a[href="#tab_instances"]'
    casper.waitUntilVisible x('//div[@id="tab_instances"]//tr[@class="instance"]/td[contains(text(), "RUNNING")]'), (->
      casper.log 'App running, waiting to make sure it stays up...', 'debug'
      casper.wait 5000
    ), null, 120000 # Could take two minutes on the nightly test machine

    casper.then ->
      test.comment 'Reducing memory settings for app'
      casper.log 'waiting for five seconds...', 'debug'
      casper.wait 5000

    casper.stackato.waitUntilVisibleThenClick 'a[href="#tab_settings"]'

    casper.waitUntilVisible '.save-settings'
    casper.waitUntilVisible '#input-memory-allotted', ->
      casper.fillSelectors '.app-settings-form',
        '#input-memory-allotted': '128'

    casper.stackato.waitUntilVisibleThenClick '.btn-save:not([disabled])'
    casper.waitUntilVisible '.btn-save[disabled]'
    casper.then ->
      # Wait a bit for it to actually apply :(
      casper.wait 5000

    # Back to the app to make sure the limits are reloaded :|
    casper.thenOpen "#{casper.stackato.console_url}/"
    casper.then ->
      test.assertExists 'title'
      test.assertHttpStatus(200)

    casper.stackato.waitUntilVisibleThenClick 'a[href="#applications"]'
    casper.stackato.waitUntilVisibleThenClick "tr[id='#{casper.options._app_id}']"

    casper.stackato.waitUntilVisibleThenClick 'a[href="#tab_settings"]'
    casper.waitUntilVisible '#input-memory-allotted', ->
      test.assertField 'mem', '128'

    # Go to the instances tab
    casper.waitForSelector 'a[href="#tab_instances"]', ->
      @click 'a[href="#tab_instances"]'

    # Adjust some settings
    casper.waitUntilVisible '#autoscaling-status .toggle-blob', ->
      test.comment 'Enabling autoscaling...'
      @click '#autoscaling-status'

    casper.then ->
      test.comment 'Adjusting CPU threshold...'

    casper.waitUntilVisible '#slider-cpu-threshold .ui-slider-range', ->
      @evaluate ->
        $('#slider-cpu-threshold')
          .attr('_unit_test', true)
          .slider('values', 1, 95)
          .removeAttr('_unit_test')

    casper.waitUntilVisible '#cpu-threshold-saved'
    casper.waitWhileVisible '#cpu-threshold-saved'

    casper.waitUntilVisible '#slider-cpu-threshold .ui-slider-range', ->
      @evaluate ->
        $('#slider-cpu-threshold')
          .attr('_unit_test', true)
          .slider('values', 0, 90)
          .removeAttr('_unit_test')

    casper.waitUntilVisible '#cpu-threshold-saved'
    casper.waitWhileVisible '#cpu-threshold-saved'

    casper.then ->
      test.comment 'Adjusting instance limits...'

    casper.waitUntilVisible '#slider-app-autoscaling-instances .ui-slider-range', ->
      @evaluate ->
        $('#slider-app-autoscaling-instances')
          .attr('_unit_test', true)
          .slider('values', 1, 3)
          .removeAttr('_unit_test')

    casper.waitUntilVisible '#app-autoscaling-instances-saved'
    casper.waitWhileVisible '#app-autoscaling-instances-saved'

    casper.waitUntilVisible '#slider-app-autoscaling-instances .ui-slider-range', ->
      @evaluate ->
        $('#slider-app-autoscaling-instances')
          .attr('_unit_test', true)
          .slider('values', 0, 2)
          .removeAttr('_unit_test')

    casper.waitUntilVisible '#app-autoscaling-instances-saved'
    casper.waitWhileVisible '#app-autoscaling-instances-saved'

    casper.then ->
      test.comment 'Checking scaling values were persisted...'

    # Go back to the application from the top
    casper.thenOpen "#{casper.stackato.console_url}/"
    casper.stackato.waitUntilVisibleThenClick 'a[href="#applications"]'
    casper.stackato.waitUntilVisibleThenClick "tr[id='#{casper.options._app_id}']"

    casper.waitForSelector '.app-name', ->
      test.assertSelectorHasText '.app-name', casper.options._app_name,
        "App should be named #{casper.options._app_name}"

    # Go to the instances tab
    casper.waitForSelector 'a[href="#tab_instances"]', ->
      @click 'a[href="#tab_instances"]'

    # Check that the settings were saved
    casper.waitForSelector '#slider-cpu-threshold .ui-slider-range', ( ->
      test.assertEvalEquals ( ->
        return $('#slider-cpu-threshold').slider('values')
      ), [90, 95], 'CPU thresholds were set')

    casper.waitForSelector '#slider-app-autoscaling-instances .ui-slider-range', ( ->
      test.assertEvalEquals ( ->
        return $('#slider-app-autoscaling-instances').slider('values')
      ), [2, 3], 'instance thresholds were set')

  casper.run ->
    test.done()
