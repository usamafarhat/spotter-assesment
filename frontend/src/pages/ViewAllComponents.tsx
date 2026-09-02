import type { ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
} from "../components/ui";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function ViewAllComponents() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Badge variant="primary">UI Kit</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Component Library
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Base UI primitives for the ELD Trip Planner app.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <Section title="Buttons" description="Primary actions and interactions.">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        <Section title="Badges" description="Status labels and tags.">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Section>

        <Section title="Inputs" description="Form fields and labels.">
          <div className="grid max-w-md gap-4">
            <div className="grid gap-2">
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" placeholder="e.g. Chicago, IL" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" placeholder="e.g. Dallas, TX" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="disabled">Disabled</Label>
              <Input id="disabled" placeholder="Unavailable" disabled />
            </div>
          </div>
        </Section>

        <Section title="Cards" description="Content containers.">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Trip Summary</CardTitle>
              <CardDescription>Chicago, IL → Dallas, TX</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Estimated drive time with HOS-compliant rest breaks.
              </p>
            </CardContent>
          </Card>
        </Section>

        <Section title="Alerts" description="Feedback and notifications.">
          <div className="grid max-w-lg gap-3">
            <Alert>
              <AlertTitle>Default</AlertTitle>
              <AlertDescription>
                Plan your route and generate ELD log sheets.
              </AlertDescription>
            </Alert>
            <Alert variant="info">
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>
                HOS rules are applied based on FMCSA guidelines.
              </AlertDescription>
            </Alert>
            <Alert variant="success">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Trip plan generated successfully.</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Approaching 70-hour cycle limit.
              </AlertDescription>
            </Alert>
            <Alert variant="error">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Could not reach the routing service.
              </AlertDescription>
            </Alert>
          </div>
        </Section>

        <Section title="Separator" description="Visual dividers.">
          <p className="text-sm text-muted-foreground">Content above</p>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">Content below</p>
        </Section>
      </main>
    </div>
  );
}
