import { render, screen } from '@testing-library/react';
import { Spinner } from '../Spinner';

describe('Spinner Component', () => {
  it('renders spinner', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
  });

  it('renders with different sizes', () => {
    const { rerender, container } = render(<Spinner size="sm" />);
    expect(container.querySelector('svg')).toHaveClass('w-4');

    rerender(<Spinner size="md" />);
    expect(container.querySelector('svg')).toHaveClass('w-5');

    rerender(<Spinner size="lg" />);
    expect(container.querySelector('svg')).toHaveClass('w-6');

    rerender(<Spinner size="xl" />);
    expect(container.querySelector('svg')).toHaveClass('w-8');
  });

  it('renders with different variants', () => {
    const { rerender, container } = render(<Spinner variant="primary" />);
    expect(container.querySelector('svg')).toHaveClass('text-primary');

    rerender(<Spinner variant="secondary" />);
    expect(container.querySelector('svg')).toHaveClass('text-secondary');

    rerender(<Spinner variant="white" />);
    expect(container.querySelector('svg')).toHaveClass('text-white');
  });

  it('renders with label', () => {
    render(<Spinner label="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders centered', () => {
    const { container } = render(<Spinner centered />);
    const wrapper = container.querySelector('div[role="status"]');
    expect(wrapper).toHaveClass('w-full');
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="custom-spinner" />);
    const wrapper = container.querySelector('div[role="status"]');
    expect(wrapper).toHaveClass('custom-spinner');
  });
});
