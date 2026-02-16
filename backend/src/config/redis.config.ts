import { createClient } from 'redis';

let redisClient: any = null;
let redisAvailable = false;
let connectionAttempted = false;

const initializeRedis = async () => {
  // Only attempt connection once
  if (connectionAttempted) {
    return;
  }
  connectionAttempted = true;

  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        connectTimeout: 5000, // 5 second timeout
        reconnectStrategy: false, // Disable automatic reconnection
      },
    });

    redisClient.on('error', (err) => {
      // Suppress error messages after initial connection attempt
      if (!redisAvailable) {
        console.warn('⚠️ Redis unavailable - running without cache');
      }
      redisAvailable = false;
    });
    
    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
      redisAvailable = true;
    });

    redisClient.on('disconnect', () => {
      redisAvailable = false;
    });

    // Try to connect with timeout
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);
    
    redisAvailable = true;
  } catch (error) {
    console.warn('⚠️ Redis unavailable - running without cache');
    redisAvailable = false;
    redisClient = null;
  }
};

export const connectRedis = async () => {
  if (!redisClient && !connectionAttempted) {
    await initializeRedis();
  }
};

export const getRedisClient = () => redisClient;
export const isRedisAvailable = () => redisAvailable;
