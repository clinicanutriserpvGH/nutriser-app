/**
 * ContractBlockModal — Modal bloqueante de firma de contrato
 *
 * Se muestra cuando el admin solicita la firma de contrato para un paciente.
 * El modal es de pantalla completa, no se puede cerrar ni descartar hasta que
 * el paciente firme el consentimiento informado.
 *
 * Flujo:
 * 1. Admin solicita firma desde el panel → contractRequired=true en DB
 * 2. Al abrir la app, se detecta contractRequired=true y consentAcceptedAt=null
 * 3. Este modal aparece y bloquea toda la navegación
 * 4. El paciente lee el documento, dibuja su firma y presiona "Firmar"
 * 5. Se llama a trpc.patients.saveConsent que guarda el PDF y limpia contractRequired
 * 6. El modal desaparece y el paciente puede continuar normalmente
 */
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, X, ShieldCheck, ClipboardList } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SignatureCanvas from "react-signature-canvas";
import { useDeviceType } from "@/hooks/useDeviceType";

// ─── Texto del consentimiento (idéntico al de MyTreatments) ──────────────────
const CONSENT_TEXT = `CARTA DE CONSENTIMIENTO INFORMADO PARA TRATAMIENTOS ESTÉTICOS Y NUTRICIONALES
ESTABLECIMIENTO: Nutriser Aesthetic & Nutrition
DOMICILIO: Nutriser Aesthetic & Nutrition
TELÉFONO: +52 (322) 100-7799
CORREO: clinicanutriserpv@gmail.com
FECHA DE EMISIÓN: 31 de marzo de 2026
Documento elaborado en cumplimiento de la NOM-004-SSA3-2012 del Expediente Clínico, el Artículo 51 Bis 2 de la Ley General de Salud, y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I. IDENTIFICACIÓN DE LAS PARTES
PRESTADOR DEL SERVICIO: Nutriser Aesthetic & Nutrition, establecimiento de salud y bienestar estético, con atención por profesionales certificados en nutrición clínica y procedimientos estéticos no invasivos.
PACIENTE: El/la suscrito/a, cuyos datos personales constan en el expediente clínico del establecimiento, y cuya firma al calce del presente documento acredita su identidad y conformidad.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
II. OBJETO DEL CONSENTIMIENTO
El presente consentimiento ampara la realización de tratamientos estéticos no invasivos y/o mínimamente invasivos, así como asesorías y planes nutricionales personalizados, que pueden incluir, según el caso clínico de cada paciente:
• Radiofrecuencia corporal y facial (reafirmación de tejidos)
• Cavitación ultrasónica (reducción de grasa localizada)
• Mesoterapia reductora y/o revitalizante (microinyecciones con sustancias activas)
• Presoterapia (drenaje linfático mecánico)
• Tratamientos con luz LED (fototerapia)
• Ultrasonido terapéutico
• Electroestimulación muscular
• Asesoría nutricional y planes de alimentación personalizados
• Escaneo corporal y análisis de composición corporal
• Otros procedimientos no invasivos acordados con el profesional tratante
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
III. BENEFICIOS ESPERADOS
Los procedimientos descritos buscan mejorar la composición corporal, reducir medidas, mejorar el tono y firmeza de la piel, y optimizar el estado nutricional del paciente. Los resultados pueden variar según las características individuales, el número de sesiones realizadas y el cumplimiento de las indicaciones post-tratamiento.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IV. RIESGOS Y EFECTOS SECUNDARIOS
El paciente ha sido informado de que los procedimientos pueden presentar los siguientes efectos secundarios, generalmente transitorios:
• Enrojecimiento temporal de la piel
• Sensación de calor o leve ardor durante y después del procedimiento
• Hematomas o equimosis leves (especialmente en mesoterapia)
• Sensibilidad aumentada en la zona tratada
• Infección en el sitio de aplicación (en procedimientos con microinyecciones)
• Quemaduras superficiales por mal manejo de equipos térmicos
• Irregularidades en el contorno corporal
Riesgos personalizados: El paciente declara haber informado al equipo de Nutriser sobre todas sus condiciones médicas preexistentes, alergias conocidas, medicamentos en uso, embarazo o lactancia, y cualquier otro factor de salud relevante. La omisión de esta información exime de responsabilidad al establecimiento por complicaciones derivadas de dicha omisión.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
V. ALTERNATIVAS AL TRATAMIENTO
El paciente ha sido informado de que existen alternativas a los procedimientos propuestos, incluyendo tratamientos quirúrgicos, otros procedimientos no invasivos, o la opción de no realizar ningún tratamiento. La elección del tratamiento ha sido libre y voluntaria, con base en la información proporcionada por el profesional tratante.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VI. CUIDADOS POST-TRATAMIENTO
El paciente se compromete a seguir las indicaciones post-tratamiento proporcionadas por el equipo de Nutriser, que pueden incluir:
• Evitar exposición solar directa en las zonas tratadas por el tiempo indicado
• Aplicar los productos recomendados por el profesional tratante
• Mantener hidratación adecuada y seguir el plan nutricional asignado
• Evitar actividad física intensa durante las primeras horas post-sesión
• Reportar de inmediato cualquier reacción adversa inusual
El incumplimiento de estas indicaciones puede afectar los resultados del tratamiento y exime al establecimiento de responsabilidad por complicaciones derivadas de dicho incumplimiento.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VII. AUTORIZACIÓN PARA CONTINGENCIAS
El paciente autoriza al personal de salud de Nutriser Aesthetic & Nutrition para atender cualquier contingencia o urgencia derivada del acto médico autorizado, de conformidad con el principio de libertad prescriptiva establecido en la NOM-004-SSA3-2012.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIII. PROTECCIÓN DE DATOS PERSONALES
En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, Nutriser Aesthetic & Nutrition informa al paciente que:
• Sus datos personales (nombre, correo electrónico, teléfono, fecha de nacimiento, fotografías y expediente clínico) serán tratados con la finalidad de prestar los servicios contratados, llevar el seguimiento de su tratamiento y comunicar resultados y citas.
• Los datos no serán compartidos con terceros sin consentimiento expreso del paciente, salvo obligación legal.
• El paciente puede ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) enviando una solicitud al correo clinicanutriserpv@gmail.com.
• Las fotografías de antes/después tomadas durante el tratamiento son propiedad del paciente y solo podrán ser utilizadas con fines de seguimiento clínico, salvo autorización expresa por escrito para uso promocional.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IX. DERECHO DE REVOCACIÓN
El paciente tiene el derecho de revocar el presente consentimiento en cualquier momento antes del inicio del procedimiento, sin necesidad de expresar causa alguna y sin que ello afecte la calidad de la atención que recibirá en el establecimiento. La revocación deberá comunicarse verbalmente o por escrito al profesional tratante.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
X. DECLARACIÓN DE CONSENTIMIENTO
Yo, el/la paciente que suscribe el presente documento, declaro bajo protesta de decir verdad que:
1. He recibido información clara, completa, veraz y oportuna sobre los tratamientos, sus objetivos, riesgos, beneficios y alternativas.
2. He tenido la oportunidad de realizar todas las preguntas que consideré necesarias y estas fueron respondidas satisfactoriamente.
3. Comprendo que los resultados pueden variar según mis características individuales y mi adherencia a las indicaciones.
4. Otorgo mi consentimiento de manera libre, voluntaria y sin coacción alguna para la realización de los tratamientos indicados.
5. He informado verazmente sobre mi estado de salud, antecedentes médicos, alergias y medicamentos en uso.
6. He leído íntegramente el presente documento y acepto todas sus cláusulas.
Este documento tiene plena validez legal conforme a los artículos 1803 y 1834 del Código Civil Federal, el artículo 51 Bis 2 de la Ley General de Salud, y la NOM-004-SSA3-2012. No podrá ser modificado una vez firmado digitalmente.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Firma del paciente: [FIRMA DIGITAL AL CALCE]
Fecha de firma: [FECHA DE FIRMA]
Nombre del profesional tratante: Equipo Nutriser Aesthetic & Nutrition
Establecimiento: Nutriser Aesthetic & Nutrition`;

