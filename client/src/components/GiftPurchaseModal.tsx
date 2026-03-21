import { useState, useEffect } from 'react';
import { X, Upload, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface GiftPurchaseModalProps {
  isOpen: boolean;
  promotionTitle: string;
  promotionId: number;
  onClose: () => void;
  onSubmit: (data: { buyerName: string; buyerEmail: string; buyerPhone: string; proofFile: File }) => Promise<void>;
}

export default function GiftPurchaseModal({
  isOpen,
  promotionTitle,
  promotionId,
  onClose,
  onSubmit,
}: GiftPurchaseModalProps) {
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos en segundos
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose();
          toast.error('Tiempo límite de 15 minutos agotado');
          return 900;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no debe superar 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        toast.error('Solo se aceptan JPG, PNG o PDF');
        return;
      }
      setProofFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerName.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    if (!buyerEmail.trim()) {
      toast.error('Por favor ingresa tu email');
      return;
    }
    if (!proofFile) {
      toast.error('Por favor sube el comprobante de pago');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        buyerName,
        buyerEmail,
        buyerPhone,
        proofFile,
      });
      setBuyerName('');
      setBuyerEmail('');
      setBuyerPhone('');
      setProofFile(null);
      onClose();
    } catch (error) {
      console.error('Error al procesar compra:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#C5A55A] to-[#B8963E] p-6 flex justify-between items-center">
          <div>
            <h2 className="text-white font-bold text-lg">Comprar Cupón de Regalo</h2>
            <p className="text-white/80 text-sm">{promotionTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Timer */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-2">
          <Clock size={18} className="text-amber-600" />
          <span className="text-sm font-semibold text-amber-900">
            Tiempo límite: {formatTime(timeLeft)}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Clave Interbancaria */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-900 mb-2">CLAVE INTERBANCARIA BANAMEX</p>
            <p className="text-lg font-mono font-bold text-blue-600 break-all">
              002470701448743487
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Realiza la transferencia a esta clave y sube el comprobante
            </p>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tu Nombre *
            </label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A55A]"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tu Email *
            </label>
            <input
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A55A]"
              placeholder="tu@email.com"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tu Teléfono (opcional)
            </label>
            <input
              type="tel"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A55A]"
              placeholder="+57 300 000 0000"
            />
          </div>

          {/* Upload Comprobante */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Comprobante de Pago *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#C5A55A] transition">
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="proof-upload"
              />
              <label htmlFor="proof-upload" className="cursor-pointer">
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  {proofFile ? proofFile.name : 'Haz clic para subir'}
                </p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG o PDF (máx 5MB)</p>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#C5A55A] text-white rounded-lg font-semibold hover:bg-[#B8963E] transition disabled:opacity-50"
            >
              {isSubmitting ? 'Procesando...' : 'Comprar Cupón'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
