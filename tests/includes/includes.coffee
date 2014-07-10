casper.stackato = {}
casper.stackato.test_host = casper.cli.options.test_host
casper.stackato.http_console_url = "http://#{casper.stackato.test_host}/console"
casper.stackato.https_console_url = "https://#{casper.stackato.test_host}/console"
casper.stackato.https_url = "https://#{casper.stackato.test_host}"

if casper.cli.options.use_http
    # Force use http console for tests (e.g. using node_static)
    casper.stackato.console_url = casper.stackato.http_console_url
else
    casper.stackato.console_url = casper.stackato.https_console_url

if casper.cli.options.api_endpoint
    # Use an external API endpoint
    phantom.cookiesEnabled = true
    phantom.addCookie {
        name: "STACKATO_CONSOLE_API_ENDPOINT",
        value: casper.cli.options.api_endpoint.replace(/\/$/, ""),
        domain: "127.0.0.1",
        expires: (new Date).getTime() + (1000 * 60 * 60)
    }
    casper.test.begin "Test that the API endpoint cookie was set", 2, (test) ->

        casper.start casper.stackato.console_url, ->
            test.assertHttpStatus(200)

        casper.then((resp)->
            cookie = @evaluate(->
                document.cookie)
            test.assertTruthy cookie
        ).run( (done) ->
            test.done()
        )

casper.stackato.getRandom  = (min, max) ->
    return min + Math.floor(Math.random() * (max - min + 1))

casper.stackato.waitUntilVisibleThenClick = (selector, onTimeout, timeout) ->
    casper.waitUntilVisible selector, ( ->
        casper.click selector
    ), onTimeout, timeout

# Turn off all CSS and jQuery transitions
casper.on 'page.initialized', ->
    casper.evaluate ->
        window.addEventListener 'load', ->
            css = document.createElement 'style'
            css.type = 'text/css'
            css.innerHTML = '* { -webkit-transition: none !important; transition: none !important; }'
            document.body.appendChild css

            if jQuery
                jQuery.fx.off = true
