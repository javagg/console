var x = require('casper').selectXPath;

casper.test.begin("Should add a user", 2, function (test) {

    casper.start(casper.stackato.console_url + "/index.html", function () {
        test.assertExists('title');
        return test.assertHttpStatus(200);
    });

    casper.waitUntilVisible('.page-header');
    casper.stackato.waitUntilVisibleThenClick('a[href="#admin/users"]');

    casper.stackato.waitUntilVisibleThenClick('.create-user');
    casper.then(function() {
        casper.test.comment('Adding a new user');
    });

    casper.waitUntilVisible('.create-user-form', function () {
        this.user = 'test' + casper.stackato.getRandom(1, 10000);
        this.fill('form.create-user-form', {
            username: this.user,
            email: 'test@test.com',
            password: 'test',
            password2: 'test',
            'make-admin': true
        });

        casper.options.waitTimeout = 10 * 1000;

        return this.click('div.modal-footer button.create-user');
    });

    casper.run(function () {
        return test.done();
    });
});
