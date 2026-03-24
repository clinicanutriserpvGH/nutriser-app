import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all DB functions
vi.mock('./db', () => ({
  subscribeToCoupons: vi.fn(),
  getAllCouponSubscribers: vi.fn(),
  deleteCouponSubscriber: vi.fn(),
  createServicePurchase: vi.fn(),
  getAllServicePurchases: vi.fn(),
  updateServicePurchaseStatus: vi.fn(),
  deleteServicePurchase: vi.fn(),
  // Existing mocks needed by router
  createMembership: vi.fn(),
  getAllMemberships: vi.fn(),
  getMembershipById: vi.fn(),
  updateMembershipStatus: vi.fn(),
  createPaymentProof: vi.fn(),
  getPaymentProofByMembershipId: vi.fn(),
  createAppointment: vi.fn(),
  getAllAppointments: vi.fn(),
  getAdminByEmail: vi.fn(),
  createAdminCredential: vi.fn(),
  deleteMembership: vi.fn(),
  getCouponByCode: vi.fn(),
  getAllCoupons: vi.fn(),
  approveCoupon: vi.fn(),
  rejectCoupon: vi.fn(),
  createMembershipCoupon: vi.fn(),
  getAllPromotions: vi.fn(),
  getPromotionsWithCouponCounts: vi.fn(),
  createPromotion: vi.fn(),
  updatePromotion: vi.fn(),
  deletePromotion: vi.fn(),
  getAllPromotionsForAdmin: vi.fn(),
  deleteAppointment: vi.fn(),
  deleteAllAppointments: vi.fn(),
  cancelAppointment: vi.fn(),
  createGiftPurchase: vi.fn(),
  getAllGiftPurchases: vi.fn(),
  getGiftPurchaseById: vi.fn(),
  updateGiftPurchaseStatus: vi.fn(),
  deleteGiftPurchase: vi.fn(),
  getActiveEbook: vi.fn(),
  getAllEbooks: vi.fn(),
  upsertEbook: vi.fn(),
  createEbookPurchase: vi.fn(),
  getAllEbookPurchases: vi.fn(),
  getEbookPurchaseByToken: vi.fn(),
  updateEbookPurchaseStatus: vi.fn(),
  deleteEbookPurchase: vi.fn(),
  getEbookPurchaseByEmail: vi.fn(),
  getAllEbookDiscountCodes: vi.fn(),
  getEbookDiscountCodeByCode: vi.fn(),
  toggleEbookDiscountCode: vi.fn(),
}));

vi.mock('./_core/email', () => ({
  sendConfirmationEmail: vi.fn(),
  sendAppointmentNotification: vi.fn(),
  sendMembershipNotificationToAdmin: vi.fn(),
  sendAppointmentConfirmationToClient: vi.fn(),
  sendCouponApprovedEmail: vi.fn(),
  sendCouponPurchaseNotificationToAdmin: vi.fn(),
}));

vi.mock('./_core/email_extra', () => ({
  sendNewCouponNotificationToSubscribers: vi.fn(),
  sendServicePurchaseNotificationToAdmin: vi.fn(),
  sendServicePurchaseApprovedEmail: vi.fn(),
}));

vi.mock('./pushNotifications', () => ({
  savePushSubscription: vi.fn(),
  deletePushSubscription: vi.fn(),
  sendPushNotificationToAll: vi.fn(),
  getAllPushSubscriptions: vi.fn(),
}));

vi.mock('./storage', () => ({
  storagePut: vi.fn().mockResolvedValue({ url: 'https://cdn.example.com/proof.jpg', key: 'proof.jpg' }),
}));

vi.mock('./_core/notification', () => ({
  notifyOwner: vi.fn(),
}));

vi.mock('./_core/env', () => ({
  ENV: {
    jwtSecret: 'test-secret',
    gmailUser: 'test@gmail.com',
    vapidPublicKey: 'test-vapid-public',
    vapidPrivateKey: 'test-vapid-private',
  },
}));

import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';
import * as db from './db';
import * as pushNotifications from './pushNotifications';
import * as emailExtra from './_core/email_extra';

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {
      clearCookie: () => {},
    } as TrpcContext['res'],
  };
}

const caller = appRouter.createCaller(createPublicContext());

describe('couponSubscribers router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribe: should create a new subscriber', async () => {
    const mockSubscriber = { id: 1, email: 'test@example.com', whatsapp: '3221234567', isActive: true, createdAt: new Date() };
    vi.mocked(db.subscribeToCoupons).mockResolvedValue(mockSubscriber as any);

    const result = await caller.couponSubscribers.subscribe({
      email: 'test@example.com',
      whatsapp: '3221234567',
    });

    expect(result.success).toBe(true);
    expect(db.subscribeToCoupons).toHaveBeenCalledWith({
      email: 'test@example.com',
      whatsapp: '3221234567',
      isActive: true,
    });
  });

  it('subscribe: should fail with invalid email', async () => {
    await expect(
      caller.couponSubscribers.subscribe({
        email: 'not-an-email',
        whatsapp: '3221234567',
      })
    ).rejects.toThrow();
  });

  it('subscribe: should fail with short whatsapp', async () => {
    await expect(
      caller.couponSubscribers.subscribe({
        email: 'test@example.com',
        whatsapp: '123',
      })
    ).rejects.toThrow();
  });

  it('list: should return all subscribers', async () => {
    const mockSubscribers = [
      { id: 1, email: 'a@example.com', whatsapp: '3221234567', isActive: true, createdAt: new Date() },
      { id: 2, email: 'b@example.com', whatsapp: '3227654321', isActive: true, createdAt: new Date() },
    ];
    vi.mocked(db.getAllCouponSubscribers).mockResolvedValue(mockSubscribers as any);

    const result = await caller.couponSubscribers.list();
    expect(result).toHaveLength(2);
    expect(result[0].email).toBe('a@example.com');
  });

  it('delete: should remove a subscriber by id', async () => {
    vi.mocked(db.deleteCouponSubscriber).mockResolvedValue(undefined as any);

    await caller.couponSubscribers.delete({ id: 1 });
    expect(db.deleteCouponSubscriber).toHaveBeenCalledWith(1);
  });
});

