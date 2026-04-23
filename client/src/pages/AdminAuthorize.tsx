import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Esta página ya no se utiliza — el sistema de autorización por correo fue reemplazado
 * por el sistema de Palabra Clave. Redirige automáticamente al login.
 */
export default function AdminAuthorize() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/admin/login");
  }, []);

  return null;
}
