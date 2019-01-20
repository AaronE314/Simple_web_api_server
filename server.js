
// Imports
const express = require('express');
const fs = require('fs');
const util = require('util');
const app = express();

// Port for server

const PORT = process.argv[2] ? process.argv[2] : 2500;

// Error codes
const ERROR_CODES = Object.freeze({
    internalError: 500
});

// Inventory JSON -> Loaded on startup
let inventory = null;

let carts = [];
let cartId = 0;

// Loads the inventory from storage (JSON)
function loadInentory() {
    let invFile = fs.readFileSync('inventory.json', 'utf8');

    return JSON.parse(invFile);
}

// Saves updates to the inventory to storage (JSON)
function saveInventory() {
    fs.writeFileSync('inventory.json', JSON.stringify(inventory));
}

//=================================================================
//API Endpoint
//=================================================================

/**
 * Query a single product by title.
 * 
 * @param product the title (name) of the product that is being requested.
 * 
 * @returns the JSON object of the product which contains the title, price, and inventory Count.
 */
app.use("/query/single/:product", (req, res) => {
    try {

        // Finds the product in the inventroy.s
        let product = inventory.products.filter(prod => { return prod.title === req.params.product });

        res.json(product);

    } catch (error) {
        res.status(ERROR_CODES.internalError).send({ message: error.message });
    }
});

/**
 * Query a single product by title. will return every product in the inventory or (if optional parameter is spesified)
 * will only return inventroy that is in stock.
 * 
 * @param inventory (Optional) if undefined or falsy (0 or false for example) will return every product Otherwise will
 *                  return only inventory that is in stock
 * 
 * @returns the JSON objects of all products or only the ones in stock. 
 */
app.use("/query/all/:inventory?", (req, res) => {
    try {
        let products;

        // Checks for the parameter
        if (!req.params.inventory || req.params.inventory == false || req.params.inventory === "false") {
            
            // if parameter is undefined or falsy, sets the return products to every product
            products = inventory.products;

        } else {

            // otherwise filters out the items that have no inventory.
            products = inventory.products.filter(prod => { return prod.inventory_count > 0 })

        }

        res.json(products);

    } catch (error) {
        res.status(ERROR_CODES.internalError).send({ message: error.message });
    }
});

/**
 * Purchases a product, which decreases the inventroy of the product.
 * 
 * @param product the product title (name) that has been perchased.
 */
app.use("/purchase/:product", (req, res) => {
    try {

        // Finds the product by name.
        let product = inventory.products.filter(prod => { return prod.title === req.params.product });

        // checks to see if there is inventory left
        if (product.inventory_count <= 0) {
            throw new Error("No product left");
        } else {
            // if there is inventory left decrease the count, then save the changes made.
            product[0].inventory_count--;
            saveInventory();
        }

        res.send("OK");

    } catch (error) {
        res.status(ERROR_CODES.internalError).send({ message: error.message });
    }
});

app.use("/cart/create", (req, res) => {
    try {

        // Creates a cart object
        let cart = {
            cartId: cartId,
            totalCost: 0.00,
            items: []
        }

        // Increments global cart counter
        cartId++;

        // Adds new cart to master cart list.
        carts.push(cart);

        // Sends the cart Id back to the user.
        res.send({cartId: cart.cartId});

    } catch (error) {
        res.status(ERROR_CODES.internalError).send({ message: error.message });
    }
});

app.use("/cart/add/:product/:id", (req, res) => {
    try {

        // Finds the product by name.
        let product = inventory.products.filter(prod => { return prod.title === req.params.product });
        if (product.length) {
            product = product[0];
        } else {
            throw new Error("Unknown Product");
        }
        let id = parseInt(req.params.id);

        // check for valud carts
        let cart = carts.filter(cart => { return cart.cartId === id });

        // checks to see if there is inventory left
        if (product.inventory_count <= 0) {
            throw new Error("No product left");
        } else if (id === NaN) {
            throw new Error("Id is not a number");
        } else if (cart.length === 0) {
            throw new Error("Cart doesn't exist");
        } else {

            cart = cart[0];

            // adds the item to the cart with given id
            cart.items.push(product);

            // updates the total cost for the cart
            cart.totalCost += product.price;
        }

        // prints the carts for server tracking.
        console.log(util.inspect(carts, false, null, true));

        res.send(cart);

    } catch (error) {
        res.status(ERROR_CODES.internalError).send({ message: error.message });
    }
});

app.use("/cart/close/:id", (req, res) => {
    try {

        let id = parseInt(req.params.id);

        let cart = carts.filter(cart => { return cart.cartId === id });

        if (id === NaN) {
            throw new Error("Id is not a number");
        } else if (cart.length === 0) {
            throw new Error("Cart doesn't exist");
        } else {

            cart = cart[0];
            
            for (let i = 0; i < cart.items.length; i++) {
                // Finds item in inventory
                let product = inventory.products.filter(prod => { return prod.title === cart.items[i].title });
                // Updates count
                product[0].inventory_count--;
            }
            
            // removes from carts
            let i = carts.indexOf(cart);
            carts.splice(i, 1);

            // Updates inventory file
            saveInventory();

            // prints the carts for server tracking.
            console.log(util.inspect(carts, false, null, true));
            
        }

        // returns the cart
        res.json(cart);

    } catch (error) {
        res.status(ERROR_CODES.internalError).send({ message: error.message });
    }
});

// Starts the app to listen on the given port
app.listen(PORT, () => {
    //loads the inventory.
    inventory = loadInentory();
    console.log(`Listening on port ${PORT}`);
});