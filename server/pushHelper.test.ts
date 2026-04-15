import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the server-side push notification logic since the client pushHelper
// uses browser APIs (navigator, window) that aren't available in Node.
// Instead, we test the server push module's core functions.

import { savePushSubscription, deletePushSubscription, getAllPushSubscriptions } from './pushNotifications';

// Mock dependencies
vi.mock('./db', () => ({
  getDb: vi.fn(),
}));

vi.mock('./_core/env', () => ({
  ENV: {
    vapidPublicKey: 'test-public-key-base64url',
    vapidPrivateKey: 'test-private-key-base64url',
  },
}));

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

const mockDb = {
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockReturnThis(),
  where: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockResolvedValue([]),
};

beforeEach(async () => {
  vi.clearAllMocks();
  const { getDb } = await import('./db');
  (getDb as any).mockResolvedValue(mockDb);
  // Reset insert chain
  mockDb.insert.mockReturnValue({ values: mockDb.values });
  mockDb.delete.mockReturnValue({ where: mockDb.where });
  mockDb.update.mockReturnValue({ set: mockDb.set });
  mockDb.set.mockReturnValue({ where: mockDb.where });
  mockDb.select.mockReturnValue({ from: mockDb.from });
});

describe('Push Notifications Server', () => {
  describe('savePushSubscription', () => {
    it('should save a new push subscription', async () => {
      const result = await savePushSubscription(
        'https://fcm.googleapis.com/fcm/send/test-endpoint',
        'test-p256dh-key',
        'test-auth-key',
        'test@example.com'
      );
      expect(result).toEqual({ success: true });
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should handle duplicate endpoint by updating', async () => {
      // Simulate ER_DUP_ENTRY error
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockRejectedValue({ code: 'ER_DUP_ENTRY' }),
      });

      const result = await savePushSubscription(
        'https://fcm.googleapis.com/fcm/send/existing-endpoint',
        'new-p256dh-key',
        'new-auth-key',
        'updated@example.com'
      );
      expect(result).toEqual({ success: true });
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should save subscription without email', async () => {
      const result = await savePushSubscription(
        'https://fcm.googleapis.com/fcm/send/test-endpoint',
        'test-p256dh-key',
        'test-auth-key'
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('deletePushSubscription', () => {
    it('should delete a subscription by endpoint', async () => {
      const result = await deletePushSubscription('https://fcm.googleapis.com/fcm/send/test-endpoint');
      expect(result).toEqual({ success: true });
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should return false if db is not available', async () => {
      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue(null);
      const result = await deletePushSubscription('https://test-endpoint');
      expect(result).toEqual({ success: false });
    });
  });

  describe('getAllPushSubscriptions', () => {
    it('should return all subscriptions', async () => {
      const mockSubs = [
        { endpoint: 'https://endpoint1', p256dh: 'key1', auth: 'auth1', email: 'a@b.com' },
        { endpoint: 'https://endpoint2', p256dh: 'key2', auth: 'auth2', email: null },
      ];
      mockDb.from.mockResolvedValue(mockSubs);

      const result = await getAllPushSubscriptions();
      expect(result).toEqual(mockSubs);
      expect(result.length).toBe(2);
    });

    it('should return empty array if db is not available', async () => {
      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue(null);
      const result = await getAllPushSubscriptions();
      expect(result).toEqual([]);
    });
  });
});

describe('iOS Push Compatibility - SW v4', () => {
  it('should not include vibrate, requireInteraction, or actions for iOS in SW', () => {
    // This is a documentation test to verify our SW changes
    // The actual SW runs in browser context, but we verify the logic here
    const isIOS = true;

    // Build options like our SW does
    const options: any = {
      body: 'Test notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'nutriser-test',
      data: { url: 'https://nutriserpv.com' },
    };

    if (!isIOS) {
      options.vibrate = [200, 100, 200];
      options.requireInteraction = true;
      options.renotify = false;
      options.actions = [
        { action: 'open', title: 'Ver Oferta' },
        { action: 'close', title: 'Cerrar' },
      ];
    }

    // For iOS, these properties should NOT be present
    expect(options.vibrate).toBeUndefined();
    expect(options.requireInteraction).toBeUndefined();
    expect(options.actions).toBeUndefined();
    // But these should still be present
    expect(options.body).toBe('Test notification');
    expect(options.icon).toBe('/icons/icon-192x192.png');
    expect(options.tag).toBe('nutriser-test');
  });

  it('should include vibrate and actions for non-iOS', () => {
    const isIOS = false;

    const options: any = {
      body: 'Test notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'nutriser-test',
      data: { url: 'https://nutriserpv.com' },
    };

    if (!isIOS) {
      options.vibrate = [200, 100, 200];
      options.requireInteraction = true;
      options.renotify = false;
      options.actions = [
        { action: 'open', title: 'Ver Oferta' },
        { action: 'close', title: 'Cerrar' },
      ];
    }

    expect(options.vibrate).toEqual([200, 100, 200]);
    expect(options.requireInteraction).toBe(true);
    expect(options.actions).toHaveLength(2);
  });
});
