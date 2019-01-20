# Simple Web API Marketplace

## Intro

This is a simple server side web api that is designed to be a simple online marketplace.

## How to use

Clone the project then while within the repository type `$ npm i` to install the node packages.

Then type `$ node server.js portNumber` to start the server. 

for example if I wanted to run the server on port 2500 I would type `$ node server.js 2500`.

This will run the server on your localhost, so for the GET requests you can test them by going to `localhost:portNumber` in your browser.

Then to make a request add the endpoint url after the local host as follows `localhost:2500/query/all`. Then this will return the array with the results of the request.

| Endpoint | URL | Description |
| --------- | --- | ------- |
| Query a single product | /query/single/:product | returns the title, price and inventory count of the product specified in the url |
| Query all products | /query/all/ | returns the title, price and inventory count of every product |
| Query all products in stock | /query/all/1 or /query/all/true | returns title, price and inventory count of every product in stock |
| Perchase a product | /purchase/:product | Perchases the given product by reducing the inventory count |
