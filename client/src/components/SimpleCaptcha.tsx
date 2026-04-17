import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface SimpleCaptchaProps {
  onVerify: (isValid: boolean) => void;
  isSubmitting?: boolean;
}

export function SimpleCaptcha({ onVerify, isSubmitting }: SimpleCaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  // Generate new captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 50) + 1;
    const n2 = Math.floor(Math.random() * 50) + 1;
    setNum1(n1);
    setNum2(n2);
    setAnswer('');
    setIsVerified(false);
    setError('');
    onVerify(false);
  };

  const handleVerify = () => {
    const userAnswer = parseInt(answer, 10);
    const correctAnswer = num1 + num2;

    if (isNaN(userAnswer)) {
      setError('Por favor ingresa un número válido');
      return;
    }

    if (userAnswer === correctAnswer) {
      setIsVerified(true);
      setError('');
      onVerify(true);
    } else {
      setError('Respuesta incorrecta. Intenta de nuevo.');
      setIsVerified(false);
      onVerify(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isVerified) {
      handleVerify();
    }
  };

  return (
    <div className="w-full p-4 border border-border rounded-lg bg-muted/30">
      <div className="space-y-3">
        {/* Question */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Verifica que eres humano:
          </span>
        </div>

        {/* Math Problem */}
        <div className="flex items-center gap-2 bg-background p-3 rounded border border-border">
          <span className="text-lg font-semibold text-foreground">
            {num1} + {num2} =
          </span>
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isVerified || isSubmitting}
            placeholder="?"
            className="w-16 px-2 py-1 border border-border rounded text-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {isVerified && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Verificación completada ✓</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleVerify}
            disabled={isVerified || isSubmitting || !answer.trim()}
            className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Verificar
          </button>
          <button
            onClick={generateCaptcha}
            disabled={isVerified || isSubmitting}
            className="px-3 py-2 border border-border rounded font-medium text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Generar nuevo desafío"
          >
            Nuevo
          </button>
        </div>
      </div>
    </div>
  );
}
