import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TestComponents() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">shadcn/ui Components Test</h2>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Buttons</h3>
        <div className="flex gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Card</h3>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card component</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here.</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Badges</h3>
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </div>
    </div>
  );
}
