# Development

## Checking out source

There is one repo in addition to the console repo that needs to be cloned to have a working checkout:

    cd ~/Dev/ActiveState/console/
    git clone git@github.com:ActiveState/cloud-foundry-client-js.git js/lib/cloud-foundry-client

Note you may have to 'git pull' this from time to time as people make changes to it.

## Running the console

The console has been designed to be run outside of the Stackato VM to make development easier.

### Run locally

The best way to run locally is via a local web server. The console can be run simply by opening index.html from your
file system but you will run in to issues during the OAuth flow (this can be worked around by hard coding a token in
js/console.js if you really want to avoid running a local web server - just don't check it in!).

Assuming you have node.js installed you can get a local web server by running the following commands:

    sudo npm install node-static -g
    cd ~/Dev/ActiveState/console/ && static

You can now open the console at http://localhost:8080

There is one caveat when running locally and that is that the CC doesn't support cross origin requests. To work around
this you can tell your browser to run CORS requests anyway. This can be achieved in Chrome by first exiting it and then
running it with the '--disable-web-security' flag e.g on OS X:

    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-web-security

AOK also blocks some cross-origin requests on the server side. You will need to create a file called `DEV_MODE` in your
console/ directory, and rsync it to the VM. Then restart aok (`sup restart aok`) on the VM. AOK will now allow
cross-site json requests.

Finally, you need to tell the console where the CC is, by setting a cookie (for example, by getting a JS console in your
browser's developer tools while the console is open):

    document.cookie = 'STACKATO_CONSOLE_API_ENDPOINT=https://api.stackato-pn4x.local;expires=' + (new Date(2037,1)).toUTCString();

You might also need to set the location to "127.0.0.1:8080/index.html" for the cookie to take effect.

**Note**: You will likely have to visit the endpoint in your browser once to accept the self-signed SSL certificate.
Alternatively, launch Chrome with the '--ignore-certificate-errors' flag.

### Run inside VM

Make changes on your local machine and push the changes to the VM using rsync (modify paths below for your setup):

    rsync -avz --exclude .git ~/Dev/ActiveState/console/ stackato@stackato-vm.local:/home/stackato/stackato/code/console/

Once changes have been synced simply refresh the console in your browser. There is no need to compile the content
or restart any processes.

## Extras

You may find your browser caches the static content of the console and that you're constantly having to clear your
browser cache. A fast and simple approach to fix this is to use the clear-cache extension for Chrome, which gives you a
refresh button that both clears the cache and refreshes the page at the same time.

## Structure

The console is a backbone.js application that runs completely inside the browser. It talks to the CC using asynchronous
XHR requests.

The entry point for the console is js/loader.js which is loaded by index.html. It first declares all the libraries that
the console will use (stored in js/lib/) and then runs js/console.js.

js/console.js will configure various libraries and set up the basic page layout, it then defers to backbone.js for
routing and view rendering.

Views are stored in js/views/ and typically have a .js file as well as a .html template in the templates sub directory.
To understand how views work it's best to read the backbone.js docs.

## Coding Patterns

### Error Handling

Generally errors are handled on a global basis by hooking the ```http_error``` event on the Cloud Foundry client. When
this event is triggered an error dialog is shown automatically to report the error to the
user (see ```js/startup/step-configure-api```).

This typically means that while views must be aware of errors and update the UI accordingly (e.g. resetting button
states, removing loading indicators etc.) the view doesn't have to report the error to the user.

This global error handling can be disabled on a case-by-case basis by setting the ```global:false``` option when calling
the Cloud Foundry client. Global error handling would typically be disabled for requests done during background polling
so as to not spam the user with context-less errors should background polling fail. In this case logging out to the
console would be more appropriate.


Example of disabling global error handling for background polling:

```
    var self = this;
    sconsole.cf_api.cluster.getStatus({global: false}, function (err, status) {
        if (err) {
            self.logger.error('Cluster role check failed: ' + err.message);
        } else {
            self.processClusterRoles(status);
            self.processClusterIssues(status);
        }
        self.startClusterRoleCheck();
    });
```

## Tests

The automated tests are conducted using casperjs: http://docs.casperjs.org/en/latest/modules/tester.html#assert.

CasperJS runs a headless browser with a full javascript environment. If you need to run a JS test
inside the DOM directly use:

    title = @evaluate ->
      return document.title;

    assert(title)

Otherwise, there are plenty of CasperJS helpers like `@getTitle()` which mean
you don't have to use `@evaluate` all the time.

You should make sure that you have casperjs v1.1 or greater and and phantomjs 1.0 or greater installed:
http://docs.casperjs.org/en/latest/modules/casper.html

If you want to run the tests against a VM, all you need to provide is the domain; for example,
`TEST_HOST=domain.com make test`

If you are running the console locally and connecting to an external API, you must provide the locally running console's
IP & the name of the VM serving up the API; for
example, `TEST_HOST=127.0.0.1:8080 TEST_VMNAME=stackato-pn4x make test`

The test suite assumes that the console is served up at `TEST_HOST/console`, so if you're testing the
console locally, you'll need to add a symlink in the console repo's root like so:

    ln -s . console

The test suite expects to be able to login with the user 'stackato' and the password 'stackato',
whom should have administrator privileges. (separate first-login test will replace this soon.)

The login test must always be run first, as it provides the `cf_token` cookie that the rest of the
casperjs process will use.

# Building (for production)

The console is built using requirejs. Requirejs will bundle common functionality in to single files as well as minify JS
and CSS.

```cd /console
npm install requirejs -g
r.js -o ./js/build.js```

The built output wil then be found in /console/build and can be deployed to production.