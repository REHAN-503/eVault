'use strict';

const { AsyncLocalStorage } = require('async_hooks');

const loggerStore = new AsyncLocalStorage();

module.exports = loggerStore;
