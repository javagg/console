/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

({
    appDir:"../",
    baseUrl:"./js",
    dir:"../build",
    mainConfigFile: 'loader.js',
    inlineText: true,
    optimize: "uglify2",
    findNestedDependencies: true,
    removeCombined: false,
    preserveLicenseComments: false,
    generateSourceMaps:true,
    modules: [
        {
            name: "loader"
        }
    ]
})