import helper = require('../test_helper');

import * as assert from 'power-assert';

import * as plugin from '../../src/plugin';

describe('plugin', () => {
  var instance: plugin.Plugin;

  beforeEach(() => {
    instance = helper.createPlugin();
  });
});
