const LATEST_INSCRIPTION_INDEX = -1;
const CONTENT_API_SCOPE = '/content';
const RECURSIVE_OPTIONS = { scope: '/r' };

export class OrdClient {
  static VERSION = '2.0.0';

  static validate(config) {
    if (config.constructor.name !== 'Object') { throw 'config must be an object!'; }

    if (config.fetch) {
      if (!(config.fetch instanceof Function)) { throw 'fetch parameter must be a function!'; }
    }

    if (config.toJSON) {
      if (!(config.toJSON instanceof Function)) { throw 'toJSON parameter must be a function!'; }
    }

    if (config.fetchOptions) {
      if (config.constructor.name !== 'Object') { throw 'fetchOptions must be an object!'; }
    }

    if (config.host) {
      if (typeof config.host !== 'string') { throw 'host parameter must be a string!'; }
    }
  }

  static currentInscriptionId() {
    const location = globalThis.location;
    if (!location) { throw 'location property not found!'; }
    if (!location.pathname) { throw 'pathname property on location not found!'; }
    const fragments = globalThis.location.pathname.split('/');
    return fragments[fragments.length - 1];
  }

  static prefixedPathFor(path, options) {
    const { scope } = (options || {});
    if (path[0] === '/') {
      path = path.slice(1, path.length);
    }
    return `${scope || CONTENT_API_SCOPE}/${path}`;
  }

  constructor(config = {}) {
    this.constructor.validate(config);
    this.fetchMethod = config.fetch || (fetch && globalThis && fetch.bind(globalThis));
    this.toJSON = config.toJSON || ((response) => response.json());
    this.fetchOptions = config.fetchOptions || {};
    this.buildURLFor = config.host && ((path) => new URL(path, config.host));
  }

  async getBlockHash(height = null) {
    let path = '/blockhash';
    if (height !== null) { path += `/${height}`; }
    return this.fetchJsonFor(path, RECURSIVE_OPTIONS);
  }

  async getBlockHeight() {
    return this.fetchJsonFor('/blockheight', RECURSIVE_OPTIONS);
  }

  async getBlockInfo(query) {
    if (!query) {
      throw new Error('query parameter of block height or block hash missing!');
    }
    let path = `/blockinfo/${query}`;
    return this.fetchJsonFor(path, RECURSIVE_OPTIONS);
  }

  async getBlockTime() {
    return this.fetchJsonFor('/blocktime', RECURSIVE_OPTIONS);
  }

  async getChildrenFor(inscriptionId, options) {
    const page = (options || {}).page || 0;
    return this.fetchJsonFor(`/children/${inscriptionId}/${page}`, RECURSIVE_OPTIONS);
  }

  async getChildrenInscriptionsFor(inscriptionId, options) {
    const page = (options || {}).page || 0;
    return this.fetchJsonFor(`/children/${inscriptionId}/inscriptions/${page}`, RECURSIVE_OPTIONS);
  }

  async getInscriptionFor(inscriptionId) {
    const path = `/inscription/${inscriptionId}`;
    const data = await this.fetchJsonFor(path, RECURSIVE_OPTIONS);
    return data;
  }

  async getMetadataFor(inscriptionId) {
    return this.fetchJsonFor(`/metadata/${inscriptionId}`, RECURSIVE_OPTIONS);
  }

  async getParentsFor(inscriptionId, options) {
    const page = (options || {}).page || 0;
    return this.fetchJsonFor(`/parents/${inscriptionId}/${page}`, RECURSIVE_OPTIONS);
  }

  async getSat(sat, options) {
    const page = (options || {}).page || 0;
    const path = `/sat/${sat}/${page}`;
    return this.fetchJsonFor(path, RECURSIVE_OPTIONS);
  }

  async getInscriptionIdForSatAtIndex(sat, index) {
    const path = `/sat/${sat}/at/${index}`;
    const data = await this.fetchJsonFor(path, RECURSIVE_OPTIONS);
    return data.id;
  }

  async getLatestInscriptionIdForSat(sat) {
    return this.getInscriptionIdForSatAtIndex(sat, LATEST_INSCRIPTION_INDEX);
  }

  async getUndelegatedContentFor(inscriptionId) {
    return this.fetchJsonFor(`/undelegated-content/${inscriptionId}`, RECURSIVE_OPTIONS);
  }

  async fetch(path, options) {
    path = this.prefixedPathFor(path, options)
    let fetchable = this.buildURLFor ? this.buildURLFor(path) : path;
    const fetchOptions = { ...this.fetchOptions, ...(options || {}).fetchOptions };
    return this.fetchMethod(fetchable, { ...this.constructor.fetchOptions, ...fetchOptions });
  }

  async fetchJsonFor(path, options) {
    const response = await this.fetch(path, options);
    return await this.toJSON(response);
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
