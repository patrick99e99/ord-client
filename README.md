# Ord Client

A simple javascript class that simplifies calling the recursive ordinals
endpoints For more information, check out the ordinals recursive docs at:
https://docs.ordinals.com/inscriptions/recursion.html

## Basic usage:

```
import { OrdClient } from '/content/<inscription-id>';

const client = new OrdClient();

client.getLatestInscriptionIdForSat(someSatNumber).then((inscriptionId) => {
  // ... do something with the inscription id
});
```

Instead of fetch, a custom web api client can be provided, as long as it
conforms to the same json api interface, for example:

```
OrdClient.configure({
  fetch: someOtherHttpClientGetFunction,
  fetchOptions: {
    headers: {
      'Content-type: application/json',
    }
  }
});
```

Additionally, for convenience, you can get your current inscription's id by
calling the `currentInscriptionId` static/instance methods:

```
// as a static class method:
OrdClient.currentInscriptionId() // ==> '38a8d63382d89ac6e52bc1e47b27ceb501bb66637575006762499fee00ad4f31i13'

// as an instance method:
const client = new OrdClient();
client.currentInscriptionId() // ==> '38a8d63382d89ac6e52bc1e47b27ceb501bb66637575006762499fee00ad4f31i13'
```

For more detailed examples of all of the available api endpoints and usage,
check out the spec file: `src/ord-client.spec.js`

