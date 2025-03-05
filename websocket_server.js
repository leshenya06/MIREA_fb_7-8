const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const MESSAGES_FILE = path.join(__dirname, 'messages.json');
const wss = new WebSocket.Server({ port: 8081 });

// Загружаем сообщения из файла (если файл существует)
let messages = [];
if (fs.existsSync(MESSAGES_FILE)) {
    messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
}

wss.on('connection', (ws) => {
    // Отправляем историю сообщений новому клиенту
    ws.send(JSON.stringify({ type: 'history', messages }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const newMessage = {
            text: data.text,
            sender: data.sender, // "client" или "admin"
            timestamp: new Date().toISOString()
        };

        // Добавляем новое сообщение в историю
        messages.push(newMessage);

        // Сохраняем сообщения в файл
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

        // Рассылаем новое сообщение всем подключенным клиентам
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'message', message: newMessage }));
            }
        });
    });
});

console.log('WebSocket сервер запущен на ws://localhost:8081');