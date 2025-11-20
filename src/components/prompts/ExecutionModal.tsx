import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Loader2, Sparkles } from 'lucide-react';

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptTitle: string;
  promptContent: string;
}

export const ExecutionModal: React.FC<ExecutionModalProps> = ({
  isOpen,
  onClose,
  promptTitle,
  promptContent,
}) => {
  const [context, setContext] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    setIsExecuting(true);
    setResults(null);

    // Simulate AI execution with a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock results based on the prompt
    const mockResults = generateMockResults(promptTitle, context);
    setResults(mockResults);
    setIsExecuting(false);
  };

  const handleCopyResults = async () => {
    if (results) {
      await navigator.clipboard.writeText(results);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setContext('');
    setResults(null);
    setIsExecuting(false);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Run Prompt: {promptTitle}
          </DialogTitle>
          <DialogDescription>
            Provide any additional context or variables needed for this prompt execution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Context Input */}
          <div className="space-y-2">
            <label htmlFor="context" className="text-sm font-medium">
              Additional Context (Optional)
            </label>
            <Input
              id="context"
              placeholder="e.g., Sunday service theme, Bible passage, event details..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={isExecuting || results !== null}
            />
          </div>

          {/* Loading State */}
          {isExecuting && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Executing prompt with AI...
                </p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {results && !isExecuting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Results</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyResults}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied!' : 'Copy Results'}
                </Button>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {results}
                </pre>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!results ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isExecuting}>
                Cancel
              </Button>
              <Button onClick={handleRun} disabled={isExecuting}>
                {isExecuting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Running...
                  </>
                ) : (
                  'Run Prompt'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to generate mock results
function generateMockResults(promptTitle: string, context: string): string {
  const contextNote = context
    ? `\n[Context provided: "${context}"]\n`
    : '\n[No additional context provided]\n';

  const mockResponses = {
    sermon: `${contextNote}
SERMON OUTLINE - "${promptTitle}"

I. INTRODUCTION
   - Opening illustration: Consider the example of a lighthouse guiding ships safely to shore
   - Hook: "Have you ever felt lost in the storms of life?"
   - Thesis: God's Word serves as our lighthouse in turbulent times

II. MAIN POINT 1: The Foundation of Faith
   - Scripture: Hebrews 11:1
   - Explanation: Faith is the substance of things hoped for
   - Application: Trust God even when you cannot see the outcome
   - Illustration: Story of Abraham's journey

III. MAIN POINT 2: Walking in Obedience
   - Scripture: James 2:17
   - Explanation: Faith without works is dead
   - Application: Put your faith into action this week
   - Illustration: Modern-day example of sacrificial service

IV. MAIN POINT 3: Growing in Grace
   - Scripture: 2 Peter 3:18
   - Explanation: We are called to continual growth
   - Application: Commit to daily scripture reading and prayer
   - Illustration: The process of a seed becoming a tree

V. CONCLUSION
   - Recap the three main points
   - Call to action: Choose one area to grow in this week
   - Closing prayer`,

    email: `${contextNote}
Subject: Thinking of You During This Time

Dear [Name],

I hope this message finds you with peace in your heart, even during this challenging season. I've been keeping you in my prayers and wanted to reach out personally.

I can only imagine how difficult [situation] must be for you right now. Please know that you are not alone—our church family is here to support you, and more importantly, God is with you every step of the way.

I'm reminded of Psalm 34:18: "The Lord is close to the brokenhearted and saves those who are crushed in spirit." Even in our deepest valleys, His presence remains constant.

If you'd like to talk, grab coffee, or simply have someone to sit with you, please don't hesitate to reach out. I'm available [specific times] this week, or we can find another time that works for you.

You're also welcome to connect with our pastoral care team at [contact info] for additional resources and support.

Holding you in prayer,
[Your name]`,

    default: `${contextNote}
GENERATED RESPONSE FOR: "${promptTitle}"

Thank you for using this prompt! Here's a thoughtfully crafted response based on your request:

SECTION 1: Introduction
This section provides context and sets the tone for the content that follows. The approach is designed to be both practical and spiritually grounded.

SECTION 2: Main Content
• Key Point 1: Foundation and biblical grounding
• Key Point 2: Practical application for ministry
• Key Point 3: Action steps and next measures

SECTION 3: Practical Application
Here's how you can implement this in your ministry context:
1. Review and adapt the content to your specific situation
2. Pray over the material and seek God's guidance
3. Share with relevant team members for feedback
4. Implement with intentionality and care

CONCLUSION
Remember that every ministry context is unique. Use this as a starting point and customize it to serve your congregation's specific needs.

God bless your ministry!`,
  };

  // Determine which mock response to use based on prompt title
  if (promptTitle.toLowerCase().includes('sermon')) {
    return mockResponses.sermon;
  } else if (promptTitle.toLowerCase().includes('email') || promptTitle.toLowerCase().includes('pastoral')) {
    return mockResponses.email;
  } else {
    return mockResponses.default;
  }
}
