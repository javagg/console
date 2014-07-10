x = require('casper').selectXPath

casper.test.begin "Should list available DEA zones", 7, (test) ->

  casper.start "#{casper.stackato.console_url}/index.html", ->
    test.assertExists 'title'
    test.assertHttpStatus 200

  casper.wait '3000', ->
    @click 'a[href="#settings/dea"]'

  casper.waitForSelector '.page-header', ->

  casper.waitUntilVisible '.dea-distribution-zones-settings', ->
    casper.test.comment 'DEA distribution zones sidebar link exists'
    casper.test.assertExists '.dea-distribution-zones-settings'
    @click 'a.dea-distribution-zones-settings'

  casper.waitUntilVisible '.zone-listing .collection-container', ->
    casper.test.comment 'Check that DEA distribution zones table list elements exist'
    casper.test.assertExists '.zone-listing .collection-container .search-container'
    casper.test.assertExists '.zone-listing .collection-container .page table'

    casper.test.comment 'Search for default DEA distribution zone'
    this.fillSelectors '.search-container .input-group', {
        'input.search-input': "default"
    }, false

    this.click '.search-container .input-group .btn-search'

    casper.wait '1000', ->
      casper.test.assertVisible '#default'

      casper.test.comment 'Search for a non-existant DEA distribution zone'
      this.fillSelectors '.search-container .input-group', {
          'input.search-input': "nope"
      }, true

      this.click '.search-container .input-group .btn-search'

      casper.wait '1000', ->
        casper.test.assertNotVisible '#default'

  .run ->
    test.done()