/* eslint-disable header/header */
// noinspection JSUnresolvedReference

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
import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';
import { GitUrl } from '@adobe/helix-shared-git';
import GitUtils from './git-utils.js';

export default class MultisiteUtils {
  /**
   * Active site cache
   *
   * @type {String|null}
   */
  static #activeSite = null;

  /**
   * Multi site config cache
   *
   * @type {*|null}
   */
  static #multiSiteConfig = null;

  /**
   * Get multisite folder
   *
   * @returns {string}
   */
  static get multisiteFolder() {
    return '.multisite';
  }

  /**
   * Get active site code
   *
   * @param {String} dir Directory
   * @returns {Promise<string|null>}
   */
  static async getActiveSite(dir) {
    if (this.#activeSite) {
      return this.#activeSite;
    }
    const activeSiteFilePath = path.join(dir, MultisiteUtils.multisiteFolder, '.active');
    if (!(await fs.pathExists(activeSiteFilePath))) {
      return null;
    }
    this.#activeSite = (await fs.readFile(activeSiteFilePath, 'utf8'))?.trim() || null;
    return this.#activeSite;
  }

  /**
   * Read multisite config
   *
   * @param {String} dir
   * @returns {Promise<*|null>}
   */
  static async readMultisiteConfig(dir) {
    if (this.#multiSiteConfig) {
      return this.#multiSiteConfig;
    }
    const configFilePath = path.join(dir, MultisiteUtils.multisiteFolder, 'config.yaml');
    if (!(await fs.pathExists(configFilePath))) {
      return null;
    }
    const configFileContent = (await fs.readFile(configFilePath, 'utf8'));
    this.#multiSiteConfig = yaml.parse(configFileContent);
    return this.#multiSiteConfig;
  }

  /**
   * Get active site config
   *
   * @param {String} dir Directory
   * @returns {Promise<*|null>}
   */
  static async getActiveSiteConfig(dir) {
    const activeSite = await MultisiteUtils.getActiveSite(dir);
    if (!activeSite) {
      return null;
    }

    // read config
    const config = await MultisiteUtils.readMultisiteConfig(dir);
    if (!config) {
      return null;
    }
    return config.sites[activeSite] || null;
  }

  /**
   * Deactivate child site
   *
   * @param {String} dir Directory
   * @returns {Promise<boolean>}
   */
  static async deactivate(dir) {
    return MultisiteUtils.activate(dir, null);
  }

  /**
   * Activate a child site
   *
   * @param {String} dir Directory
   * @param {String|null} site Site code
   * @returns {Promise<boolean>}
   */
  static async activate(dir, site) {
    // read config
    const config = await MultisiteUtils.readMultisiteConfig(dir);
    if (!config) {
      throw new Error('Config could not be loaded');
    }

    // get .active file
    const activeSiteFilePath = path.join(dir, MultisiteUtils.multisiteFolder, '.active');

    // check if default site was requested
    if (!site || (['default', 'master', 'main', 'none'].includes(site) && !config.sites[site])) {
      fs.remove(activeSiteFilePath);
      this.#activeSite = null;
      return true;
    }

    // check if site exists
    if (!config.sites[site]) {
      throw new Error(`Site ${site} does not exist in multisite config`);
    }

    // set active site
    await fs.writeFile(activeSiteFilePath, site, 'utf-8');
    this.#activeSite = site;
    return true;
  }

  /**
   * Get git URL for active site
   *
   * @param {String} dir Directory
   * @returns {Promise<GitUrl|*>}
   */
  static async getActiveSiteGitUrl(dir) {
    const ref = await GitUtils.getBranch(dir);
    // noinspection JSCheckFunctionSignatures
    const gitUrl = await GitUtils.getOriginURL(dir, { ref });
    const siteConfig = await MultisiteUtils.getActiveSiteConfig(dir);
    if (!siteConfig) {
      return gitUrl;
    }
    // noinspection JSCheckFunctionSignatures
    return new GitUrl(siteConfig.origin, { ref: gitUrl.ref });
  }

  /**
   * Get site name by given port
   *
   * @param {String} dir Directory
   * @param {int} port Port
   * @returns {Promise<null|string>}
   */
  static async getSiteByPort(dir, port) {
    const config = await this.readMultisiteConfig(dir);
    if (!config) {
      return null;
    }

    for (const [site, siteConfig] of Object.entries(config.sites)) {
      if (siteConfig.port === port) {
        return site;
      }
    }
    return null;
  }

  /**
   * Get active site's port if configured
   *
   * @param {String} dir Directory
   * @returns {Promise<null|int>}
   */
  static async getActiveSitePort(dir) {
    return (await this.getActiveSiteConfig(dir))?.port;
  }

  /**
   * Get multisite file path
   *
   * @param {String} dir Directory
   * @param {String} filePath File path
   * @returns {Promise<string>}
   */
  static async getMultiSiteFilePath(dir, filePath) {
    const site = await this.getActiveSite(dir);
    if (!site) {
      return path.join(dir, filePath);
    }

    // check if file exists within active site's folder, if yes serve it
    const multisitePath = path.join(dir, MultisiteUtils.multisiteFolder, site, filePath);
    const multisiteFileExists = await fs.pathExists(multisitePath);
    if (multisiteFileExists) {
      return multisitePath;
    }
    // serve main content as fallback
    return path.join(dir, filePath);
  }
}
