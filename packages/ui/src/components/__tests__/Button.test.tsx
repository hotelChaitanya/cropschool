import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not trigger click when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with icons', () => {
    render(
      <Button leftIcon="🌱" rightIcon="🚀">
        Plant
      </Button>
    );

    const button = screen.getByRole('button', { name: /plant/i });
    expect(button).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<Button testId="test-button">Accessible Button</Button>);
    const button = screen.getByTestId('test-button');

    expect(button).toHaveAttribute('data-testid', 'test-button');
    expect(button).toHaveAttribute('type', 'button');
  });
});
