"use client";

/**
 * Component Showcase Page
 *
 * Displays all reusable UI components with examples and usage guidelines.
 * Admin-only page for developers and designers.
 */

import { useState } from "react";
import { Button, Input, Select, Card, Badge, Spinner, Alert, Toast } from "@/src/components/ui";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { PageTitle } from "@/src/components/dashboard/PageTitle";

export default function ComponentsPage() {
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("success");

  useSetPageHeader({
    title: "Component Library",
    pathLabels: { components: "Components" },
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <PageTitle
        title="Component Library"
        description="Reusable UI components following the EarthEnable design system"
      />

      <div className="space-y-12">
        {/* Button Component */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Button</h2>
          <Card padding="lg" divided>
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* States */}
              <div>
                <h3 className="text-lg font-semibold mb-3">States</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>

              {/* With Icons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">With Icons</h3>
                <div className="flex flex-wrap gap-3">
                  <Button leftIcon={<span>📝</span>}>Edit</Button>
                  <Button rightIcon={<span>→</span>}>Next</Button>
                </div>
              </div>

              {/* Code Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Usage</h3>
                <pre className="bg-background-light p-4 rounded-md text-sm overflow-x-auto">
                  {`import { Button } from '@/src/components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="outline" loading>
  Loading...
</Button>`}
                </pre>
              </div>
            </div>
          </Card>
        </section>

        {/* Input Component */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Input</h2>
          <Card padding="lg" divided>
            <div className="space-y-6">
              {/* Basic */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic</h3>
                <div className="max-w-md space-y-3">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Input label="Password" type="password" placeholder="Enter password" />
                  <Input label="Required Field" placeholder="This field is required" required />
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                <div className="max-w-md space-y-3">
                  <Input size="sm" placeholder="Small input" />
                  <Input size="md" placeholder="Medium input" />
                  <Input size="lg" placeholder="Large input" />
                </div>
              </div>

              {/* With Icons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">With Icons</h3>
                <div className="max-w-md space-y-3">
                  <Input leftIcon={<span>🔍</span>} placeholder="Search..." />
                  <Input rightIcon={<span>📧</span>} placeholder="Email address" />
                </div>
              </div>

              {/* States */}
              <div>
                <h3 className="text-lg font-semibold mb-3">States</h3>
                <div className="max-w-md space-y-3">
                  <Input placeholder="Default" />
                  <Input placeholder="With helper text" helperText="This is a helpful message" />
                  <Input placeholder="With error" error="This field is required" />
                  <Input placeholder="Disabled" disabled />
                </div>
              </div>

              {/* Code Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Usage</h3>
                <pre className="bg-background-light p-4 rounded-md text-sm overflow-x-auto">
                  {`import { Input } from '@/src/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>

<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search users..."
/>`}
                </pre>
              </div>
            </div>
          </Card>
        </section>

        {/* Select Component */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Select</h2>
          <Card padding="lg" divided>
            <div className="space-y-6">
              {/* Basic */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic</h3>
                <div className="max-w-md">
                  <Select value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
                    <option value="">Select an option</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                  </Select>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                <div className="max-w-md space-y-3">
                  <Select size="sm">
                    <option>Small select</option>
                    <option>Option 2</option>
                  </Select>
                  <Select size="default">
                    <option>Medium select</option>
                    <option>Option 2</option>
                  </Select>
                  <Select size="lg">
                    <option>Large select</option>
                    <option>Option 2</option>
                  </Select>
                </div>
              </div>

              {/* States */}
              <div>
                <h3 className="text-lg font-semibold mb-3">States</h3>
                <div className="max-w-md space-y-3">
                  <Select>
                    <option>Default</option>
                  </Select>
                  <Select error>
                    <option>With error</option>
                  </Select>
                  <Select disabled>
                    <option>Disabled</option>
                  </Select>
                </div>
              </div>

              {/* Code Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Usage</h3>
                <pre className="bg-background-light p-4 rounded-md text-sm overflow-x-auto">
                  {`import { Select } from '@/src/components/ui';

<Select
  value={role}
  onChange={(e) => setRole(e.target.value)}
  error={errors.role}
>
  <option value="">Select role</option>
  <option value="admin">Admin</option>
  <option value="manager">Manager</option>
  <option value="qa_agent">QA Agent</option>
</Select>`}
                </pre>
              </div>
            </div>
          </Card>
        </section>

        {/* Card Component */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Card</h2>
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Variants</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="default" padding="md">
                  <h4 className="font-semibold mb-2">Default Card</h4>
                  <p className="text-sm text-text-secondary">Standard card with light border</p>
                </Card>
                <Card variant="bordered" padding="md">
                  <h4 className="font-semibold mb-2">Bordered Card</h4>
                  <p className="text-sm text-text-secondary">Card with thicker border</p>
                </Card>
                <Card variant="elevated" padding="md">
                  <h4 className="font-semibold mb-2">Elevated Card</h4>
                  <p className="text-sm text-text-secondary">Card with shadow effect</p>
                </Card>
              </div>
            </div>

            {/* With Header and Footer */}
            <div>
              <h3 className="text-lg font-semibold mb-3">With Header and Footer</h3>
              <Card
                variant="default"
                padding="md"
                header="Card Header"
                footer="Card Footer"
                divided
              >
                <p className="text-text-secondary">
                  This card has a header and footer with dividers.
                </p>
              </Card>
            </div>

            {/* Padding Options */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Padding Sizes</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card padding="none" variant="bordered">
                  <div className="p-2 bg-background-light text-xs">No padding</div>
                </Card>
                <Card padding="sm" variant="bordered">
                  <div className="text-xs">Small padding</div>
                </Card>
                <Card padding="md" variant="bordered">
                  <div className="text-xs">Medium padding</div>
                </Card>
                <Card padding="lg" variant="bordered">
                  <div className="text-xs">Large padding</div>
                </Card>
              </div>
            </div>

            {/* Code Example */}
            <Card padding="lg" variant="bordered">
              <h3 className="text-lg font-semibold mb-3">Usage</h3>
              <pre className="bg-background-light p-4 rounded-md text-sm overflow-x-auto">
                {`import { Card } from '@/src/components/ui';

<Card variant="elevated" padding="md">
  <h2>Content Title</h2>
  <p>Card content goes here</p>
</Card>

<Card
  header="User Details"
  footer="Last updated: 2 hours ago"
  divided
  padding="lg"
>
  <p>Card body content</p>
</Card>`}
              </pre>
            </Card>
          </div>
        </section>

        {/* Badge Component */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Badge</h2>
          <Card padding="lg" divided>
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                </div>
              </div>

              {/* Outline */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Outline Style</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="success" outline>
                    Success
                  </Badge>
                  <Badge variant="error" outline>
                    Error
                  </Badge>
                  <Badge variant="warning" outline>
                    Warning
                  </Badge>
                  <Badge variant="primary" outline>
                    Primary
                  </Badge>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge size="sm" variant="primary">
                    Small
                  </Badge>
                  <Badge size="md" variant="primary">
                    Medium
                  </Badge>
                  <Badge size="lg" variant="primary">
                    Large
                  </Badge>
                </div>
              </div>

              {/* With Dot */}
              <div>
                <h3 className="text-lg font-semibold mb-3">With Dot Indicator</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="success" dot>
                    Active
                  </Badge>
                  <Badge variant="error" dot>
                    Error
                  </Badge>
                  <Badge variant="warning" dot>
                    Pending
                  </Badge>
                </div>
              </div>

              {/* Rounded vs Square */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Shape</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="primary" rounded>
                    Rounded
                  </Badge>
                  <Badge variant="primary" rounded={false}>
                    Square
                  </Badge>
                </div>
              </div>

              {/* Code Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Usage</h3>
                <pre className="bg-background-light p-4 rounded-md text-sm overflow-x-auto">
                  {`import { Badge } from '@/src/components/ui';

<Badge variant="success">Active</Badge>
<Badge variant="error" outline>Failed</Badge>
<Badge variant="warning" dot>Pending</Badge>

// In a table
<Badge variant={user.isActive ? 'success' : 'error'}>
  {user.isActive ? 'Active' : 'Inactive'}
</Badge>`}
                </pre>
              </div>
            </div>
          </Card>
        </section>

        {/* Spinner Component */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Spinner</h2>
          <Card padding="lg" divided>
            <div className="space-y-6">
              {/* Sizes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-6">
                  <Spinner size="xs" />
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <Spinner size="xl" />
                </div>
              </div>

              {/* Variants */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Color Variants</h3>
                <div className="flex flex-wrap items-center gap-6">
                  <Spinner variant="primary" />
                  <Spinner variant="secondary" />
                  <div className="bg-primary p-3 rounded">
                    <Spinner variant="white" />
                  </div>
                </div>
              </div>

              {/* Centered */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Centered</h3>
                <div className="border border-border-light rounded p-8">
                  <Spinner centered />
                </div>
              </div>

              {/* Code Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Usage</h3>
                <pre className="bg-background-light p-4 rounded-md text-sm overflow-x-auto">
                  {`import { Spinner } from '@/src/components/ui';

// Inline
<Spinner size="sm" variant="primary" />

// Centered in container
<Spinner centered label="Loading users..." />

// In a button (use Button's loading prop instead)
<Button loading>Loading</Button>`}
                </pre>
              </div>
            </div>
          </Card>
        </section>

        {/* Alert Component */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Alert</h2>
          <Card padding="lg" divided>
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Variants</h3>
                <div className="space-y-3">
                  <Alert variant="info" title="Information">
                    This is an informational alert. Use it to provide helpful context to users.
                  </Alert>
                  <Alert variant="success" title="Success">
                    Your changes have been saved successfully.
                  </Alert>
                  <Alert variant="warning" title="Warning">
                    Please review your information before proceeding.
                  </Alert>
                  <Alert variant="error" title="Error">
                    An error occurred while processing your request.
                  </Alert>
                </div>
              </div>

              {/* Without Icon */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Without Icon</h3>
                <Alert variant="info" showIcon={false}>
                  This alert doesn&apos;t display an icon.
                </Alert>
              </div>

              {/* Without Title */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Without Title</h3>
                <Alert variant="success">This alert only shows the message without a title.</Alert>
              </div>

              {/* Dismissible */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Dismissible</h3>
                <Alert
                  variant="warning"
                  title="Dismissible Alert"
                  dismissible
                  onDismiss={() => console.log("Alert dismissed")}
                >
                  Click the X button to dismiss this alert.
                </Alert>
              </div>

              {/* Code Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Usage</h3>
                <pre className="bg-background-light p-4 rounded-md text-sm overflow-x-auto">
                  {`import { Alert } from '@/src/components/ui';

<Alert variant="success" title="Success">
  Your changes have been saved successfully.
</Alert>

<Alert variant="error" title="Error" dismissible onDismiss={handleDismiss}>
  An error occurred while processing your request.
</Alert>

<Alert variant="info" showIcon={false}>
  Simple message without icon
</Alert>`}
                </pre>
              </div>
            </div>
          </Card>
        </section>

        {/* Toast Component */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Toast</h2>
          <Card padding="lg" divided>
            <div className="space-y-6">
              {/* Interactive Demo */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Interactive Demo</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Click the buttons below to show different toast notifications.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setToastType("success");
                      setShowToast(true);
                    }}
                  >
                    Show Success
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setToastType("error");
                      setShowToast(true);
                    }}
                  >
                    Show Error
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setToastType("warning");
                      setShowToast(true);
                    }}
                  >
                    Show Warning
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setToastType("info");
                      setShowToast(true);
                    }}
                  >
                    Show Info
                  </Button>
                </div>
              </div>

              {/* Code Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Usage</h3>
                <pre className="bg-background-light p-4 rounded-md text-sm overflow-x-auto">
                  {`import { Toast } from '@/src/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      <button onClick={() => setShowToast(true)}>
        Show Toast
      </button>

      <Toast
        visible={showToast}
        type="success"
        message="Your changes have been saved!"
        duration={4000}
        position="top"
        onDismiss={() => setShowToast(false)}
      />
    </>
  );
}`}
                </pre>
              </div>
            </div>
          </Card>
        </section>

        {/* Design Tokens */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Design Tokens</h2>
          <Card padding="lg" divided>
            <div className="space-y-6">
              <p className="text-text-secondary">
                All components use centralized theme constants from{" "}
                <code className="bg-background-light px-2 py-1 rounded text-sm">
                  src/lib/theme/constants.ts
                </code>
              </p>

              <div>
                <h3 className="text-lg font-semibold mb-3">Brand Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="h-16 rounded bg-primary mb-2"></div>
                    <p className="text-sm font-mono">#EA6A00</p>
                    <p className="text-xs text-text-secondary">Primary Orange</p>
                  </div>
                  <div>
                    <div className="h-16 rounded bg-secondary mb-2"></div>
                    <p className="text-sm font-mono">#78373B</p>
                    <p className="text-xs text-text-secondary">Secondary</p>
                  </div>
                  <div>
                    <div className="h-16 rounded bg-accent mb-2"></div>
                    <p className="text-sm font-mono">#D5A34C</p>
                    <p className="text-xs text-text-secondary">Accent Gold</p>
                  </div>
                  <div>
                    <div className="h-16 rounded bg-background-primary mb-2 border border-border-light"></div>
                    <p className="text-sm font-mono">#F7EDDB</p>
                    <p className="text-xs text-text-secondary">Background Cream</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Status Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="h-16 rounded bg-status-success mb-2"></div>
                    <p className="text-sm font-mono">#124D37</p>
                    <p className="text-xs text-text-secondary">Success Green</p>
                  </div>
                  <div>
                    <div className="h-16 rounded bg-status-error mb-2"></div>
                    <p className="text-sm font-mono">#E04562</p>
                    <p className="text-xs text-text-secondary">Error Red</p>
                  </div>
                  <div>
                    <div className="h-16 rounded bg-status-warning mb-2"></div>
                    <p className="text-sm font-mono">#D5A34C</p>
                    <p className="text-xs text-text-secondary">Warning Yellow</p>
                  </div>
                  <div>
                    <div className="h-16 rounded bg-status-info mb-2"></div>
                    <p className="text-sm font-mono">#3E57AB</p>
                    <p className="text-xs text-text-secondary">Info Blue</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Text Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="h-16 rounded bg-text-primary mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">Aa</span>
                    </div>
                    <p className="text-sm font-mono">#000000</p>
                    <p className="text-xs text-text-secondary">Primary (Black)</p>
                  </div>
                  <div>
                    <div className="h-16 rounded bg-text-secondary mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">Aa</span>
                    </div>
                    <p className="text-sm font-mono">#78373B</p>
                    <p className="text-xs text-text-secondary">Secondary (Brand)</p>
                  </div>
                  <div>
                    <div className="h-16 rounded bg-text-tertiary mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">Aa</span>
                    </div>
                    <p className="text-sm font-mono">#6B7280</p>
                    <p className="text-xs text-text-secondary">Tertiary (Gray)</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Typography</h3>
                <div className="space-y-2">
                  <p className="font-heading text-2xl">Ropa Sans - Headings</p>
                  <p className="font-flourish text-2xl">Literata - Flourish</p>
                  <p className="font-body text-base">Lato - Body Text</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Component Sizes</h3>
                <table className="w-full text-sm">
                  <thead className="bg-background-light">
                    <tr>
                      <th className="text-left p-2">Size</th>
                      <th className="text-left p-2">Height</th>
                      <th className="text-left p-2">Use Case</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border-light">
                      <td className="p-2">sm</td>
                      <td className="p-2">36px (2.25rem)</td>
                      <td className="p-2">Compact layouts, inline actions</td>
                    </tr>
                    <tr className="border-t border-border-light">
                      <td className="p-2">md</td>
                      <td className="p-2">44px (2.75rem)</td>
                      <td className="p-2">Default, good tap target</td>
                    </tr>
                    <tr className="border-t border-border-light">
                      <td className="p-2">lg</td>
                      <td className="p-2">52px (3.25rem)</td>
                      <td className="p-2">Prominent CTAs, hero sections</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Toast Demo */}
      <Toast
        visible={showToast}
        type={toastType}
        message={`This is a ${toastType} toast notification! It will auto-dismiss in 4 seconds.`}
        duration={4000}
        position="top"
        onDismiss={() => setShowToast(false)}
      />
    </div>
  );
}
