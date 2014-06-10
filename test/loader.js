mocha.setup({
    ui: 'bdd',
    globals: ['jQuery']
});
require(['jquery', 'selleckt.tests.js'], function(){
    'use strict';

    mocha.run();
});
