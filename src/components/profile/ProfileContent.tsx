import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PromptCard from '@/components/prompts/PromptCard';
import { Calendar, Mail, User, Clock, FileText, ExternalLink } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  isSubscribed: boolean;
}

interface SubmittedPrompt {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  usageCount: number;
  executionCount: number;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
}

interface ExecutionHistory {
  id: string;
  promptId: string;
  promptTitle: string;
  context: string;
  results: string;
  executedAt: string;
}

interface ProfileContentProps {
  user: UserProfile;
  submittedPrompts: SubmittedPrompt[];
  favoritePrompts: any[];
  executionHistory: ExecutionHistory[];
}

export const ProfileContent: React.FC<ProfileContentProps> = ({
  user,
  submittedPrompts,
  favoritePrompts,
  executionHistory,
}) => {
  const joinedDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
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
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {joinedDate}
                  </span>
                </CardDescription>
              </div>
            </div>
            <Badge variant={user.isSubscribed ? 'default' : 'secondary'}>
              {user.isSubscribed ? 'Premium Member' : 'Free Account'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="submitted" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submitted">
            Submitted Prompts ({submittedPrompts.length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({favoritePrompts.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Execution History ({executionHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* Submitted Prompts Tab */}
        <TabsContent value="submitted" className="mt-6">
          {submittedPrompts.length > 0 ? (
            <div className="space-y-4">
              {submittedPrompts.map((prompt) => (
                <div key={prompt.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className={getStatusColor(prompt.status)}>
                      {prompt.status.charAt(0).toUpperCase() + prompt.status.slice(1)}
                    </Badge>
                  </div>
                  <PromptCard prompt={prompt} />
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

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="mt-6">
          {favoritePrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoritePrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} isFavorite={true} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Favorite Prompts</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  Save your favorite prompts for quick access later.
                </p>
                <Button asChild>
                  <a href="/directory">Browse Prompts</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Execution History Tab */}
        <TabsContent value="history" className="mt-6">
          {executionHistory.length > 0 ? (
            <div className="space-y-4">
              {executionHistory.map((execution) => (
                <Card key={execution.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {execution.promptTitle}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(execution.executedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/directory/${execution.promptId}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Prompt
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {execution.context && (
                      <div>
                        <p className="text-sm font-medium mb-1">Context:</p>
                        <p className="text-sm text-muted-foreground italic">
                          "{execution.context}"
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium mb-1">Results:</p>
                      <div className="rounded-lg border bg-muted/50 p-3 max-h-48 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap font-mono">
                          {execution.results}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Execution History</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  Your prompt execution history will appear here.
                </p>
                <Button asChild>
                  <a href="/directory">Browse Prompts</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
