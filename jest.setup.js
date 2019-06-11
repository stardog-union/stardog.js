// Set a higher timeout than the default, due to some changes coming in
// Stardog 6+, in order to avoid false failures.
jest.setTimeout(30000);


global.fetch = global.fetch || require('node-fetch');
