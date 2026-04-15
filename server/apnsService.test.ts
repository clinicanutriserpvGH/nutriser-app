import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ENV before importing the module
vi.mock('./_core/env', () => ({
  ENV: {
    apnsKeyId: 'TESTKEY123',
    apnsTeamId: 'TESTTEAM',
    apnsPrivateKey: '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgFakeKeyForTestingOnly\n-----END PRIVATE KEY-----',
    apnsBundleId: 'com.nutriser.app.test',
  },
}));

// Mock db module
vi.mock('./db', () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// Mock drizzle schema
vi.mock('../drizzle/schema', () => ({
  patientAccounts: {},
}));

describe('APNs Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isAPNsConfigured', () => {
    it('should return true when all APNs env vars are set', async () => {
      const { isAPNsConfigured } = await import('./apnsService');
      expect(isAPNsConfigured()).toBe(true);
    });
  });

  describe('sendAPNsPush', () => {
    it('should attempt to send a push notification', async () => {
      // Mock fetch to simulate APNs response
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: () => Promise.resolve('{"reason":"InvalidProviderToken"}'),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { sendAPNsPush } = await import('./apnsService');
      
      // This will fail because the private key is fake, but it tests the flow
      const result = await sendAPNsPush(
        'abc123devicetoken',
        'Test Title',
        'Test Body',
        'https://nutriserpv.com/promo',
        'default',
        true // use sandbox
      );

      // Should return failure because the key is fake
      expect(result.success).toBe(false);
      
      vi.unstubAllGlobals();
    });
  });

  describe('sendAPNsPushToAll', () => {
    it('should return 0 sent when database is not available', async () => {
      const { sendAPNsPushToAll } = await import('./apnsService');
      const result = await sendAPNsPushToAll('Test', 'Body');
      expect(result).toEqual({ sent: 0, failed: 0 });
    });
  });

  describe('saveAPNsToken', () => {
    it('should throw when database is not available', async () => {
      const { saveAPNsToken } = await import('./apnsService');
      await expect(saveAPNsToken('testtoken123')).rejects.toThrow('Database not available');
    });
  });
});
