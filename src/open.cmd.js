/* eslint-disable header/header */
// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference,DuplicatedCode

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
import opn from 'open';
import chalk from 'chalk-template';
import { AbstractCommand } from './abstract.cmd.js';
import MultisiteUtils from './multisite-utils.js';
import { getFetch } from './fetch-utils.js';

export default class OpenCommand extends AbstractCommand {
  constructor(logger) {
    super(logger);
    this._open = true;
    this._environment = '';
  }

  // eslint-disable-next-line class-methods-use-this
  get requireConfigFile() {
    return false;
  }

  withEnvironment(value) {
    this._environment = value;
    return this;
  }

  withOpen(o) {
    this._open = !!o;
    return this;
  }

  async buildUrl(gitUrl) {
    const { ref } = gitUrl;
    const configUrl = `https://admin.hlx.page/sidekick/${gitUrl.owner}/${gitUrl.repo}/main/config.json`;
    const configResp = await getFetch()(configUrl);
    let hostBase = 'hlx';
    if (configResp.ok) {
      const config = await configResp.json();
      const { previewHost } = config;
      if (previewHost && previewHost.endsWith('.aem.page')) {
        hostBase = 'aem';
      }
    }
    const hostTld = this._environment === 'live' ? 'live' : 'page';

    const dnsName = `${ref.replace(/\//g, '-')}--${gitUrl.repo}--${gitUrl.owner}`;
    // check length limit
    if (dnsName.length > 63) {
      this.log.error(chalk`URL {yellow https://${dnsName}.${hostBase}} exceeds the 63 character limit for DNS labels.`);
      this.log.error(chalk`Please use a shorter branch name or a shorter repository name.`);
      await this.stop();
      throw Error('branch name too long');
    }

    // return URL
    return `https://${dnsName}.${hostBase}.${hostTld}`;
  }

  async run() {
    await this.init();
    const gitUrl = await MultisiteUtils.getActiveSiteGitUrl(this.directory);
    const url = await this.buildUrl(gitUrl);
    this.log.info(url);
    if (this._open) {
      await opn(url);
    }
  }
}
