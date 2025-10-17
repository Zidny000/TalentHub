import { Server as HTTPServer } from 'http';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import express from 'express';
import { describe, beforeAll, afterAll, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import websocketService from '../../src/services/websocket.service';

describe('WebSocket Service', () => {
  let httpServer: HTTPServer;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;
  let serverPort: number;

  beforeAll((done: any) => {
    // Create a basic Express app
    const app = express();
    httpServer = new HTTPServer(app);
    
    // Start the server on a random port
    httpServer.listen(() => {
      const address = httpServer.address() as AddressInfo;
      serverPort = address.port;
      
      // Initialize our websocket service with this server
      websocketService.initialize(httpServer);
      
      done();
    });
  });

  afterAll(() => {
    httpServer.close();
  });

  beforeEach((done: any) => {
    // Create client sockets for testing
    clientSocket1 = ioc(`http://localhost:${serverPort}`, {
      autoConnect: false,
      transports: ['websocket']
    });
    
    clientSocket2 = ioc(`http://localhost:${serverPort}`, {
      autoConnect: false,
      transports: ['websocket']
    });
    
    clientSocket1.connect();
    clientSocket2.connect();
    
    // Wait for both clients to connect
    let connectedCount = 0;
    
    const onConnect = () => {
      connectedCount++;
      if (connectedCount === 2) done();
    };
    
    clientSocket1.on('connect', onConnect);
    clientSocket2.on('connect', onConnect);
  });

  afterEach(() => {
    clientSocket1.disconnect();
    clientSocket2.disconnect();
  });

  it('should authenticate users', (done: any) => {
    // Listen for authentication response
    clientSocket1.on('authenticated', (response) => {
      expect(response.success).toBe(true);
      done();
    });
    
    // Authenticate a user
    clientSocket1.emit('authenticate', {
      userId: 'user1',
      token: 'fake-token'
    });
  });

  it('should handle private messages between users', (done: any) => {
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
      if (authenticatedCount === 2) startTest();
    });
    
    clientSocket2.on('authenticated', () => {
      authenticatedCount++;
      if (authenticatedCount === 2) startTest();
    });
    
    // Start the actual test
    function startTest() {
      // Set up the receiver to listen for messages
      clientSocket2.on('new_message', (message) => {
        expect(message.senderId).toBe('sender');
        expect(message.content).toBe('Hello, receiver!');
        done();
      });
      
      // Send a message from socket1 to socket2
      clientSocket1.emit('private_message', {
        receiverId: 'receiver',
        content: 'Hello, receiver!'
      });
    }
  });

  it('should emit typing indicators', (done: any) => {
    // First authenticate both users
    clientSocket1.emit('authenticate', { userId: 'typer', token: 'fake-token' });
    clientSocket2.emit('authenticate', { userId: 'watcher', token: 'fake-token' });
    
    // Wait for authentication
    let authenticatedCount = 0;
    
    const onAuthenticated = () => {
      authenticatedCount++;
      if (authenticatedCount === 2) startTest();
    };
    
    clientSocket1.on('authenticated', onAuthenticated);
    clientSocket2.on('authenticated', onAuthenticated);
    
    // Start the actual test
    function startTest() {
      // Set up the watcher to detect typing
      clientSocket2.on('user_typing', (data) => {
        expect(data.userId).toBe('typer');
        expect(data.isTyping).toBe(true);
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