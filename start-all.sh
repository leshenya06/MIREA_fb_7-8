#!/bin/bash

# Запуск клиентского сервера
node client_server.js &
CLIENT_PID=$!

# Запуск административного сервера
node admin_server.js &
ADMIN_PID=$!

# Запуск WebSocket сервера
node websocket_server.js &
WS_PID=$!

wait
