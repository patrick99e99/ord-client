const LATEST_INSCRIPTION_INDEX = -1;

export class OrdClient {
  static fetch        = fetch && globalThis && fetch.bind(globalThis);
  static fetchOptions = {};
  static toJSON       = (response) => response.json();
  static VERSION      = '1.0.0';

  static configure(config) {
    if (!config) { throw 'no config provided!'; }

    if (config.fetch) {
      if (!(config.fetch instanceof Function)) { throw 'fetch parameter must be a function!'; }
      this.fetch = config.fetch;
    }

    if (config.toJSON) {
      if (!(config.toJSON instanceof Function)) { throw 'toJSON parameter must be a function!'; }
      this.toJSON = config.toJSON;
    }

    if (config.fetchOptions) { this.fetchOptions = config.fetchOptions; }
  }

  static currentInscriptionId() {
    const location = globalThis.location;
    if (!location) { throw 'location property not found!'; }
    if (!location.pathname) { throw 'pathname property on location not found!'; }
    const fragments = globalThis.location.pathname.split('/');
    return fragments[fragments.length - 1];
  }

  static prefixedPathFor(path, options) {
    options = options || { content: true };
    if (options.content) {
      if (path[0] === '/') {
        path = path.slice(1, path.length);
      }
      path = `/content/${path}`;
    }
    return path;
  }

  async fetchJsonFor(path, options) {
    const response = await this.constructor.fetch(this.constructor.prefixedPathFor(path, options), this.constructor.fetchOptions);
    return await this.constructor.toJSON(response);
  }

  async getSat(sat, options) {
    const page = (options || {}).page || 0;
    const path = `/r/sat/${sat}/${page}`;
    return await this.fetchJsonFor(path, { content: false });
  }

  async getInscriptionIdForSatAtIndex(sat, index) {
    const path = `/r/sat/${sat}/at/${index}`;
    const data = await this.fetchJsonFor(path, { content: false });
    return data.id;
  }

  async getBlockHash(height = null) {
    let path = '/r/blockhash';
    if (height !== null) { path += `/${height}`; }
    return await this.fetchJsonFor(path, { content: false });
  }

  async getBlockHeight() {
    return await this.fetchJsonFor('/r/blockheight', { content: false });
  }

  async getBlockInfo(query) {
    if (!query) {
      throw new Error('query parameter of block height or block hash missing!');
    }
    let path = `/r/blockinfo/${query}`;
    return await this.fetchJsonFor(path, { content: false });
  }

  async getBlockTime() {
    return await this.fetchJsonFor('/r/blocktime', { content: false });
  }

  async getChildrenForInscriptionId(inscriptionId, options) {
    const page = (options || {}).page || 0;
    return await this.fetchJsonFor(`/r/children/${inscriptionId}/${page}`, { content: false });
  }

  async getInfoForInscriptionId(inscriptionId) {
    const path = `/r/inscription/${inscriptionId}`;
    const data = await this.fetchJsonFor(path, { content: false });
    return data;
  }

  async getMetadataForInscriptionId(inscriptionId) {
    return await this.fetchJsonFor(`/r/metadata/${inscriptionId}`, { content: false });
  }

  async getLatestInscriptionIdForSat(sat) {
    return this.getInscriptionIdForSatAtIndex(sat, LATEST_INSCRIPTION_INDEX);
  }

  fetch(path, options) {
    path = this.constructor.prefixedPathFor(path, options)
    const fetchOptions = (options || {}).fetchOptions || {};
    return this.constructor.fetch(path, { ...this.constructor.fetchOptions, ...fetchOptions });
  }

  prefixedPathFor(path, options) {
    return this.constructor.prefixedPathFor(path, options);
  }

  currentInscriptionId() {
    return this.constructor.currentInscriptionId();
  }

  get version() {
    return this.constructor.VERSION;
  }
}
