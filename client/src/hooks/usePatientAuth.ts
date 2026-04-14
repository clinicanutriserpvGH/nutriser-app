/**
 * usePatientAuth — Hook de autenticación unificada para Nutriser
 *
 * Una sola cuenta funciona en:
 *   - Nutriser Shop (/memberships)
 *   - Mis Tratamientos (/mis-tratamientos)
 *   - Nutriser Academy (/cursos)
 *
 * La sesión se persiste en localStorage bajo la clave "nutriser_patient" (unificada con MyTreatments).
 * Al hacer login/registro, se guarda el objeto del paciente (sin passwordHash).
 * Al hacer logout, se limpia el localStorage.
 */

import { useState, useEffect, useCallback } from "react";

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

function loadSession(): PatientSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PatientSession;
  } catch {
    return null;
  }
}

function saveSession(patient: PatientSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(patient));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function usePatientAuth() {
  const [patient, setPatient] = useState<PatientSession | null>(() => loadSession());

  // Sincronizar cambios de localStorage entre pestañas y al montar
  useEffect(() => {
    // Al montar, siempre leer del localStorage (por si cambió en otra pestaña o navegación)
    const current = loadSession();
    setPatient(current);

    // Escuchar cambios de localStorage desde otras pestañas
    const handler = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        setPatient(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = useCallback((patientData: PatientSession) => {
    saveSession(patientData);
    setPatient(patientData);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setPatient(null);
  }, []);

  const updateSession = useCallback((updates: Partial<PatientSession>) => {
    setPatient(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      saveSession(updated);
      return updated;
    });
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