describe('push router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribe: should save a push subscription', async () => {
    vi.mocked(pushNotifications.savePushSubscription).mockResolvedValue(undefined as any);

    const result = await caller.push.subscribe({
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      p256dh: 'test-p256dh-key',
      auth: 'test-auth-key',
    });

    expect(pushNotifications.savePushSubscription).toHaveBeenCalledWith(
      'https://fcm.googleapis.com/fcm/send/test-endpoint',
      'test-p256dh-key',
      'test-auth-key'
    );
  });

  it('unsubscribe: should delete a push subscription', async () => {
    vi.mocked(pushNotifications.deletePushSubscription).mockResolvedValue(undefined as any);

    await caller.push.unsubscribe({ endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint' });
    expect(pushNotifications.deletePushSubscription).toHaveBeenCalledWith(
      'https://fcm.googleapis.com/fcm/send/test-endpoint'
    );
  });

  it('getVapidPublicKey: should return the public key', async () => {
    const result = await caller.push.getVapidPublicKey();
    expect(result.publicKey).toBe('test-vapid-public');
  });
});

describe('servicePurchases router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('create: should create a service purchase with a unique code', async () => {
    const mockPurchase = {
      id: 1,
      serviceName: 'Consulta Nutricional',
      buyerName: 'Ana García',
      buyerEmail: 'ana@example.com',
      buyerPhone: '3221234567',
      proofUrl: 'https://cdn.example.com/proof.jpg',
      serviceCode: 'NUT-SRV-ABC123',
      status: 'pending',
      createdAt: new Date(),
    };
    vi.mocked(db.createServicePurchase).mockResolvedValue(mockPurchase as any);
    vi.mocked(emailExtra.sendServicePurchaseNotificationToAdmin).mockResolvedValue(undefined as any);

    const result = await caller.servicePurchases.create({
      serviceName: 'Consulta Nutricional',
      buyerName: 'Ana García',
      buyerEmail: 'ana@example.com',
      buyerPhone: '3221234567',
      proofData: 'base64encodeddata',
      proofMimeType: 'image/jpeg',
    });

    expect(result.success).toBe(true);
    expect(result.serviceCode).toMatch(/^NUT-SRV-[A-Z0-9]{6}$/);
    expect(db.createServicePurchase).toHaveBeenCalled();
    expect(emailExtra.sendServicePurchaseNotificationToAdmin).toHaveBeenCalled();
  });

  it('list: should return all service purchases', async () => {
    const mockPurchases = [
      { id: 1, serviceName: 'Facial', buyerName: 'Juan', buyerEmail: 'juan@example.com', status: 'pending', serviceCode: 'NUT-SRV-XYZ123', createdAt: new Date() },
    ];
    vi.mocked(db.getAllServicePurchases).mockResolvedValue(mockPurchases as any);

    const result = await caller.servicePurchases.list();
    expect(result).toHaveLength(1);
    expect(result[0].serviceName).toBe('Facial');
  });

  it('approve: should approve a service purchase and send email', async () => {
    const mockPurchases = [
      { id: 1, serviceName: 'Facial', buyerName: 'Juan', buyerEmail: 'juan@example.com', status: 'pending', serviceCode: 'NUT-SRV-XYZ123', createdAt: new Date() },
    ];
    vi.mocked(db.getAllServicePurchases).mockResolvedValue(mockPurchases as any);
    vi.mocked(db.updateServicePurchaseStatus).mockResolvedValue(undefined as any);
    vi.mocked(emailExtra.sendServicePurchaseApprovedEmail).mockResolvedValue(undefined as any);

    const result = await caller.servicePurchases.approve({ id: 1 });
    expect(result.success).toBe(true);
    expect(db.updateServicePurchaseStatus).toHaveBeenCalledWith(1, 'approved');
    expect(emailExtra.sendServicePurchaseApprovedEmail).toHaveBeenCalledWith(
      'juan@example.com',
      'Juan',
      'Facial',
      'NUT-SRV-XYZ123'
    );
  });

  it('approve: should throw if purchase not found', async () => {
    vi.mocked(db.getAllServicePurchases).mockResolvedValue([]);

    await expect(caller.servicePurchases.approve({ id: 999 })).rejects.toThrow('Compra no encontrada');
  });

  it('reject: should reject a service purchase', async () => {
    vi.mocked(db.updateServicePurchaseStatus).mockResolvedValue(undefined as any);

    const result = await caller.servicePurchases.reject({ id: 1 });
    expect(result.success).toBe(true);
    expect(db.updateServicePurchaseStatus).toHaveBeenCalledWith(1, 'rejected');
  });

  it('delete: should delete a service purchase', async () => {
    vi.mocked(db.deleteServicePurchase).mockResolvedValue(undefined as any);

    await caller.servicePurchases.delete({ id: 1 });
    expect(db.deleteServicePurchase).toHaveBeenCalledWith(1);
  });
});
