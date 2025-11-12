import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card Component', () => {
  it('renders with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender, container } = render(<Card variant="default">Default</Card>);
    expect(container.firstChild).toHaveClass('bg-white');
    expect(container.firstChild).toHaveClass('border-border-light');

    rerender(<Card variant="bordered">Bordered</Card>);
    expect(container.firstChild).toHaveClass('border-2');
    expect(container.firstChild).toHaveClass('border-border-medium');

    rerender(<Card variant="elevated">Elevated</Card>);
    expect(container.firstChild).toHaveClass('shadow-md');
  });

  it('renders with different padding sizes', () => {
    const { rerender, container } = render(<Card padding="sm">Small</Card>);
    expect(container.firstChild).toHaveClass('p-3');

    rerender(<Card padding="md">Medium</Card>);
    expect(container.firstChild).toHaveClass('p-6');

    rerender(<Card padding="lg">Large</Card>);
    expect(container.firstChild).toHaveClass('p-8');
  });

  it('renders with header', () => {
    render(<Card header="Card Title">Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders with footer', () => {
    render(<Card footer="Card Footer">Content</Card>);
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });

  it('renders with divided sections', () => {
    const { container } = render(
      <Card header="Title" footer="Footer" divided>
        Content
      </Card>
    );
    const dividers = container.querySelectorAll('.border-t');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-card');
  });

  it('forwards ref to div element', () => {
    const ref = jest.fn();
    render(<Card ref={ref}>Content</Card>);
    expect(ref).toHaveBeenCalled();
  });
});
