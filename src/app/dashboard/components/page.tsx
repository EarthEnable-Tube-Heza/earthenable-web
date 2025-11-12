"use client";

/**
 * Component Showcase Page
 *
 * Interactive demonstration of all UI components in the EarthEnable design system.
 * Admin-only page for reference and testing.
 */

import { useState } from "react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  Badge,
  Spinner,
  Alert,
  Toast,
} from "@/src/components/ui";

export default function ComponentsPage() {
  // State for interactive examples
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const handleButtonClick = () => {
    alert("Button clicked!");
  };

  const handleToast = (type: "success" | "error" | "info") => {
    setToastType(type);
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-heading text-text-primary mb-4">Component Library</h1>
          <p className="text-lg text-text-secondary">
            Interactive showcase of all UI components following the EarthEnable design system. All
            components match the mobile app&apos;s styling for visual consistency.
          </p>
        </div>

        {/* Button Section */}
        <Section
          title="Button"
          description="Primary interaction component with multiple variants and states."
        >
          <div className="space-y-6">
            {/* Variants */}
            <Example title="Variants">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={handleButtonClick}>
                  Primary
                </Button>
                <Button variant="secondary" onClick={handleButtonClick}>
                  Secondary
                </Button>
                <Button variant="outline" onClick={handleButtonClick}>
                  Outline
                </Button>
                <Button variant="ghost" onClick={handleButtonClick}>
                  Ghost
                </Button>
                <Button variant="danger" onClick={handleButtonClick}>
                  Danger
                </Button>
              </div>
              <CodeBlock>
                {`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>`}
              </CodeBlock>
            </Example>

            {/* Sizes */}
            <Example title="Sizes">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
              <CodeBlock>
                {`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}
              </CodeBlock>
            </Example>

            {/* States */}
            <Example title="States">
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button fullWidth>Full Width</Button>
              </div>
              <CodeBlock>
                {`<Button loading>Loading</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>`}
              </CodeBlock>
            </Example>
          </div>
        </Section>

        {/* Input Section */}
        <Section
          title="Input"
          description="Text input component with labels, errors, and icon support."
        >
          <div className="space-y-6">
            {/* Basic Input */}
            <Example title="Basic Input">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <CodeBlock>
                {`<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>`}
              </CodeBlock>
            </Example>

            {/* Input with Error */}
            <Example title="With Error">
              <Input
                label="Email"
                type="email"
                error="Invalid email address"
                placeholder="Enter your email"
              />
              <CodeBlock>
                {`<Input
  label="Email"
  type="email"
  error="Invalid email address"
  placeholder="Enter your email"
/>`}
              </CodeBlock>
            </Example>

            {/* Password Input */}
            <Example title="Password Input">
              <Input label="Password" type="password" placeholder="Enter your password" required />
              <CodeBlock>
                {`<Input
  label="Password"
  type="password"
  placeholder="Enter your password"
  required
/>`}
              </CodeBlock>
            </Example>

            {/* Sizes */}
            <Example title="Sizes">
              <div className="space-y-3">
                <Input size="sm" placeholder="Small" />
                <Input size="md" placeholder="Medium" />
                <Input size="lg" placeholder="Large" />
              </div>
              <CodeBlock>
                {`<Input size="sm" placeholder="Small" />
<Input size="md" placeholder="Medium" />
<Input size="lg" placeholder="Large" />`}
              </CodeBlock>
            </Example>
          </div>
        </Section>

        {/* Textarea Section */}
        <Section title="Textarea" description="Multi-line text input with consistent styling.">
          <div className="space-y-6">
            {/* Basic Textarea */}
            <Example title="Basic Textarea">
              <Textarea
                label="Description"
                placeholder="Enter a description"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                minRows={4}
              />
              <CodeBlock>
                {`<Textarea
  label="Description"
  placeholder="Enter a description"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  minRows={4}
/>`}
              </CodeBlock>
            </Example>

            {/* With Error */}
            <Example title="With Error">
              <Textarea
                label="Comments"
                error="This field is required"
                placeholder="Enter your comments"
                required
              />
              <CodeBlock>
                {`<Textarea
  label="Comments"
  error="This field is required"
  placeholder="Enter your comments"
  required
/>`}
              </CodeBlock>
            </Example>
          </div>
        </Section>

        {/* Select Section */}
        <Section title="Select" description="Dropdown selection with consistent styling.">
          <div className="space-y-6">
            {/* Basic Select */}
            <Example title="Basic Select">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Country</label>
                <Select value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
                  <option value="">Select a country</option>
                  <option value="RW">Rwanda</option>
                  <option value="KE">Kenya</option>
                  <option value="ZM">Zambia</option>
                  <option value="IN">India</option>
                </Select>
              </div>
              <CodeBlock>
                {`<Select
  label="Country"
  value={value}
  onChange={(e) => setValue(e.target.value)}
>
  <option value="">Select a country</option>
  <option value="RW">Rwanda</option>
  <option value="KE">Kenya</option>
</Select>`}
              </CodeBlock>
            </Example>
          </div>
        </Section>

        {/* Card Section */}
        <Section title="Card" description="Container component with multiple variants.">
          <div className="space-y-6">
            {/* Variants */}
            <Example title="Variants">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="default" padding="md">
                  <h3 className="font-semibold mb-2">Default Card</h3>
                  <p className="text-text-secondary text-sm">Basic card with no border</p>
                </Card>
                <Card variant="bordered" padding="md">
                  <h3 className="font-semibold mb-2">Bordered Card</h3>
                  <p className="text-text-secondary text-sm">Card with border</p>
                </Card>
                <Card variant="elevated" padding="md">
                  <h3 className="font-semibold mb-2">Elevated Card</h3>
                  <p className="text-text-secondary text-sm">Card with shadow</p>
                </Card>
              </div>
              <CodeBlock>
                {`<Card variant="default" padding="md">Content</Card>
<Card variant="bordered" padding="md">Content</Card>
<Card variant="elevated" padding="md">Content</Card>`}
              </CodeBlock>
            </Example>

            {/* With Header */}
            <Example title="With Header">
              <Card variant="bordered" padding="md" header="User Profile" divided>
                <p className="text-text-secondary">Card content goes here</p>
              </Card>
              <CodeBlock>
                {`<Card
  variant="bordered"
  padding="md"
  header="User Profile"
  divided
>
  <p>Card content goes here</p>
</Card>`}
              </CodeBlock>
            </Example>
          </div>
        </Section>

        {/* Badge Section */}
        <Section title="Badge" description="Status indicators and labels with multiple variants.">
          <div className="space-y-6">
            {/* Variants */}
            <Example title="Variants">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
              </div>
              <CodeBlock>
                {`<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="error">Error</Badge>`}
              </CodeBlock>
            </Example>

            {/* Sizes */}
            <Example title="Sizes">
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
              <CodeBlock>
                {`<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>`}
              </CodeBlock>
            </Example>

            {/* With Dot */}
            <Example title="With Dot">
              <div className="flex flex-wrap gap-2">
                <Badge variant="success" dot>
                  Active
                </Badge>
                <Badge variant="error" dot>
                  Failed
                </Badge>
                <Badge variant="warning" dot outline>
                  Pending
                </Badge>
              </div>
              <CodeBlock>
                {`<Badge variant="success" dot>Active</Badge>
<Badge variant="error" dot>Failed</Badge>
<Badge variant="warning" dot outline>Pending</Badge>`}
              </CodeBlock>
            </Example>
          </div>
        </Section>

        {/* Spinner Section */}
        <Section title="Spinner" description="Loading indicators with configurable size and color.">
          <div className="space-y-6">
            {/* Sizes */}
            <Example title="Sizes">
              <div className="flex flex-wrap items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
              </div>
              <CodeBlock>
                {`<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
<Spinner size="xl" />`}
              </CodeBlock>
            </Example>

            {/* Variants */}
            <Example title="Variants">
              <div className="flex flex-wrap items-center gap-4">
                <Spinner variant="primary" />
                <Spinner variant="secondary" />
                <div className="bg-primary p-3 rounded">
                  <Spinner variant="white" />
                </div>
              </div>
              <CodeBlock>
                {`<Spinner variant="primary" />
<Spinner variant="secondary" />
<Spinner variant="white" />`}
              </CodeBlock>
            </Example>

            {/* With Label */}
            <Example title="With Label">
              <Spinner label="Loading data..." centered />
              <CodeBlock>{`<Spinner label="Loading data..." centered />`}</CodeBlock>
            </Example>
          </div>
        </Section>

        {/* Alert Section */}
        <Section
          title="Alert"
          description="Feedback messages for success, error, warning, and info."
        >
          <div className="space-y-4">
            <Alert variant="success">Operation completed successfully!</Alert>
            <Alert variant="error">An error occurred. Please try again.</Alert>
            <Alert variant="warning">This action cannot be undone. Proceed with caution.</Alert>
            <Alert variant="info">New features are available. Check them out!</Alert>
            <Alert variant="success" dismissible onDismiss={() => {}}>
              Dismissible alert
            </Alert>
          </div>
          <CodeBlock>
            {`<Alert variant="success">Operation completed successfully!</Alert>
<Alert variant="error">An error occurred. Please try again.</Alert>
<Alert variant="warning">This action cannot be undone.</Alert>
<Alert variant="info">New features are available.</Alert>
<Alert variant="success" dismissible onDismiss={() => {}}>
  Dismissible alert
</Alert>`}
          </CodeBlock>
        </Section>

        {/* Toast Section */}
        <Section title="Toast" description="Temporary notifications that auto-dismiss.">
          <div className="space-y-6">
            <Example title="Try Toast">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handleToast("success")}>Show Success</Button>
                <Button onClick={() => handleToast("error")} variant="danger">
                  Show Error
                </Button>
                <Button onClick={() => handleToast("info")} variant="secondary">
                  Show Info
                </Button>
              </div>
              <CodeBlock>
                {`<Toast
  visible={showToast}
  type="success"
  message="Operation successful!"
  duration={3000}
  onDismiss={() => setShowToast(false)}
/>`}
              </CodeBlock>
            </Example>
          </div>

          {/* Toast Component */}
          <Toast
            visible={showToast}
            type={toastType}
            message={`This is a ${toastType} toast notification!`}
            duration={3000}
            onDismiss={() => setShowToast(false)}
            position="top"
          />
        </Section>

        {/* Footer */}
        <div className="mt-16 p-6 bg-white rounded-lg border border-border-light">
          <h3 className="font-semibold text-text-primary mb-2">Usage</h3>
          <p className="text-text-secondary mb-4">Import components from the central export:</p>
          <CodeBlock>
            {`import { Button, Input, Card, Badge } from '@/src/components/ui';`}
          </CodeBlock>
          <p className="text-text-secondary mt-4">
            All components use theme constants from{" "}
            <code className="bg-background-light px-2 py-1 rounded text-sm">
              src/lib/theme/constants.ts
            </code>{" "}
            for consistent styling.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="mb-6">
        <h2 className="text-3xl font-heading text-text-primary mb-2">{title}</h2>
        <p className="text-text-secondary">{description}</p>
      </div>
      <div className="bg-white rounded-lg border border-border-light p-6">{children}</div>
    </section>
  );
}

function Example({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-semibold text-text-primary mb-3">{title}</h4>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-3">
      <pre className="bg-background-light p-4 rounded-md overflow-x-auto text-sm text-text-primary border border-border-light">
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-3 py-1 bg-white border border-border-light rounded text-sm hover:bg-background-light transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
