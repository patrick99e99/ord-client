import { OrdClient } from './ord-client.js';

describe('OrdClient', () => {
  let client;
  let fakeFetch;
  let fetchOptions;
  beforeEach(async () => {
    fetchOptions = { some: 'option' };
    fakeFetch = jasmine.createSpy('Fetch').and.returnValue({
      json: () => Promise.resolve('some-json-response'),
    });
    OrdClient.configure({
      fetch: fakeFetch,
      fetchOptions: fetchOptions,
    });
    client = new OrdClient();
  });

  describe('fetchJsonFor', () => {
    specify(async () => {
      await client.fetchJsonFor('abc123i0');
      expect(fakeFetch).toHaveBeenCalledWith('/content/abc123i0', fetchOptions);
    });

    describe('configuring the OrdClient with a custom JSON transformer', () => {
      let jsonMock;
      let jsonText;
      beforeEach(() => {
        jsonText = JSON.stringify({ 'some': 'json', 'from': 'a', 'custom': 'formatter' });
        jsonMock = jasmine.createSpy('to-json');
        jsonMock.and.callFake(() => Promise.resolve(jsonText));
      });

      specify(async () => {
        expect(() => OrdClient.configure({ toJSON: jsonMock })).not.toThrow();
        client = new OrdClient();
        expect(await client.fetchJsonFor('abc123i0')).toEqual(jsonText);
      });

      describe('when the parameter is invalid', () => {
        specify(() => {
          expect(() => OrdClient.configure({ toJSON: 'invalid' })).toThrow('toJSON parameter must be a function!');
        });
      });
    });
  });

  describe('getBlockHash', () => {
    specify(async () => {
      await client.getBlockHash();
      expect(fakeFetch).toHaveBeenCalledWith('/r/blockhash', fetchOptions);
    });

    describe('given a height', () => {
      specify(async () => {
        await client.getBlockHash(123);
        expect(fakeFetch).toHaveBeenCalledWith('/r/blockhash/123', fetchOptions);
      });
    });
  });

  describe('getBlockHeight', () => {
    specify(async () => {
      await client.getBlockHeight();
      expect(fakeFetch).toHaveBeenCalledWith('/r/blockheight', fetchOptions);
    });
  });

  describe('getBlockInfo', () => {
    specify(async () => {
      await client.getBlockInfo('abc123i0');
      expect(fakeFetch).toHaveBeenCalledWith('/r/blockinfo/abc123i0', fetchOptions);
    });

    describe('a missing parameter', () => {
      specify(async () => {
        await expectAsync(client.getBlockInfo()).toBeRejectedWith(new Error('query parameter of block height or block hash missing!'));
      });
    });
  });

  describe('getBlockTime', () => {
    specify(async () => {
      await client.getBlockTime();
      expect(fakeFetch).toHaveBeenCalledWith('/r/blocktime', fetchOptions);
    });
  });

  describe('getChildrenForInscriptionId', () => {
    it('defaults to page 0', async () => {
      await client.getChildrenForInscriptionId('abci0');
      expect(fakeFetch).toHaveBeenCalledWith('/r/children/abci0/0', fetchOptions);
    }),

    describe('given a page', () => {
      specify(async () => {
        await client.getChildrenForInscriptionId('abci0', { page: 1 });
        expect(fakeFetch).toHaveBeenCalledWith('/r/children/abci0/1', fetchOptions);
      });
    });
  });

  describe('getInfoForInscriptionId', () => {
    specify(async () => {
      await client.getInfoForInscriptionId('abci0');
      expect(fakeFetch).toHaveBeenCalledWith('/r/inscription/abci0', fetchOptions);
    });
  });

  describe('getMetadataForInscriptionId', () => {
    specify(async () => {
      await client.getMetadataForInscriptionId('abci0');
      expect(fakeFetch).toHaveBeenCalledWith('/r/metadata/abci0', fetchOptions);
    });
  });

  describe('getSat', () => {
    it('defaults to page 0', async () => {
      await client.getSat(123);
      expect(fakeFetch).toHaveBeenCalledWith('/r/sat/123/0', fetchOptions);
    }),

    describe('given a page', () => {
      specify(async () => {
        await client.getSat(123, { page: 1 });
        expect(fakeFetch).toHaveBeenCalledWith('/r/sat/123/1', fetchOptions);
      });
    });
  });

  describe('getInscriptionIdForSatAtIndex', () => {
    specify(async () => {
      await client.getInscriptionIdForSatAtIndex(123, 456);
      expect(fakeFetch).toHaveBeenCalledWith('/r/sat/123/at/456', fetchOptions);
    });
  });

  describe('getLatestInscriptionIdForSat', () => {
    specify(async () => {
      await client.getLatestInscriptionIdForSat(123);
      expect(fakeFetch).toHaveBeenCalledWith('/r/sat/123/at/-1', fetchOptions);
    });
  });

  describe('fetch', () => {
    describe('delegating to the provided or default fetch method', () => {
      it('considers it content by default', async () => {
        await client.fetch('/somewhere/magical');
        expect(fakeFetch).toHaveBeenCalledWith('/content/somewhere/magical', fetchOptions);
      });

      describe('when content is set to false', () => {
        specify(async () => {
          await client.fetch('/somewhere/magical', { content: false });
          expect(fakeFetch).toHaveBeenCalledWith('/somewhere/magical', fetchOptions);
        });
      });

      describe('configuring the OrdClient class', () => {
        describe('a custom fetch method', () => {
          let httpGetMock;
          let fakeResponse;
          beforeEach(() => {
            fakeResponse = {};
            httpGetMock = jasmine.createSpy('get-HTTP');
            httpGetMock.and.callFake(() => fakeResponse);
          });

          describe('fetch', () => {
            specify(async() => {
              expect(() => OrdClient.configure({ fetch: httpGetMock })).not.toThrow();
              await client.fetch('/somewhere/magical', { content: false });
              expect(httpGetMock).toHaveBeenCalledWith('/somewhere/magical', fetchOptions);
            });

            describe('when the parameter is invalid', () => {
              specify(() => {
                expect(() => OrdClient.configure({ fetch: 'invalid' })).toThrow('fetch parameter must be a function!');
              });
            });
          });
        });

        describe('custom fetch options', () => {
          specify(async () => {
            await client.fetch('/content/somewhere/magical', {
              fetchOptions: {
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            });
            expect(fakeFetch).toHaveBeenCalledWith('/content/somewhere/magical', {
              some: 'option',
              headers: {
                'Content-Type': 'application/json',
              }
            });
          });
        });
      });
    });
  });

  describe('prefixedPathFor', () => {
    it('prefixes paths with /content', () => {
      expect(client.prefixedPathFor('/somewhere')).toEqual('/content/somewhere');
    });

    describe('when content is set to false', () => {
      it('does nothing', () => {
        expect(client.prefixedPathFor('/somewhere', { content: false })).toEqual('/somewhere');
      });
    });
  });

  describe('currentInscriptionId', () => {
    beforeEach(() => {
      globalThis.location = { pathname: '/preview/38a8d63382d89ac6e52bc1e47b27ceb501bb66637575006762499fee00ad4f31i13' };
    });

    it('returns the inscription id from the path of the window object location', () => {
      expect(client.currentInscriptionId()).toEqual('38a8d63382d89ac6e52bc1e47b27ceb501bb66637575006762499fee00ad4f31i13');
    });
  });

  describe('version', () => {
    specify(() => {
      expect(client.version).toEqual('1.0.0');
    });
  });
});
