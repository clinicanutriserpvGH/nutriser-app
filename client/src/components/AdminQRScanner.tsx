/**
 * AdminQRScanner — Escanear QR de paciente y registrar compra presencial
 * Flujo: Escanear QR → Ver datos del paciente → Seleccionar servicio/producto → Confirmar → Cashback acreditado
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  QrCode, Camera, User, Wallet, ShoppingBag,
  Package, Sparkles, Check, ArrowLeft, Loader2,
  Search, CreditCard, DollarSign, X,
} from "lucide-react";

type Step = "scan" | "patient" | "select" | "confirm" | "done";
type ItemType = "service" | "package" | "product";

export default function AdminQRScanner() {
  const [step, setStep] = useState<Step>("scan");
  const [walletNumber, setWalletNumber] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: ItemType;
    name: string;
    price: number; // centavos
  } | null>(null);
  const [customPrice, setCustomPrice] = useState("");
  const [cashbackPercent, setCashbackPercent] = useState("2");
  const [notes, setNotes] = useState("");
  const scannerRef = useRef<any>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // Query para buscar monedero por número
  const patientQuery = trpc.wallet.adminLookupByNumber.useQuery(
    { walletNumber },
    { enabled: !!walletNumber && step !== "scan" }
  );

  // Query para servicios y productos
  const servicesQuery = trpc.services.list.useQuery();
  const productsQuery = trpc.products.list.useQuery();

  // Mutation para registrar compra presencial
  const registerMutation = trpc.wallet.adminRegisterPresentialPurchase.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Cashback de $${(data.cashbackAmount / 100).toFixed(2)} MXN acreditado a ${data.patientName}`
      );
      setStep("done");
      utils.wallet.adminListAll.invalidate();
      utils.wallet.adminLookupByNumber.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // Paquetes hardcoded (mismos que en Memberships)
  const PACKAGES = [
    { id: "pkg-nutricion", name: "Paquete Nutrición", price: 250000 },
    { id: "pkg-reductor", name: "Paquete Reductor Nutriser", price: 450000 },
  ];

  // ─── QR Scanner ───────────────────────────────────────────────
  const startScanner = useCallback(async () => {
    if (scanning) return;
    setScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // Esperar a que el DOM tenga el contenedor
      await new Promise((r) => setTimeout(r, 300));

      if (!scannerContainerRef.current) {
        setScanning(false);
        return;
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Extraer walletNumber del URL del QR
          // Formato: https://nutriserpv.com/monedero/NTRXXXXXXXX
          const match = decodedText.match(/NTR[A-Z0-9]+/i);
          if (match) {
            setWalletNumber(match[0].toUpperCase());
            setStep("patient");
            stopScanner();
          } else if (decodedText.startsWith("NTR")) {
            setWalletNumber(decodedText.toUpperCase());
            setStep("patient");
            stopScanner();
          } else {
            toast.error("QR no reconocido. Escanea un QR de monedero Nutriser.");
          }
        },
        () => {} // ignore errors during scan
      );
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      toast.error("No se pudo acceder a la cámara. Verifica los permisos.");
      setScanning(false);
    }
  }, [scanning]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleManualSearch = () => {
    const num = manualInput.trim().toUpperCase();
    if (!num) return;
    setWalletNumber(num.startsWith("NTR") ? num : `NTR${num}`);
    setStep("patient");
  };

  const handleSelectItem = (type: ItemType, name: string, price: number) => {
    setSelectedItem({ type, name, price });
    setCustomPrice((price / 100).toString());
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (!selectedItem || !walletNumber) return;
    const priceInCents = Math.round(parseFloat(customPrice || "0") * 100);
    const cbPercent = parseFloat(cashbackPercent || "2");

    registerMutation.mutate({
      walletNumber,
      itemType: selectedItem.type,
      itemName: selectedItem.name,
      itemPrice: priceInCents,
      cashbackPercent: cbPercent,
      notes: notes || undefined,
    });
  };

  const handleReset = () => {
    stopScanner();
    setStep("scan");
    setWalletNumber("");
    setManualInput("");
    setSelectedItem(null);
    setCustomPrice("");
    setCashbackPercent("1");
    setNotes("");
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {(["Escanear", "Paciente", "Seleccionar", "Confirmar"] as const).map((label, i) => {
          const stepIndex = ["scan", "patient", "select", "confirm"].indexOf(step);
          const isActive = i <= stepIndex;
          return (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isActive ? "bg-[#C5A55A] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {i + 1}
              </div>
              <span className={isActive ? "text-[#C5A55A] font-semibold" : ""}>{label}</span>
              {i < 3 && <div className={`w-6 h-0.5 ${isActive ? "bg-[#C5A55A]" : "bg-gray-200"}`} />}
            </div>
          );
        })}
      </div>

      {/* ═══ STEP 1: Escanear QR ═══ */}
      {step === "scan" && (
        <div className="space-y-4">
          <Card className="border-[#C5A55A]/30 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4 text-center space-y-4">
              <div className="w-16 h-16 bg-[#C5A55A]/10 rounded-2xl flex items-center justify-center mx-auto">
                <QrCode className="w-8 h-8 text-[#C5A55A]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Escanear QR del Paciente</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Escanea el código QR del monedero del paciente para registrar una compra presencial
                </p>
              </div>

              {!scanning ? (
                <Button
                  onClick={startScanner}
                  className="bg-[#C5A55A] hover:bg-[#b8963f] text-white gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Abrir Cámara
                </Button>
              ) : (
                <div className="space-y-3">
                  <div
                    id="qr-reader"
                    ref={scannerContainerRef}
                    className="mx-auto rounded-xl overflow-hidden border-2 border-[#C5A55A]/30"
                    style={{ maxWidth: 300 }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopScanner}
                    className="text-red-500 border-red-200"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cerrar cámara
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Búsqueda manual */}
          <Card className="border-gray-200">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <Search className="w-3 h-3" />
                O buscar por número de tarjeta
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="NTR..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                  className="text-sm font-mono"
                />
                <Button
                  onClick={handleManualSearch}
                  className="bg-[#1A1A1A] hover:bg-[#333] text-white"
                  disabled={!manualInput.trim()}
                >
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ STEP 2: Datos del Paciente ═══ */}
      {step === "patient" && (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver a escanear
          </Button>

          {patientQuery.isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#C5A55A] mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Buscando paciente...</p>
            </div>
          ) : patientQuery.error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-center">
                <p className="text-red-600 font-semibold">Monedero no encontrado</p>
                <p className="text-xs text-red-400 mt-1">Verifica el número: {walletNumber}</p>
                <Button variant="outline" size="sm" onClick={handleReset} className="mt-3">
                  Intentar de nuevo
                </Button>
              </CardContent>
            </Card>
          ) : patientQuery.data ? (
            <Card className="border-[#C5A55A]/30 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1A1A1A] to-[#333] rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-[#C5A55A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{patientQuery.data.patientName}</p>
                    <p className="text-xs text-gray-500">{patientQuery.data.patientEmail}</p>
                    {patientQuery.data.patientPhone && (
                      <p className="text-xs text-gray-400">{patientQuery.data.patientPhone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Saldo</p>
                    <p className="font-black text-xl text-[#C5A55A]">
                      ${(patientQuery.data.balance / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <CreditCard className="w-3 h-3 text-gray-400" />
                  <span className="font-mono text-gray-500">{patientQuery.data.walletNumber}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    patientQuery.data.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {patientQuery.data.isActive ? "Activa" : "Suspendida"}
                  </span>
                </div>

                {patientQuery.data.isActive ? (
                  <Button
                    onClick={() => setStep("select")}
                    className="w-full bg-[#C5A55A] hover:bg-[#b8963f] text-white gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Registrar Compra
                  </Button>
                ) : (
                  <p className="text-center text-red-500 text-sm font-semibold">
                    Monedero suspendido — no se puede registrar compra
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {/* ═══ STEP 3: Seleccionar Servicio/Producto ═══ */}
      {step === "select" && (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setStep("patient")} className="text-gray-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Button>

          <p className="text-sm font-bold text-gray-700">
            ¿Qué compró <span className="text-[#C5A55A]">{patientQuery.data?.patientName}</span>?
          </p>

          {/* Paquetes */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <Package className="w-3 h-3" /> Paquetes
            </p>
            <div className="grid grid-cols-1 gap-2">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handleSelectItem("package", pkg.name, pkg.price)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#C5A55A] hover:bg-amber-50 transition text-left"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{pkg.name}</p>
                    <p className="text-xs text-[#C5A55A] font-bold">${(pkg.price / 100).toLocaleString()} MXN</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Servicios */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Tratamientos / Servicios
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {servicesQuery.isLoading ? (
                <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
              ) : (
                (servicesQuery.data || []).map((svc: any) => {
                  const priceNum = parseFloat(svc.price?.replace(/[^0-9.]/g, "") || "0");
                  return (
                    <button
                      key={svc.id}
                      onClick={() => handleSelectItem("service", svc.name, Math.round(priceNum * 100))}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#C5A55A] hover:bg-amber-50 transition text-left"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{svc.name}</p>
                        <p className="text-xs text-[#C5A55A] font-bold">
                          {priceNum > 0 ? `$${priceNum.toLocaleString()} MXN` : "Consultar precio"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Productos de Farmacia */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" /> Productos Farmacy
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {productsQuery.isLoading ? (
                <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
              ) : (
                (productsQuery.data || []).map((prod: any) => {
                  const priceNum = parseFloat(prod.price?.replace(/[^0-9.]/g, "") || "0");
                  return (
                    <button
                      key={prod.id}
                      onClick={() => handleSelectItem("product", prod.name, Math.round(priceNum * 100))}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#C5A55A] hover:bg-amber-50 transition text-left"
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{prod.name}</p>
                        <p className="text-xs text-[#C5A55A] font-bold">
                          {priceNum > 0 ? `$${priceNum.toLocaleString()} MXN` : "Sin precio"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 4: Confirmar ═══ */}
      {step === "confirm" && selectedItem && (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setStep("select")} className="text-gray-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Cambiar artículo
          </Button>

          <Card className="border-[#C5A55A]/30">
            <CardContent className="p-4 space-y-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">Registrar compra para</p>
                <p className="font-bold text-lg text-gray-900">{patientQuery.data?.patientName}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Artículo</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedItem.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Tipo</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase">
                    {selectedItem.type === "service" ? "Tratamiento" : selectedItem.type === "package" ? "Paquete" : "Producto"}
                  </span>
                </div>
              </div>

              {/* Precio editable */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  <DollarSign className="w-3 h-3 inline" /> Precio cobrado (MXN)
                </label>
                <Input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="0.00"
                  className="text-lg font-bold text-center"
                />
              </div>

              {/* Cashback % */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  <Wallet className="w-3 h-3 inline" /> Cashback (%)
                </label>
                <Input
                  type="number"
                  value={cashbackPercent}
                  onChange={(e) => setCashbackPercent(e.target.value)}
                  placeholder="1"
                  min="0"
                  max="100"
                  className="text-center"
                />
              </div>

              {/* Preview cashback */}
              {parseFloat(customPrice) > 0 && parseFloat(cashbackPercent) > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-green-600">Cashback que se acreditará</p>
                  <p className="text-2xl font-black text-green-700">
                    +${((parseFloat(customPrice) * parseFloat(cashbackPercent)) / 100).toFixed(2)} MXN
                  </p>
                </div>
              )}

              {/* Notas */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Notas (opcional)</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Pago en efectivo, sesión 2 de 4..."
                  className="text-sm"
                />
              </div>

              <Button
                onClick={handleConfirm}
                disabled={registerMutation.isPending || !parseFloat(customPrice)}
                className="w-full bg-[#C5A55A] hover:bg-[#b8963f] text-white gap-2 h-12 text-base"
              >
                {registerMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                Confirmar y Acreditar Cashback
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ STEP 5: Completado ═══ */}
      {step === "done" && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-green-700">Compra Registrada</h3>
              <p className="text-sm text-gray-500 mt-1">
                El cashback ha sido acreditado al monedero del paciente
              </p>
            </div>
            <Button
              onClick={handleReset}
              className="bg-[#C5A55A] hover:bg-[#b8963f] text-white gap-2"
            >
              <QrCode className="w-4 h-4" />
              Escanear otro QR
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
