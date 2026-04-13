import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminMemberships() {
  const { user } = useAuth();
  const { data: memberships, isLoading, refetch } = trpc.memberships.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const updateStatusMutation = trpc.memberships.updateStatus.useMutation();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              No tienes permiso para acceder a esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateStatus = async (id: number, status: "verified" | "rejected") => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success(`Cupón ${status === "verified" ? "verificado" : "rechazado"}`);
      refetch();
    } catch (error) {
      toast.error("Error al actualizar el estado");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      verified: "default",
      rejected: "destructive",
    };
    const labels: Record<string, string> = {
      pending: "Pendiente",
      verified: "Verificado",
      rejected: "Rechazado",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#F5F1E8] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif text-[#1A1A1A] mb-8">
          Panel de Administración - Cupones Adquiridos
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" />
          </div>
        ) : !memberships || memberships.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">
                No hay cupones registrados aún.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {memberships.map((membership) => (
              <Card key={membership.id} className="border-l-4 border-l-[#C5A55A]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{membership.clientName}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{membership.clientEmail}</p>
                    </div>
                    {getStatusBadge(membership.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Programa</p>
                      <p className="text-[#C5A55A] font-bold">
                        {membership.programType === "basic" ? "Básico" : "Premium"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Precio</p>
                      <p className="font-bold">${membership.price}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Teléfono</p>
                      <p>{membership.clientPhone || "No proporcionado"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Concepto de Depósito</p>
                      <p className="text-sm">{membership.depositConcept}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Fecha de Registro
                    </p>
                    <p className="text-sm">
                      {new Date(membership.createdAt).toLocaleString("es-MX")}
                    </p>
                  </div>

                  {membership.status === "pending" && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleUpdateStatus(membership.id, "verified")}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={updateStatusMutation.isPending}
                      >
                        Verificar
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(membership.id, "rejected")}
                        variant="destructive"
                        className="flex-1"
                        disabled={updateStatusMutation.isPending}
                      >
                        Rechazar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
