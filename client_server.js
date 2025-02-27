const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const STYLES_FILE = path.join(__dirname, 'client_styles.css'); // Путь к вашему CSS-файлу

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }

            let products = [];
            if (data) {
                try {
                    products = JSON.parse(data);
                } catch (parseError) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error parsing JSON');
                    return;
                }
            }

            const html = generateHTML(products);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        });
    } else if (req.url === '/client_styles.css') {
        // Обслуживаем CSS-файл
        fs.readFile(STYLES_FILE, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('CSS файл не найден');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

function generateHTML(products) {
    // Создаем объект для хранения товаров по категориям
    const categories = {};

    products.forEach(product => {
        product.categories.forEach(category => {
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(product);
        });
    });

    const categorySections = Object.keys(categories).map(category => {
        const cards = categories[category].map(product => `
            <div class="card">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p>Цена: ${product.price} руб.</p>
            </div>
        `).join('');

        return `
            <h2>${category}</h2>
            <div class="category">
                ${cards}
            </div>
        `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="client_styles.css">
            <title>Каталог товаров</title>
        </head>
        <body>
            <h1>Каталог товаров</h1>
            ${categorySections}
        </body>
        </html>
    `;
}

server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});