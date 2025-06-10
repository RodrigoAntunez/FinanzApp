'use client';

import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function TelegramPage() {
  const [telegramId, setTelegramId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/telegram/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al vincular cuenta');
      }

      toast({
        title: '¡Cuenta vinculada!',
        description: 'Tu cuenta de Telegram ha sido vinculada exitosamente.',
      });

      setTelegramId('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al vincular cuenta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Integración con Telegram</CardTitle>
          <CardDescription>
            Conecta tu cuenta con Telegram para gestionar tus finanzas desde cualquier lugar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>¿Cómo funciona?</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                  <li>Busca @tu_bot en Telegram</li>
                  <li>Inicia una conversación con el bot</li>
                  <li>Envía el comando /start</li>
                  <li>Ingresa tu ID de Telegram aquí para vincular tu cuenta</li>
                </ol>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telegramId">ID de Telegram</Label>
                <div className="flex gap-2">
                  <Input
                    id="telegramId"
                    placeholder="Ej: 123456789"
                    type="number"
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Vinculando...' : 'Vincular cuenta'}
                  </Button>
                </div>
              </div>
            </form>

            <div className="space-y-2">
              <h3 className="font-medium">Comandos disponibles:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>/start - Iniciar el bot</li>
                <li>/help - Mostrar ayuda</li>
                <li>/gasto &lt;monto&gt; &lt;categoría&gt; - Registrar un gasto</li>
                <li>/resumen - Ver resumen de gastos</li>
                <li>/categorias - Ver categorías disponibles</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 