"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_client_1 = require("socket.io-client");
const express_1 = __importDefault(require("express"));
const globals_1 = require("@jest/globals");
const websocket_service_1 = __importDefault(require("../../src/services/websocket.service"));
(0, globals_1.describe)('WebSocket Service', () => {
    let httpServer;
    let clientSocket1;
    let clientSocket2;
    let serverPort;
    (0, globals_1.beforeAll)((done) => {
        // Create a basic Express app
        const app = (0, express_1.default)();
        httpServer = new http_1.Server(app);
        // Start the server on a random port
        httpServer.listen(() => {
            const address = httpServer.address();
            serverPort = address.port;
            // Initialize our websocket service with this server
            websocket_service_1.default.initialize(httpServer);
            done();
        });
    });
    (0, globals_1.afterAll)(() => {
        httpServer.close();
    });
    (0, globals_1.beforeEach)((done) => {
        // Create client sockets for testing
        clientSocket1 = (0, socket_io_client_1.io)(`http://localhost:${serverPort}`, {
            autoConnect: false,
            transports: ['websocket']
        });
        clientSocket2 = (0, socket_io_client_1.io)(`http://localhost:${serverPort}`, {
            autoConnect: false,
            transports: ['websocket']
        });
        clientSocket1.connect();
        clientSocket2.connect();
        // Wait for both clients to connect
        let connectedCount = 0;
        const onConnect = () => {
            connectedCount++;
            if (connectedCount === 2)
                done();
        };
        clientSocket1.on('connect', onConnect);
        clientSocket2.on('connect', onConnect);
    });
    (0, globals_1.afterEach)(() => {
        clientSocket1.disconnect();
        clientSocket2.disconnect();
    });
    (0, globals_1.it)('should authenticate users', (done) => {
        // Listen for authentication response
        clientSocket1.on('authenticated', (response) => {
            (0, globals_1.expect)(response.success).toBe(true);
            done();
        });
        // Authenticate a user
        clientSocket1.emit('authenticate', {
            userId: 'user1',
            token: 'fake-token'
        });
    });
    (0, globals_1.it)('should handle private messages between users', (done) => {
        // First authenticate both users
        clientSocket1.emit('authenticate', {
            userId: 'sender',
            token: 'fake-token'
        });
        clientSocket2.emit('authenticate', {
            userId: 'receiver',
            token: 'fake-token'
        });
        // Wait for both to authenticate
        let authenticatedCount = 0;
        clientSocket1.on('authenticated', () => {
            authenticatedCount++;
            if (authenticatedCount === 2)
                startTest();
        });
        clientSocket2.on('authenticated', () => {
            authenticatedCount++;
            if (authenticatedCount === 2)
                startTest();
        });
        // Start the actual test
        function startTest() {
            // Set up the receiver to listen for messages
            clientSocket2.on('new_message', (message) => {
                (0, globals_1.expect)(message.senderId).toBe('sender');
                (0, globals_1.expect)(message.content).toBe('Hello, receiver!');
                done();
            });
            // Send a message from socket1 to socket2
            clientSocket1.emit('private_message', {
                receiverId: 'receiver',
                content: 'Hello, receiver!'
            });
        }
    });
    (0, globals_1.it)('should emit typing indicators', (done) => {
        // First authenticate both users
        clientSocket1.emit('authenticate', { userId: 'typer', token: 'fake-token' });
        clientSocket2.emit('authenticate', { userId: 'watcher', token: 'fake-token' });
        // Wait for authentication
        let authenticatedCount = 0;
        const onAuthenticated = () => {
            authenticatedCount++;
            if (authenticatedCount === 2)
                startTest();
        };
        clientSocket1.on('authenticated', onAuthenticated);
        clientSocket2.on('authenticated', onAuthenticated);
        // Start the actual test
        function startTest() {
            // Set up the watcher to detect typing
            clientSocket2.on('user_typing', (data) => {
                (0, globals_1.expect)(data.userId).toBe('typer');
                (0, globals_1.expect)(data.isTyping).toBe(true);
                done();
            });
            // Emit typing event
            clientSocket1.emit('typing', {
                receiverId: 'watcher',
                isTyping: true
            });
        }
    });
});
