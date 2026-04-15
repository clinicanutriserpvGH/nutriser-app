/**
 * usePatientAuth — Hook de autenticación unificada para Nutriser
 *
 * Una sola cuenta funciona en:
 *   - Nutriser Shop (/memberships)
 *   - Mis Tratamientos (/mis-tratamientos)
 *   - Nutriser Academy (/cursos)
 *   - Store (/store)
 *
 * La sesión se persiste en localStorage bajo la clave "nutriser_patient" (unificada con MyTreatments).
 * Al hacer login/registro, se guarda el objeto del paciente (sin passwordHash).
 * Al hacer logout, se limpia el localStorage.
 *
 * IMPORTANTE: Usa un EventTarget global para sincronizar TODAS las instancias del hook
 * dentro de la misma pestaña. Esto resuelve el bug donde el login en un modal
 * no se reflejaba en el componente padre.
 */

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

export type PatientSession = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday?: string | null;
  consentAcceptedAt?: Date | string | null;
  consentPdfUrl?: string | null;
  consentSignature?: string | null;
  pushSubscription?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const SESSION_KEY = "nutriser_patient"; // clave unificada — misma que MyTreatments

// ─── Global Store ────────────────────────────────────────────────────────────
// Singleton que mantiene el estado y notifica a TODOS los suscriptores (hooks)
// cuando cambia. Esto resuelve el problema de sincronización entre instancias.

type Listener = () => void;

class PatientAuthStore {
  private listeners = new Set<Listener>();
  private snapshot: PatientSession | null;

  constructor() {
    this.snapshot = this.readFromStorage();

    // Escuchar cambios de localStorage desde OTRAS pestañas
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === SESSION_KEY) {
          this.snapshot = e.newValue ? JSON.parse(e.newValue) : null;
          this.emit();
        }
      });
    }
  }

  private readFromStorage(): PatientSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PatientSession;
    } catch {
      return null;
    }
  }

  private emit() {
    Array.from(this.listeners).forEach((listener) => listener());
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): PatientSession | null {
    return this.snapshot;
  }

  login(patient: PatientSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(patient));
    this.snapshot = patient;
    this.emit();
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
    this.snapshot = null;
    this.emit();
  }

  updateSession(updates: Partial<PatientSession>) {
    if (!this.snapshot) return;
    const updated = { ...this.snapshot, ...updates };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    this.snapshot = updated;
    this.emit();
  }
}

// Singleton global — una sola instancia para toda la app
const store = new PatientAuthStore();

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePatientAuth() {
  // useSyncExternalStore garantiza que TODAS las instancias del hook
  // se actualicen cuando el store cambia (login, logout, updateSession)
  const patient = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getSnapshot(),
    () => null // server snapshot
  );

  const login = useCallback((patientData: PatientSession) => {
    store.login(patientData);
  }, []);

  const logout = useCallback(() => {
    store.logout();
  }, []);

  const updateSession = useCallback((updates: Partial<PatientSession>) => {
    store.updateSession(updates);
  }, []);

  const isLoggedIn = patient !== null;
  const hasConsent = !!(patient?.consentAcceptedAt);

  return {
    patient,
    isLoggedIn,
    hasConsent,
    login,
    logout,
    updateSession,
  };
}
