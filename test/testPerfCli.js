/*
 * Copyright 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env mocha */

'use strict';

const sinon = require('sinon');
const assert = require('assert');
const CLI = require('../src/cli.js');
const PerfCommand = require('../src/perf.cmd');

describe('hlx perf', () => {
  // mocked command instance
  let mockPerf;
  let processenv = {};

  beforeEach(() => {
    // save environment
    processenv = Object.assign({}, process.env);
    // clear environment
    Object.keys(process.env).filter(key => key.match(/^HLX_.*/)).map((key) => {
      delete process.env[key];
      return true;
    });

    mockPerf = sinon.createStubInstance(PerfCommand);
    mockPerf.run.returnsThis();
    mockPerf.withStrainFile.returnsThis();
    mockPerf.withCalibreAuth.returnsThis();
  });


  afterEach(() => {
    // restore environment
    Object.keys(processenv).filter(key => key.match(/^HLX_.*/)).map((key) => {
      process.env[key] = processenv[key];
      return true;
    });
  });

  it('hlx perf required auth', (done) => {
    new CLI()
      .withCommandExecutor('perf', mockPerf)
      .onFail((err) => {
        assert.equal(err, 'Missing required argument: calibre-auth');
        done();
      })
      .run(['perf']);
  });

  it('hlx perf works with minimal arguments', () => {
    new CLI()
      .withCommandExecutor('perf', mockPerf)
      .run(['perf', '--calibre-auth', 'nope-nope-nope']);
    sinon.assert.calledOnce(mockPerf.run);
  })
});
