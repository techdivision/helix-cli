/* eslint-disable header/header */
// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

/**
 * Copyright (c) 2024 TechDivision GmbH
 * All rights reserved
 *
 * This product includes proprietary software developed at TechDivision GmbH, Germany
 * For more information see https://www.techdivision.com
 *
 * To obtain a valid license for using this software please contact us at
 * license@techdivision.com
 */
import { getOrCreateLogger } from './log-common.js';

export default function open() {
  let executor;
  return {
    set executor(value) {
      executor = value;
    },
    command: 'open <environment>',
    description: 'Open environment URL',
    builder: (yargs) => {
      yargs
        .option('open', {
          describe: 'Open a browser window',
          type: 'boolean',
          default: true,
        })
        .positional('environment', {
          describe: 'Environment to open (test or live)',
          choices: ['test', 'live'],
          type: 'string',
        })
        .help();
    },
    handler: async (argv) => {
      if (!executor) {
        // eslint-disable-next-line global-require
        const hackCommand = (await import('./open.cmd.js')).default; // lazy load the handler to speed up execution time
        // eslint-disable-next-line new-cap
        executor = new hackCommand(getOrCreateLogger(argv));
        executor.withEnvironment(argv.environment);
        executor.withOpen(argv.open);
      }

      await executor
        .run();
    },
  };
}
