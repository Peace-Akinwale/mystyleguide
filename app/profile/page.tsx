'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, Moon, Sun } from 'lucide-react';

type HealthResponse = {
  ok: boolean;
  supabase?: { ok?: boolean; error?: string };
  anthropic?: { ok?: boolean; model?: string };
};

export default function ProfilePage() {
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isDark, setIsDark] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial theme
    const html = document.documentElement;
    setIsDark(html.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const refreshHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/health');
      const data = (await response.json()) as HealthResponse;
      setHealth(data ?? null);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }, []);

  useEffect(() => {
    void refreshHealth();
  }, [refreshHealth]);

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus('idle');

    try {
      const response = await fetch('/api/health');
      const data = (await response.json()) as HealthResponse;
      setHealth(data);

      if (data?.ok) {
        setConnectionStatus('success');
        toast({
          title: 'Connection Successful',
          description: 'Supabase + Anthropic look configured',
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: 'Connection Failed',
          description: data?.supabase?.error || 'Health check failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      toast({
        title: 'Connection Failed',
        description: 'Health check request failed',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/clips');
      if (!response.ok) {
        throw new Error('Failed to fetch clips');
      }

      const clips = await response.json();
      const dataStr = JSON.stringify(clips, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mystyleguide-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Your data has been exported',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">Profile & Settings</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose your preferred theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={toggleTheme}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4" />
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Switch to Dark Mode
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              This app reads keys from server environment variables (.env.local / Vercel)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Supabase: {health?.supabase?.ok ? 'OK' : 'Not ready'}</p>
              {!health?.supabase?.ok && health?.supabase?.error && (
                <p>Error: {String(health.supabase.error)}</p>
              )}
              <p>Anthropic: {health?.anthropic?.ok ? 'OK' : 'Missing API key'}</p>
              {health?.anthropic?.model && <p>Model: {String(health.anthropic.model)}</p>}
            </div>

            <div className="flex gap-2">
              <Button onClick={refreshHealth} variant="outline" className="flex-1">
                Refresh
              </Button>
              <Button onClick={handleTestConnection} disabled={testing} variant="outline">
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : connectionStatus === 'success' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : connectionStatus === 'error' ? (
                  <X className="h-4 w-4 text-red-500" />
                ) : (
                  'Run Check'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Export your clips and style guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportData} variant="outline" className="w-full">
              Export All Data (JSON)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>mystyleguide</strong> - Your personal writing style guide
              powered by AI
            </p>
            <p>Version 1.0.0</p>
            <p>
              Collect writing samples, analyze them with Claude, and generate a
              personalized style guide.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
