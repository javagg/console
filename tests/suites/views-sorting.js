const x = require('casper').selectXPath;
const url = casper.stackato.console_url + "/index.html#";

/**
 * Get the xpath selector to find the row for the given user in the users list
 * @param name {string} The name of the user
 * @param extra {string} (Optional) Extra expression to append to the selector,
 *      to find elements inside the row
 * @returns The xpath selector to the row (or the given element in the row)
 */
function user_xpath_expr(name, extra) {
    return x("//tr[contains(@class, 'clickable') and " +
        "./td[@class='linked_entity' and contains(text(), '" +
        name + "')]]" + (extra || ""));
}

/**
 * Delete the given user, if it exists
 * @param name {string} The name of the user to delete
 */
function delete_user(name) {
    casper.log("Deleting user " + name);
    casper.thenOpen(url);
    casper.stackato.waitUntilVisibleThenClick('a[href="#admin/users"]')

    // Wait for the admin user to show up
    casper.waitUntilVisible(user_xpath_expr("stackato"));

    casper.then(function() {
        // Check for the target user
        try {
            var info = casper.getElementInfo(user_xpath_expr(name));
        } catch(e) {
            if (/element not found\.$/.test(e.message)) {
                casper.log("User " + name + " not found; skipping.", "debug");
                return;
            }
            throw e;
        }

        if (!info) {
            return; // No such user
        }
        casper.log("Found user " + name + ", deleting...", "debug");
        casper.click(user_xpath_expr(name, "//button[contains(@class, 'delete-user')]"));
        casper.waitUntilVisible('.modal-dialog .btn.delete-user', function() {
            casper.click('.modal-dialog .btn.delete-user');
        });
    });
}

/**
 * Add the given user
 * @param name {string} The name of the user to add
 * @param is_admin {boolean} Whether the user should be an admin
 * @note It is an error to add a user that already exists
 */
function add_user(name, is_admin) {
    casper.thenOpen(url);
    casper.stackato.waitUntilVisibleThenClick('a[href="#admin/users"]')

    casper.waitUntilVisible(".create-user", function() {
        this.click(".create-user");
    });

    casper.waitUntilVisible(".modal-dialog .create-user", function() {
        this.fill(".create-user-form", {
            username: name,
            email: name + "@example.org",
            password: "stackato",
            password2: "stackato",
        });
        if (is_admin) {
            this.fill(".create-user-form", {
                "make-admin": true
            });
        }
        this.click(".modal-dialog .create-user");
    });

    casper.waitWhileVisible(".modal-dialog .create-user");
}

/**
 * Check that the given users are in the given order
 * @param test {Tester} The test being run
 * @param expected {strings} The users to check
 * e.g. user_check_order(test, "aardvark", "baa") asserts that the user
 * "aardvark" is listed before the user "baa".
 */
function user_check_order(test /* ... expected */ ) {
    var expected = [].slice.call(arguments, 1);

    for (var i = 0; i < expected.length; ++i) {
        casper.waitUntilVisible(user_xpath_expr(expected[i]));
    }

    casper.log("Users visible, checking order...", "debug");

    casper.then(function() {
        for (var i = 0; i < expected.length - 1; ++i) {
            var first = this.getElementInfo(user_xpath_expr(expected[i])).y;
            var second = this.getElementInfo(user_xpath_expr(expected[i + 1])).y;
            test.assert(first < second,
                        "user " + expected[i] + "@" + first +
                        " not before " + expected[i + 1] + "@" + second);
        }
    });
}

casper.test.begin("Should sort views", 10, function(test) {

    casper.start(url, function () {
        test.assertExists('title');
        test.assertHttpStatus(200);
    });

    delete_user("aardvark");
    delete_user("baa");
    delete_user("cab");

    add_user("cab", true);
    add_user("aardvark", true);
    add_user("baa", false);

    casper.thenOpen(url);
    casper.stackato.waitUntilVisibleThenClick('a[href="#admin/users"]')

    // Check default order
    user_check_order(test, "cab", "aardvark", "baa");

    // Sort by user name
    casper.stackato.waitUntilVisibleThenClick(".order-by button");
    casper.stackato.waitUntilVisibleThenClick(".order-by a[data-value='username']");
    casper.wait(500); // Let the page load

    // Check that our button turned btn-info
    casper.waitUntilVisible(".order-by button", function() {
        test.assertVisible(".order-by button.btn-info");
    });

    user_check_order(test, "aardvark", "baa", "cab");

    // Descending sort
    casper.stackato.waitUntilVisibleThenClick(".sort-order button");
    casper.stackato.waitUntilVisibleThenClick(".sort-order a[data-value='desc']");
    casper.wait(500);

    user_check_order(test, "cab", "baa", "aardvark");

    casper.stackato.waitUntilVisibleThenClick(".filter-by button");
    casper.stackato.waitUntilVisibleThenClick(".filter-by *[data-key='admin'] *[data-value='false']");

    casper.waitWhileVisible(user_xpath_expr("aardvark"), function() {
        test.assertVisible(user_xpath_expr("baa"));
    });

    casper.run(function() {
        return test.done();
    });

});