/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'polyglot',
    'moment',
    'util/settings',
    'appsecute-api/lib/logger'],
    function ($, Polyglot, Moment, Settings, Logger) {

        var logger = new Logger('Startup Step - Localize'),
            languages_path = 'js/translations/languages.json';

        var getFile = function (path) {
            return $.ajax({
                url: path,
                dataType: 'text',
                type: 'GET',
                async: true,
                processData: false,
                cache: false
            });
        };

        var getAvailableLanguages = function (done) {

            getFile(languages_path)
                .done(function (data, textStatus, jqXHR) {

                    var available_languages;
                    try {
                        available_languages = JSON.parse(jqXHR.responseText);
                    } catch (e) {
                        available_languages = {};
                        logger.error('Failed to parse languages, falling back to default.');
                    }

                    done(null, available_languages);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    done(new Error('Failed to load languages: ' + errorThrown));
                });
        };

        var getFallbackTranslation = function (done) {

            var default_locale = Settings.getSetting('default_locale');

            getFile('js/translations/' + default_locale + '.json')
                .done(function (data, textStatus, jqXHR) {

                    try {
                        done(null, JSON.parse(jqXHR.responseText));
                    } catch (e) {
                        done(new Error('Failed to parse fallback "' + default_locale + '" translation, cannot recover.'))
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    done(new Error('Failed to load fallback "' + default_locale + '" translation, cannot recover: ' + errorThrown));
                });
        };

        var getTranslation = function (locale, done) {

            getFile('js/translations/' + locale + '.json')
                .done(function (data, textStatus, jqXHR) {

                    try {
                        var translation = JSON.parse(jqXHR.responseText);
                        done(null, translation);
                    } catch (e) {
                        logger.error('Failed to parse "' + locale + '" translation, falling back to default.');
                        getFallbackTranslation(done);
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    logger.error('Failed to load "' + locale + '" translation, falling back to default: ' + errorThrown);
                    getFallbackTranslation(done);
                });
        };

        return {
            run: function (done) {

                getAvailableLanguages(function (err, languages) {
                    if (err) {return done(err);}

                    var browser_language = window.navigator.userLanguage || window.navigator.language,
                        locale = languages[browser_language] || Settings.getSetting('default_locale');

                    getTranslation(locale, function (err, translation) {
                        if (err) {return done(err);}
                        window.polyglot = new Polyglot({ phrases: translation});
                        Moment.lang(locale);
                        done(null);
                    });
                });
            }
        }
    }
);