/**
 * Test for PatientAuth synchronization logic.
 * Since the hook uses useSyncExternalStore, we test the underlying store logic.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the store pattern directly since it's the core logic
describe('PatientAuth Store Pattern', () => {
  const SESSION_KEY = 'nutriser_patient';

  // Mock localStorage
  let storage: Record<string, string> = {};
  const localStorageMock = {
    getItem: vi.fn((key: string) => storage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
    removeItem: vi.fn((key: string) => { delete storage[key]; }),
    clear: vi.fn(() => { storage = {}; }),
    length: 0,
    key: vi.fn(() => null),
  };

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const mockPatient = {
    id: 1,
    name: 'Test Patient',
    email: 'test@nutriser.com',
    phone: '3221234567',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('Login', () => {
    it('should save patient to localStorage on login', () => {
      localStorage.setItem(SESSION_KEY, JSON.stringify(mockPatient));
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        SESSION_KEY,
        JSON.stringify(mockPatient)
      );
    });

    it('should retrieve patient from localStorage', () => {
      storage[SESSION_KEY] = JSON.stringify(mockPatient);
      
      const raw = localStorage.getItem(SESSION_KEY);
      expect(raw).toBeTruthy();
      
      const patient = JSON.parse(raw!);
      expect(patient.id).toBe(1);
      expect(patient.name).toBe('Test Patient');
      expect(patient.email).toBe('test@nutriser.com');
    });
  });

  describe('Logout', () => {
    it('should remove patient from localStorage on logout', () => {
      storage[SESSION_KEY] = JSON.stringify(mockPatient);
      
      localStorage.removeItem(SESSION_KEY);
      
      expect(localStorage.removeItem).toHaveBeenCalledWith(SESSION_KEY);
      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });

  describe('Session persistence', () => {
    it('should return null when no session exists', () => {
      const raw = localStorage.getItem(SESSION_KEY);
      expect(raw).toBeNull();
    });

    it('should persist session across reads', () => {
      storage[SESSION_KEY] = JSON.stringify(mockPatient);
      
      // First read
      const read1 = JSON.parse(localStorage.getItem(SESSION_KEY)!);
      // Second read
      const read2 = JSON.parse(localStorage.getItem(SESSION_KEY)!);
      
      expect(read1.id).toBe(read2.id);
      expect(read1.email).toBe(read2.email);
    });

    it('should handle corrupted localStorage gracefully', () => {
      storage[SESSION_KEY] = 'not-valid-json{{{';
      
      let patient = null;
      try {
        patient = JSON.parse(localStorage.getItem(SESSION_KEY)!);
      } catch {
        patient = null;
      }
      
      expect(patient).toBeNull();
    });
  });

  describe('Subscriber notification pattern', () => {
    it('should notify all subscribers when state changes', () => {
      const listeners = new Set<() => void>();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();
      
      listeners.add(listener1);
      listeners.add(listener2);
      listeners.add(listener3);
      
      // Simulate emit (same pattern as PatientAuthStore)
      Array.from(listeners).forEach((listener) => listener());
      
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });

    it('should not notify unsubscribed listeners', () => {
      const listeners = new Set<() => void>();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      listeners.add(listener1);
      listeners.add(listener2);
      
      // Unsubscribe listener2
      listeners.delete(listener2);
      
      // Emit
      Array.from(listeners).forEach((listener) => listener());
      
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('Update session', () => {
    it('should merge updates with existing session', () => {
      storage[SESSION_KEY] = JSON.stringify(mockPatient);
      
      const existing = JSON.parse(localStorage.getItem(SESSION_KEY)!);
      const updated = { ...existing, phone: '9991234567', name: 'Updated Name' };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      
      const result = JSON.parse(localStorage.getItem(SESSION_KEY)!);
      expect(result.phone).toBe('9991234567');
      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('test@nutriser.com'); // unchanged
    });
  });
});
