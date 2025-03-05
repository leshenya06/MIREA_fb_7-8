#!/bin/bash

# Запуск клиентского сервера (GraphQL)
node client_server.js &
CLIENT_PID=$!

# Запуск административного сервера (REST API)
node admin_server.js &
ADMIN_PID=$!

# Запуск WebSocket сервера
node websocket_server.js &
WS_PID=$!

# Вывод PID запущенных процессов
#echo "Клиентский сервер запущен с PID: $CLIENT_PID"
#echo "Административный сервер запущен с PID: $ADMIN_PID"
#echo "WebSocket сервер запущен с PID: $WS_PID"

wait