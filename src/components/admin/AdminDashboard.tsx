import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, Clock, User, Calendar, Tag, Edit2, Save, X, Trash2, Star, StarOff } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const allPrompts = useQuery(api.prompts.getAllPrompts);
  const [selectedPromptId, setSelectedPromptId] = useState<Id<"prompts"> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const updateStatus = useMutation(api.prompts.updatePromptStatus);
  const updatePrompt = useMutation(api.prompts.updatePrompt);
  const deletePromptMutation = useMutation(api.prompts.deletePrompt);

  // Check URL for promptId parameter and auto-select
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const promptIdParam = params.get('promptId');
    if (promptIdParam && allPrompts) {
      const prompt = allPrompts.find(p => p._id === promptIdParam);
      if (prompt) {
        handleSelectPrompt(prompt._id);
      }
    }
  }, [allPrompts]);

  const selectedPrompt = allPrompts?.find(p => p._id === selectedPromptId);

  const handleSelectPrompt = (promptId: Id<"prompts">) => {
    const prompt = allPrompts?.find(p => p._id === promptId);
    if (prompt) {
      setSelectedPromptId(promptId);
      setIsEditing(false);
      setEditedTitle(prompt.title);
      setEditedContent(prompt.content);
      setEditedCategory(prompt.category);
      setEditedTags(prompt.tags);
      setTagInput('');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (selectedPrompt) {
      setEditedTitle(selectedPrompt.title);
      setEditedContent(selectedPrompt.content);
      setEditedCategory(selectedPrompt.category);
      setEditedTags(selectedPrompt.tags);
      setTagInput('');
    }
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedPromptId) return;

    try {
      await updatePrompt({
        promptId: selectedPromptId,
        title: editedTitle,
        content: editedContent,
        category: editedCategory,
        tags: editedTags,
      });

      setActionMessage({ type: 'success', text: 'Prompt updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setActionMessage(null), 2000);
    } catch (error) {
      console.error('Failed to update prompt:', error);
      setActionMessage({ type: 'error', text: 'Failed to update prompt' });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!editedTags.includes(newTag)) {
        setEditedTags([...editedTags, newTag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const handleApprove = async (promptId: Id<"prompts">) => {
    try {
      await updateStatus({ promptId, status: 'approved' });
      setActionMessage({ type: 'success', text: 'Prompt approved successfully!' });
      setTimeout(() => {
        setActionMessage(null);
        setSelectedPromptId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to approve prompt:', error);
      setActionMessage({ type: 'error', text: 'Failed to approve prompt' });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleToggleFeatured = async (promptId: Id<"prompts">, current: boolean | undefined) => {
    try {
      await updatePrompt({ promptId, featured: !current });
      setActionMessage({ type: 'success', text: !current ? 'Marked as featured.' : 'Removed featured mark.' });
      setTimeout(() => setActionMessage(null), 2000);
    } catch (error) {
      console.error('Failed to toggle featured:', error);
      setActionMessage({ type: 'error', text: 'Failed to toggle featured flag' });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleReject = async (promptId: Id<"prompts">) => {
    try {
      await updateStatus({ promptId, status: 'rejected' });
      setActionMessage({ type: 'success', text: 'Prompt rejected.' });
      setTimeout(() => {
        setActionMessage(null);
        setSelectedPromptId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to reject prompt:', error);
      setActionMessage({ type: 'error', text: 'Failed to reject prompt' });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleDelete = async (promptId: Id<"prompts">) => {
    const prompt = allPrompts?.find(p => p._id === promptId);
    if (!prompt) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${prompt.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deletePromptMutation({ promptId });
        setActionMessage({ type: 'success', text: 'Prompt deleted successfully.' });
        setTimeout(() => {
          setActionMessage(null);
          setSelectedPromptId(null);
        }, 2000);
      } catch (error) {
        console.error('Failed to delete prompt:', error);
        setActionMessage({ type: 'error', text: 'Failed to delete prompt' });
        setTimeout(() => setActionMessage(null), 3000);
      }
    }
  };

  if (!allPrompts) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading prompts...</p>
      </div>
    );
  }

  const pendingCount = allPrompts.filter(p => p.status === 'pending').length;
  const approvedCount = allPrompts.filter(p => p.status === 'approved').length;
  const rejectedCount = allPrompts.filter(p => p.status === 'rejected').length;

  const formatCategoryName = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
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
          {pendingCount === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending prompts</p>
              </CardContent>
            </Card>
          ) : (
            allPrompts
              .filter(p => p.status === 'pending')
              .map((prompt) => (
                <Card
                  key={prompt._id}
                  className={`cursor-pointer hover:border-primary transition-colors ${
                    selectedPromptId === prompt._id ? 'border-primary bg-accent' : ''
                  }`}
                  onClick={() => handleSelectPrompt(prompt._id)}
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
                        {formatDate(prompt.createdAt)}
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
                    {isEditing ? (
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-2xl font-bold mb-2"
                        placeholder="Prompt title"
                      />
                    ) : (
                      <CardTitle className="text-2xl mb-2">
                        {selectedPrompt.title}
                      </CardTitle>
                    )}
                    <CardDescription className="space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {selectedPrompt.authorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(selectedPrompt.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <Input
                            value={editedCategory}
                            onChange={(e) => setEditedCategory(e.target.value)}
                            className="max-w-xs"
                            placeholder="Category"
                          />
                        ) : (
                          <Badge variant="secondary">
                            {formatCategoryName(selectedPrompt.category)}
                          </Badge>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
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
                  {isEditing ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full min-h-[200px] rounded-lg border bg-muted/50 p-4 text-sm"
                      placeholder="Prompt content"
                    />
                  ) : (
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <pre className="text-sm whitespace-pre-wrap">{selectedPrompt.content}</pre>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <>
                        {editedTags.map((tag) => (
                          <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                          placeholder="Add tag (press Enter)"
                          className="max-w-[200px] h-6 text-xs"
                        />
                      </>
                    ) : (
                      selectedPrompt.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Submission Details</h3>
                  <div className="rounded-lg border p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Author ID:</span>
                      <span className="font-mono text-xs">{selectedPrompt.authorId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>{formatDate(selectedPrompt.createdAt)}</span>
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Featured:</span>
                      {selectedPrompt.featured ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing ? (
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1"
                      onClick={handleSaveEdit}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4">
                    {selectedPrompt.status === 'pending' && (
                      <div className="flex gap-3">
                        <Button
                          className="flex-1"
                          onClick={() => handleApprove(selectedPrompt._id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve Prompt
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleReject(selectedPrompt._id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Prompt
                        </Button>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDelete(selectedPrompt._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                      Delete Permanently
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
                    {selectedPrompt && (
                      <Button
                        variant={selectedPrompt.featured ? 'outline' : 'default'}
                        className="w-full"
                        onClick={() => handleToggleFeatured(selectedPrompt._id, selectedPrompt.featured)}
                      >
                        {selectedPrompt.featured ? (
                          <StarOff className="h-4 w-4 mr-2" />
                        ) : (
                          <Star className="h-4 w-4 mr-2" />
                        )}
                        {selectedPrompt.featured ? 'Remove Featured' : 'Mark as Featured'}
                      </Button>
                    )}
        </Card>
      </div>
    </div>
  );
};
