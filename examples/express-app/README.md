## Using express-app example

1. Load data using `load_test_data.sh` from repository root directory
2. Execute `npm install` within this `express-app` directory to install dependencies
3. Run the app server with command: `node index.js`
4. Open

Browser url:

```
http://localhost:3000/article/http%3A%2F%2Flocalhost%2Fpublications%2Farticles%2FJournal1%2F1940%2FArticle1
```

or with cURL

```
curl -X GET "http://localhost:3000/article/http%3A%2F%2Flocalhost%2Fpublications%2Farticles%2FJournal1%2F1940%2FArticle1"
```

The previous commands will retrieve one individual's properties in JSON-LD. The example contains a route to send SPARQL queries to the database as well, e.g.

```
curl -X GET "http://localhost:3000/query?query=select%20*%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20limit%201"
```
