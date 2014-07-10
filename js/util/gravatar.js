/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 *
 * Utils for working with Gravatar images.
 */

define(['crypto/md5'],
    function (MD5) {
        return {

            /**
             * Gets the url to a users Gravatar image.
             * @param {String} email The users email address.
             * @param {Number} size The desired size of the image.
             * @returns {string} The url to the users Gravatar image.
             */
            getGravatarImageUrl: function (email, size) {
                return email ?
                    ('https://www.gravatar.com/avatar/' + MD5.MD5(email) + '.jpg?s=' + (size || 32)) :
                    '';
            }
        }
    }
);