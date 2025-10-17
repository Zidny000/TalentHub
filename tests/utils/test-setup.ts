import request from 'supertest';
import { Server } from 'http';
import { Application } from 'express';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
let server: Server;

export const testSetup = async () => {
  server = app.listen(0); // Use a random port for testing
  return { app: app as Application, server };
};

export const testTeardown = async () => {
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }
};

// Utility functions for authentication and common operations
export const loginUser = async (email: string, password: string) => {
  // First check if we need to register the user
  const checkUser = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });
  
  // If login fails, register the user first
  if (checkUser.status === 401) {
    const name = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
    
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: email,
        password: password,
        name: name,
        role: email.includes('admin') ? 'ADMIN' : 
              email.includes('employer') ? 'EMPLOYER' : 'CANDIDATE'
      });
    
    // Try login again after registration
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });
      
    return loginResponse.body.data?.accessToken;
  }
  
  return checkUser.body.data?.accessToken;
};

// Test user data
export const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'Admin123!'
  },
  employer: {
    email: 'employer@example.com',
    password: 'Employer123!'
  },
  jobseeker: {
    email: 'jobseeker@example.com',
    password: 'Jobseeker123!'
  }
};

// Clean up test data
export const cleanupDatabase = async () => {
  // Delete all test data created in tests
  try {
    // This approach is safer than a cascading delete
    // Delete specific test data based on your needs
    await prisma.job.deleteMany({
      where: {
        title: { contains: 'Test' }
      }
    });

    // More cleanup as needed
  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
};