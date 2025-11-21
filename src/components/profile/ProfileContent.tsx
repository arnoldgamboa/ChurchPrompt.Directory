import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/astro/react';
import { api } from '../../../convex/_generated/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PromptCard from '@/components/prompts/PromptCard';
import { Calendar, Mail, User, Clock, FileText, ExternalLink, Shield } from 'lucide-react';

export const ProfileContent: React.FC = () => {
  const { userId, isLoaded } = useAuth();
  const [ensureState, setEnsureState] = useState<'idle' | 'running' | 'finished'>('idle');
  
  // Fetch current user data from Convex
  const currentUser = useQuery(api.users.getCurrentUser);
  
  // Fetch user's submitted prompts
  const submittedPrompts = useQuery(
    api.prompts.getPromptsByAuthor,
    currentUser?.clerkId ? { authorId: currentUser.clerkId } : 'skip'
  );

  const ensureUser = useMutation(api.users.ensureCurrentUser);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) return;
    if (currentUser !== null) return; // either undefined (loading) or actual data we don't want to override
    if (currentUser === undefined) return; // wait for initial query result
    if (ensureState === 'running' || ensureState === 'finished') return;

    setEnsureState('running');
    ensureUser({})
      .then(() => {
        console.info('ensureCurrentUser invoked for', userId);
      })
      .catch((err) => {
        console.error('ensureCurrentUser failed', err);
      })
      .finally(() => setEnsureState('finished'));
  }, [currentUser, ensureState, ensureUser, isLoaded, userId]);

  console.log('ProfileContent debug:', { userId, isLoaded, currentUser, submittedPrompts });

  // Loading state - wait for Clerk and initial user query
  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Skeleton className="h-96 w-full" />
        <p className="text-center text-sm text-muted-foreground">
          Loading profile data... (isLoaded: {isLoaded ? 'true' : 'false'}, userId: {userId || 'none'})
        </p>
      </div>
    );
  }

  // User not found
  if (!currentUser) {
    if (ensureState === 'running') {
      return (
        <Card className="p-8 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Finalizing your profile...</h2>
          <p className="text-muted-foreground">
            We’re syncing your account details. This usually takes just a moment.
          </p>
        </Card>
      );
    }

    return (
      <Card className="p-8 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Profile Setup Required</h2>
        {userId ? (
          <>
            <p className="text-muted-foreground mb-4">
              Your account is being set up. This happens automatically on first sign-in.
            </p>
            <div className="text-muted-foreground mb-4">
              <strong>Setup Steps:</strong>
              <ol className="list-decimal list-inside text-left mt-4 space-y-2">
                <li>Create JWT template named "convex" in Clerk Dashboard</li>
                <li>Configure webhook to sync users to database</li>
                <li>Sign out and sign back in</li>
              </ol>
              <br />
              Once configured, your profile will load automatically.
            </div>
          </>
        ) : (
          <p className="text-muted-foreground mb-4">Please sign in to view your profile.</p>
        )}
        <Button asChild>
          <a href={userId ? '/sign-out' : '/sign-in'}>
            {userId ? 'Sign Out & Retry' : 'Sign In'}
          </a>
        </Button>
      </Card>
    );
  }

  const joinedDate = new Date(currentUser._creationTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* User Information */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {currentUser.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {joinedDate}
                  </span>
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant={currentUser.role === 'admin' ? 'default' : 'secondary'}
                className={currentUser.role === 'admin' ? 'flex items-center gap-1' : ''}
              >
                {currentUser.role === 'admin' && <Shield className="h-3 w-3" />}
                {currentUser.role === 'admin' ? 'Administrator' : 'Member'}
              </Badge>
              {currentUser.role === 'admin' && (
                <a href="/admin" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Manage Prompts
                </a>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="submitted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submitted">
            Submitted Prompts ({submittedPrompts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="stats">
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Submitted Prompts Tab */}
        <TabsContent value="submitted" className="mt-6">
          {submittedPrompts && submittedPrompts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {submittedPrompts.map((prompt) => (
                <div key={prompt._id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className={getStatusColor(prompt.status)}>
                      {prompt.status.charAt(0).toUpperCase() + prompt.status.slice(1)}
                    </Badge>
                  </div>
                  <PromptCard prompt={{
                    id: prompt._id,
                    title: prompt.title,
                    excerpt: prompt.excerpt,
                    category: prompt.category,
                    authorName: prompt.authorName,
                    usageCount: prompt.usageCount,
                    executionCount: prompt.executionCount,
                    tags: prompt.tags
                  }} />
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Submitted Prompts</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  You haven't submitted any prompts yet. Share your expertise with the community!
                </p>
                <Button asChild>
                  <a href="/submit">Submit a Prompt</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Submitted</CardDescription>
                <CardTitle className="text-4xl">{submittedPrompts?.length || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Approved</CardDescription>
                <CardTitle className="text-4xl">
                  {submittedPrompts?.filter((p) => p.status === 'approved').length || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Usage</CardDescription>
                <CardTitle className="text-4xl">
                  {submittedPrompts?.reduce((sum, p) => sum + (p.usageCount || 0), 0) || 0}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
