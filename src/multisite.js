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
import MultisiteUtils from './multisite-utils.js';
import { getOrCreateLogger } from './log-common.js';

export default function multisite() {
  const handleActivate = async (argv) => {
    const logger = getOrCreateLogger(argv);

    if (await MultisiteUtils.activate(process.cwd(), argv.site || null)) {
      const activeSite = await MultisiteUtils.getActiveSite(process.cwd());
      if (activeSite) {
        logger.log(`Site ${activeSite} has been activated`);
      } else {
        logger.log('Multisite has been deactivated');
      }
    }
  };

  return {
    command: 'multisite <command> [args...]',
    description: 'Multisite commands',
    aliases: [],
    builder: (yargs) => {
      yargs
        .command({
          command: 'activate <site>',
          describe: 'Activate a site',
          builder: (yargsSub) => {
            yargsSub
              .positional('site', {
                describe: 'The site to activate',
                type: 'string',
              })
              .help();
          },
          handler: handleActivate,
        })
        .command({
          command: 'deactivate',
          describe: 'Deactivate multisite',
          handler: handleActivate,
        })
        .help();
    },
  };
}
