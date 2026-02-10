'use client';

import { useCallback, useEffect, useState } from 'react';
import { StyleGuide } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { downloadTextFile, copyToClipboard, formatDate } from '@/lib/utils';
import { Download, Copy, Loader2, FileText, ChevronLeft, Pencil, Save, X, MessageSquare, Send, MoreVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function GuidePage() {
  const [allGuides, setAllGuides] = useState<StyleGuide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<StyleGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const { toast } = useToast();

  const fetchAllGuides = useCallback(async () => {
    try {
      const response = await fetch('/api/style-guide?all=true');
      if (response.ok) {
        const data = await response.json();
        setAllGuides(data || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load style guides',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch style guides:', error);
      toast({
        title: 'Error',
        description: 'Failed to load style guides',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchAllGuides();
  }, [fetchAllGuides]);

  const handleDownload = () => {
    if (!selectedGuide) return;
    downloadTextFile(selectedGuide.content, `${selectedGuide.title}.md`);
    toast({
      title: 'Downloaded',
      description: 'Style guide saved as markdown file',
    });
  };

  const handleCopy = async () => {
    if (!selectedGuide) return;
    try {
      await copyToClipboard(selectedGuide.content);
      toast({
        title: 'Copied',
        description: 'Style guide copied to clipboard',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleSelectGuide = (guide: StyleGuide) => {
    setSelectedGuide(guide);
    setIsEditing(false);
    setShowChat(false);
    setChatMessages([]);
  };

  const handleBackToList = () => {
    setSelectedGuide(null);
    setIsEditing(false);
    setShowChat(false);
    setChatMessages([]);
  };

  const handleStartEdit = () => {
    if (!selectedGuide) return;
    setEditTitle(selectedGuide.title);
    setEditContent(selectedGuide.content);
    setIsEditing(true);
    setShowChat(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
  };

  const handleSaveEdit = async () => {
    if (!selectedGuide) return;

    setSaving(true);
    try {
      const response = await fetch('/api/style-guide', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedGuide.id,
          title: editTitle,
          content: editContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const updatedGuide = await response.json();
      setSelectedGuide(updatedGuide);
      setAllGuides((prev) =>
        prev.map((g) => (g.id === updatedGuide.id ? updatedGuide : g))
      );
      setIsEditing(false);

      toast({
        title: 'Saved',
        description: 'Style guide updated successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChat = () => {
    setShowChat(!showChat);
    if (!showChat && chatMessages.length === 0) {
      // Initial greeting
      setChatMessages([{
        role: 'assistant',
        content: "Hi! I can help you refine your style guide. You can ask me to:\n- Explain sections in more detail\n- Add more examples\n- Remove or modify parts\n- Expand on techniques\n\nWhat would you like to work on?"
      }]);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !selectedGuide) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          styleGuideContent: selectedGuide.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {selectedGuide && (
              <Button variant="ghost" size="sm" onClick={handleBackToList}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                All Guides
              </Button>
            )}
            <h1 className="text-2xl font-bold">
              {selectedGuide ? (isEditing ? 'Edit Guide' : selectedGuide.title) : 'Your Style Guides'}
            </h1>
          </div>
          {selectedGuide && !isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleToggleChat}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {showChat ? 'Hide' : 'Chat'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Markdown
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {selectedGuide && isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container px-4 py-6 max-w-7xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : allGuides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No style guides yet. Analyze your clips first to generate one.
            </p>
          </div>
        ) : !selectedGuide ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">
              You have {allGuides.length} style guide{allGuides.length > 1 ? 's' : ''}. Click to view.
            </p>
            {allGuides.map((guide) => (
              <Card
                key={guide.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleSelectGuide(guide)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    {guide.is_active && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created: {formatDate(guide.created_at)}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {guide.content.substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: showChat ? '2fr 1fr' : '1fr' }}>
            {/* Main content */}
            <div>
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="edit-content">Content (Markdown)</Label>
                      <Textarea
                        id="edit-content"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[500px] font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedGuide.title}</CardTitle>
                      {selectedGuide.is_active && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {formatDate(selectedGuide.created_at)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{selectedGuide.content}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Chat panel */}
            {showChat && !isEditing && (
              <div className="h-[calc(100vh-12rem)] flex flex-col bg-[#1a1f2e] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100">Chat with Your Guide</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-[#0ea5e9] text-white rounded-br-md'
                            : 'bg-[#2d3748] text-gray-100 rounded-bl-md'
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#2d3748] rounded-2xl rounded-bl-md px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-100" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSubmit()}
                      placeholder="Ask about your style guide..."
                      disabled={chatLoading}
                      className="bg-[#2d3748] border-gray-600 text-gray-100 placeholder:text-gray-400 focus-visible:ring-[#0ea5e9]"
                    />
                    <Button
                      onClick={handleChatSubmit}
                      disabled={chatLoading || !chatInput.trim()}
                      size="sm"
                      className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