// ─── Props ────────────────────────────────────────────────────────────────────
interface ContractBlockModalProps {
  /** ID del paciente en la tabla patientAccounts */
  patientId: number;
  /** Nombre del paciente para personalizar el texto del contrato */
  patientName: string;
  /** Callback que se llama cuando el contrato fue firmado exitosamente */
  onSigned: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function ContractBlockModal({ patientId, patientName, onSigned }: ContractBlockModalProps) {
  const { isDesktop } = useDeviceType();
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [signing, setSigning] = useState(false);

  const consentMutation = trpc.patients.saveConsent.useMutation({
    onSuccess: () => {
      toast.success("¡Contrato firmado exitosamente! Ya puedes continuar.");
      onSigned();
    },
    onError: (e) => {
      toast.error("Error al guardar la firma: " + e.message);
      setSigning(false);
    },
  });

  const handleSign = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      toast.error("Por favor dibuja tu firma para continuar.");
      return;
    }
    setSigning(true);
    try {
      const signatureDataUrl = sigCanvasRef.current.toDataURL("image/png");
      await consentMutation.mutateAsync({
        patientId,
        signature: signatureDataUrl,
        patientName,
      });
    } finally {
      setSigning(false);
    }
  };

  // Personalizar el texto con el nombre del paciente
  const consentText = CONSENT_TEXT.replace(
    "Yo, el/la paciente que suscribe el presente documento,",
    `Yo, ${patientName}, paciente que suscribe el presente documento,`
  );

  return (
    // Overlay de pantalla completa — z-[200] para estar por encima de todo
    <div
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <div className="w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] px-5 py-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-[#C5A55A]/20 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-[#C5A55A]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Contrato de Consentimiento</h2>
              <p className="text-[#C5A55A] text-xs">Nutriser Aesthetic &amp; Nutrition</p>
            </div>
          </div>
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl px-3 py-2 mt-3">
            <p className="text-amber-200 text-xs leading-relaxed">
              <strong>Firma requerida:</strong> Antes de comenzar cualquier tratamiento en Nutriser Aesthetic &amp; Nutrition es necesario que firmes el Contrato de Consentimiento Informado. Lee el documento completo y firma al final para continuar.
            </p>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4">
          {/* Documento de consentimiento */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A55A]" />
              <span className="text-gray-800 text-sm font-semibold">Contrato de Consentimiento Informado para Tratamientos</span>
            </div>
            <div
              ref={scrollRef}
              onScroll={() => {
                const el = scrollRef.current;
                if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 15) {
                  setScrolled(true);
                }
              }}
              className="h-56 overflow-y-auto bg-gray-50 rounded-2xl p-4 text-gray-600 text-xs leading-relaxed whitespace-pre-line border border-gray-200"
            >
              {consentText}
            </div>
            {!scrolled && (
              <p className="text-[#C5A55A] text-xs text-center mt-2 flex items-center justify-center gap-1 animate-pulse">
                <span>↓</span> Desplázate hasta el final para poder firmar
              </p>
            )}
          </div>

          {/* Firma digital */}
          <div className={`space-y-3 transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <label className="text-gray-700 text-sm font-semibold block">
              {isDesktop ? "Firma digital (dibuja con el mouse):" : "Firma digital (dibuja con tu dedo):"}
            </label>
            <div className="bg-white rounded-2xl p-2 border-2 border-gray-200">
              <SignatureCanvas
                ref={sigCanvasRef}
                canvasProps={{
                  className: "w-full border border-gray-300 rounded-xl",
                  style: { height: "160px", touchAction: "none", display: "block" },
                }}
                onEnd={() => setSignatureEmpty(sigCanvasRef.current?.isEmpty() ?? true)}
              />
            </div>
            <p className="text-gray-400 text-[11px] text-center">
              Usa la firma de tu identificación oficial
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  sigCanvasRef.current?.clear();
                  setSignatureEmpty(true);
                }}
                variant="outline"
                className="flex-1 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                disabled={!scrolled}
              >
                <X className="w-4 h-4 mr-1.5" /> Borrar
              </Button>
              <Button
                onClick={handleSign}
                disabled={!scrolled || signatureEmpty || signing || consentMutation.isPending}
                className="flex-1 bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold"
              >
                {signing || consentMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Guardando...</>
                ) : (
                  <><FileText className="w-4 h-4 mr-2" /> Firmar Contrato</>
                )}
              </Button>
            </div>
          </div>

          {/* Nota legal */}
          <p className="text-gray-400 text-[10px] text-center leading-relaxed">
            Este contrato aplica para todos los tratamientos estéticos, corporales, faciales y nutricionales realizados en Nutriser Aesthetic &amp; Nutrition, conforme a la NOM-004-SSA3-2012.
          </p>
        </div>
      </div>
    </div>
  );
}
