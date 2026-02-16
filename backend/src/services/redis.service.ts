import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connectRedis, getRedisClient, isRedisAvailable } from '../config/redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private get client() {
    return getRedisClient();
  }

  private get isAvailable() {
    return isRedisAvailable() && this.client && this.client.isOpen;
  }

  async onModuleInit() {
    try {
      await connectRedis();
    } catch (error) {
      console.warn('⚠️ Redis initialization failed, continuing without cache');
    }
  }

  async onModuleDestroy() {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
    }
  }

  // User session caching
  async setUserSession(userId: string, sessionData: any, ttl: number = 3600): Promise<void> {
    try {
      if (!this.isAvailable) return;
      const key = `user:session:${userId}`;
      await this.client.setEx(key, ttl, JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Redis setUserSession failed:', error.message);
    }
  }

  async getUserSession(userId: string): Promise<any | null> {
    try {
      if (!this.isAvailable) return null;
      const key = `user:session:${userId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Redis getUserSession failed:', error.message);
      return null;
    }
  }

  async deleteUserSession(userId: string): Promise<void> {
    try {
      if (!this.isAvailable) return;
      const key = `user:session:${userId}`;
      await this.client.del(key);
    } catch (error) {
      console.warn('Redis deleteUserSession failed:', error.message);
    }
  }

  // Resource hierarchy caching
  async setResourceHierarchy(collegeId: string, hierarchy: any, ttl: number = 1800): Promise<void> {
    try {
      if (!this.isAvailable) return;
      const key = `resource:hierarchy:${collegeId}`;
      await this.client.setEx(key, ttl, JSON.stringify(hierarchy));
    } catch (error) {
      console.warn('Redis setResourceHierarchy failed:', error.message);
    }
  }

  async getResourceHierarchy(collegeId: string): Promise<any | null> {
    try {
      if (!this.isAvailable) return null;
      const key = `resource:hierarchy:${collegeId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Redis getResourceHierarchy failed:', error.message);
      return null;
    }
  }

  async invalidateResourceHierarchy(collegeId: string): Promise<void> {
    try {
      if (!this.isAvailable) return;
      const key = `resource:hierarchy:${collegeId}`;
      await this.client.del(key);
    } catch (error) {
      console.warn('Redis invalidateResourceHierarchy failed:', error.message);
    }
  }

  // Post feed caching
  async setPostFeed(feedType: 'national' | 'college', collegeId: string | null, page: number, feed: any, ttl: number = 300): Promise<void> {
    try {
      if (!this.isAvailable) return;
      const key = feedType === 'national' 
        ? `feed:national:${page}` 
        : `feed:college:${collegeId}:${page}`;
      await this.client.setEx(key, ttl, JSON.stringify(feed));
    } catch (error) {
      console.warn('Redis setPostFeed failed:', error.message);
    }
  }

  async getPostFeed(feedType: 'national' | 'college', collegeId: string | null, page: number): Promise<any | null> {
    try {
      if (!this.isAvailable) return null;
      const key = feedType === 'national' 
        ? `feed:national:${page}` 
        : `feed:college:${collegeId}:${page}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Redis getPostFeed failed:', error.message);
      return null;
    }
  }

  async invalidatePostFeeds(feedType?: 'national' | 'college', collegeId?: string): Promise<void> {
    try {
      if (!this.isAvailable) return;
      if (feedType === 'national') {
        const keys = await this.client.keys('feed:national:*');
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } else if (feedType === 'college' && collegeId) {
        const keys = await this.client.keys(`feed:college:${collegeId}:*`);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } else {
        // Invalidate all feeds
        const keys = await this.client.keys('feed:*');
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      }
    } catch (error) {
      console.warn('Redis invalidatePostFeeds failed:', error.message);
    }
  }

  // User unlock records caching
  async setUserUnlockRecords(userId: string, records: any, ttl: number = 1800): Promise<void> {
    try {
      if (!this.isAvailable) return;
      const key = `user:unlocks:${userId}`;
      await this.client.setEx(key, ttl, JSON.stringify(records));
    } catch (error) {
      console.warn('Redis setUserUnlockRecords failed:', error.message);
    }
  }

  async getUserUnlockRecords(userId: string): Promise<any | null> {
    try {
      if (!this.isAvailable) return null;
      const key = `user:unlocks:${userId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Redis getUserUnlockRecords failed:', error.message);
      return null;
    }
  }

  async invalidateUserUnlockRecords(userId: string): Promise<void> {
    try {
      if (!this.isAvailable) return;
      const key = `user:unlocks:${userId}`;
      await this.client.del(key);
    } catch (error) {
      console.warn('Redis invalidateUserUnlockRecords failed:', error.message);
    }
  }

  // User profile caching
  async setUserProfile(userId: string, profile: any, ttl: number = 1800): Promise<void> {
    try {
      if (!this.isAvailable) return;
      const key = `user:profile:${userId}`;
      await this.client.setEx(key, ttl, JSON.stringify(profile));
    } catch (error) {
      console.warn('Redis setUserProfile failed:', error.message);
    }
  }

  async getUserProfile(userId: string): Promise<any | null> {
    try {
      if (!this.isAvailable) return null;
      const key = `user:profile:${userId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Redis getUserProfile failed:', error.message);
      return null;
    }
  }

  async invalidateUserProfile(userId: string): Promise<void> {
    try {
      if (!this.isAvailable) return;
      const key = `user:profile:${userId}`;
      await this.client.del(key);
    } catch (error) {
      console.warn('Redis invalidateUserProfile failed:', error.message);
    }
  }

  // User search results caching
  async setUserSearchResults(query: string, results: any, ttl: number = 600): Promise<void> {
    try {
      if (!this.isAvailable) return;
      const key = `search:users:${Buffer.from(query).toString('base64')}`;
      await this.client.setEx(key, ttl, JSON.stringify(results));
    } catch (error) {
      console.warn('Redis setUserSearchResults failed:', error.message);
    }
  }

  async getUserSearchResults(query: string): Promise<any | null> {
    try {
      if (!this.isAvailable) return null;
      const key = `search:users:${Buffer.from(query).toString('base64')}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Redis getUserSearchResults failed:', error.message);
      return null;
    }
  }

  // Generic cache operations
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (!this.isAvailable) return;
      if (ttl) {
        await this.client.setEx(key, ttl, JSON.stringify(value));
      } else {
        await this.client.set(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn('Redis set failed:', error.message);
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      if (!this.isAvailable) return null;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Redis get failed:', error.message);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.isAvailable) return;
      await this.client.del(key);
    } catch (error) {
      console.warn('Redis del failed:', error.message);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isAvailable) return false;
      return (await this.client.exists(key)) === 1;
    } catch (error) {
      console.warn('Redis exists failed:', error.message);
      return false;
    }
  }

  async flushAll(): Promise<void> {
    try {
      if (!this.isAvailable) return;
      await this.client.flushAll();
    } catch (error) {
      console.warn('Redis flushAll failed:', error.message);
    }
  }
}