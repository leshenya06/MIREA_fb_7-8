const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const HTML_FILE = path.join(__dirname, 'admin_panel.html');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/') {
        fs.readFile(HTML_FILE, (err, data) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Ошибка сервера');
                return;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        });
    } else if (pathname === '/admin_panel_styles.css') {
        const cssFile = path.join(__dirname, 'admin_panel_styles.css');
        fs.readFile(cssFile, (err, data) => {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('CSS файл не найден');
                return;
            }
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.end(data);
        });
    } else if (pathname === '/add' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newProducts = JSON.parse(body);
            newProducts.forEach(product => addProduct(product));
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Товары добавлены'}));
        });
    } else if (pathname === '/edit' && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const {id, ...updatedProduct} = JSON.parse(body);
            editProduct(id, updatedProduct);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Товар обновлен'}));
        });
    } else if (pathname === '/delete' && req.method === 'DELETE') {
        const id = parsedUrl.query.id;
        deleteProduct(parseInt(id));
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({message: 'Товар удален'}));
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
});

function addProduct(newProduct) {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    newProduct.id = products.length + 1;
    products.push(newProduct);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function editProduct(id, updatedProduct) {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
        products[index] = {...products[index], ...updatedProduct};
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    }
}

function deleteProduct(id) {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const filteredProducts = products.filter(product => product.id !== id);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filteredProducts, null, 2));
}

server.listen(PORT, () => {
    console.log(`Сервер панели администратора запущен на http://localhost:${PORT}`);
});