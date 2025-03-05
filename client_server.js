const http = require('http');
const fs = require('fs');
const path = require('path');
const { graphql, buildSchema } = require('graphql');

const PORT = 3000;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const STYLES_FILE = path.join(__dirname, 'client_styles.css');
const HTML_FILE = path.join(__dirname, 'client.html');

// Загружаем данные о товарах
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

// Создаем GraphQL схему
const schema = buildSchema(`
    type Product {
        id: Int
        name: String
        price: Int
        description: String
        categories: [String]
    }

    type Query {
        products: [Product]
    }
`);

// Резолвер для запроса товаров
const root = {
    products: () => products,
};

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        // Отдаем HTML-файл
        fs.readFile(HTML_FILE, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.url === '/client_styles.css' && req.method === 'GET') {
        // Отдаем CSS-файл
        fs.readFile(STYLES_FILE, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('CSS файл не найден');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
    } else if (req.url === '/graphql' && req.method === 'POST') {
        // Обработка GraphQL запросов
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { query } = JSON.parse(body);
            graphql(schema, query, root)
                .then(response => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                })
                .catch(error => {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Ошибка при выполнении запроса' }));
                });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});