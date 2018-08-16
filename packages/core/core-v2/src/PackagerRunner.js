// @flow
'use strict';
const Cache = require('@parcel/cache-v2');
const {mkdirp} = require('@parcel/fs');
const path = require('path');

class PackagerRunner {
  constructor(config, options) {
    this.config = config;
    this.cache = new Cache(config, options);
    this.dirExists = false;
  }

  async loadPackager() {
    return require('@parcel/packager-js');
  }

  async runPackager({ bundle }) {
    let packager = await this.loadPackager();

    let modulesContents = await Promise.all(bundle.assets.map(async asset => {
      // let fileContents = await packager.readFile({
      //   filePath: asset.code,
      // });

      await this.cache.readBlobs(asset);

      let result = await packager.asset(asset);

      return result;
    }));

    let packageFileContents = await packager.package(modulesContents);

    if (!this.dirExists) {
      await mkdirp(path.dirname(bundle.destPath));
      this.dirExists = true;
    }

    await packager.writeFile({
      filePath: bundle.destPath,
      fileContents: packageFileContents,
    });
  }
}

module.exports = PackagerRunner;
