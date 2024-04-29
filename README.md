# Ord Client

A javascript client that allows easy interaction with all of the recursive
endpoints for Bitcoin ordinals indexers/explorers.  For more information, check
out the ordinals recursive documentation at:
https://docs.ordinals.com/inscriptions/recursion.html

Version 1.0.0 has been inscribed on the Bitcoin network and is publicly
available for use.  Its inscription id is:
`53c1e855c3d3f6cd7e1ac0b20c9ac369e7b55f64cc83f1f26f9aeb43b40902cei0`

## Basic usage:

```javascript
import { OrdClient } from '/content/53c1e855c3d3f6cd7e1ac0b20c9ac369e7b55f64cc83f1f26f9aeb43b40902cei0';

const client = new OrdClient();

client.getBlockHash(826268).then((blockHash) => {
  // blockHash: 0000000000000000000007ef57083903d7a153af726a5a5270b1c9c3d756c48d
});

client.getLatestInscriptionIdForSat(272153335880924).then((inscriptionId) => {
  // inscriptionId: 38a8d63382d89ac6e52bc1e47b27ceb501bb66637575006762499fee00ad4f31i13
});

// or ... get some JSON
const json = await client.fetchJsonFor('1602af2b9e6a05404a7afc910392dd0b3ed83813d3e0e3ff23c3b22e020e39aai0');

// or ... draw an svg image
const response = await client.fetch('840a103adbc9adb3202d53477fcb0039d5e1935f6f20b91d3e7bbe7fa3a1e1a1i31');
const svg = response.text();
const img = new Image();
document.querySelector('img').setAttribute('src', `data:image/svg+xml;base64,${btoa(svg)}`);

```

You can customize Ord Client's HTTP behavior by calling the `configure` class
method with options such as:

```javascript
OrdClient.configure({
  fetch: FancyCustomHTTPGetFunction,
  fetchOptions: {
    headers: {
      'Content-type: application/json',
    }
  },
  toJSON: (response) => FancyCustomJSONFunction(response),
});
```

Additionally for convenience, you can get your current inscription's id by
calling the `currentInscriptionId` static or instance methods:

```javascript
// as a static class method:
OrdClient.currentInscriptionId() // ==> '38a8d63382d89ac6e52bc1e47b27ceb501bb66637575006762499fee00ad4f31i13'

// as an instance method:
const client = new OrdClient();
client.currentInscriptionId() // ==> '38a8d63382d89ac6e52bc1e47b27ceb501bb66637575006762499fee00ad4f31i13'
```

For more detailed examples of all of the available api endpoints and usage,
Please check out the [spec](https://github.com/patrick99e99/ord-client/blob/master/src/ord-client.spec.js) file.

