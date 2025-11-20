import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, User, Calendar, Tag } from 'lucide-react';

interface PendingPrompt {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorName: string;
  authorEmail: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AdminDashboardProps {
  pendingPrompts: PendingPrompt[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ pendingPrompts: initialPrompts }) => {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<PendingPrompt | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApprove = (promptId: string) => {
    setPrompts(prompts.map(p => 
      p.id === promptId ? { ...p, status: 'approved' as const } : p
    ));
    setActionMessage({ type: 'success', text: 'Prompt approved successfully!' });
    setTimeout(() => {
      setActionMessage(null);
      setSelectedPrompt(null);
    }, 2000);
  };

  const handleReject = (promptId: string) => {
    setPrompts(prompts.map(p => 
      p.id === promptId ? { ...p, status: 'rejected' as const } : p
    ));
    setActionMessage({ type: 'success', text: 'Prompt rejected.' });
    setTimeout(() => {
      setActionMessage(null);
      setSelectedPrompt(null);
    }, 2000);
  };

  const pendingCount = prompts.filter(p => p.status === 'pending').length;
  const approvedCount = prompts.filter(p => p.status === 'approved').length;
  const rejectedCount = prompts.filter(p => p.status === 'rejected').length;

  const formatCategoryName = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats Overview */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Clock className="h-6 w-6 text-yellow-500" />
              {pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              {approvedCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              {rejectedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pending Queue */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-xl font-bold">Pending Queue</h2>
        <div className="space-y-3">
          {prompts.filter(p => p.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending prompts</p>
              </CardContent>
            </Card>
          ) : (
            prompts
              .filter(p => p.status === 'pending')
              .map((prompt) => (
                <Card
                  key={prompt.id}
                  className={`cursor-pointer hover:border-primary transition-colors ${
                    selectedPrompt?.id === prompt.id ? 'border-primary bg-accent' : ''
                  }`}
                  onClick={() => setSelectedPrompt(prompt)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">
                        {prompt.title}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {formatCategoryName(prompt.category)}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        <User className="h-3 w-3" />
                        {prompt.authorName}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {formatDate(prompt.submittedAt)}
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
          )}
        </div>
      </div>

      {/* Review Panel */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          {selectedPrompt ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">
                      {selectedPrompt.title}
                    </CardTitle>
                    <CardDescription className="space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {selectedPrompt.authorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(selectedPrompt.submittedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {formatCategoryName(selectedPrompt.category)}
                        </Badge>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Action Message */}
                {actionMessage && (
                  <div
                    className={`p-4 rounded-lg border ${
                      actionMessage.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-700'
                        : 'bg-red-500/10 border-red-500/20 text-red-700'
                    }`}
                  >
                    <p className="text-sm font-medium">{actionMessage.text}</p>
                  </div>
                )}

                {/* Prompt Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Prompt Content</h3>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <pre className="text-sm whitespace-pre-wrap">{selectedPrompt.content}</pre>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Submission Details</h3>
                  <div className="rounded-lg border p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Author Email:</span>
                      <span>{selectedPrompt.authorEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>{formatDate(selectedPrompt.submittedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={
                          selectedPrompt.status === 'approved'
                            ? 'default'
                            : selectedPrompt.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {selectedPrompt.status.charAt(0).toUpperCase() +
                          selectedPrompt.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedPrompt.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1"
                      onClick={() => handleApprove(selectedPrompt.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve Prompt
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(selectedPrompt.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Prompt
                    </Button>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full py-12">
              <div className="text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a prompt from the queue to review</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};
