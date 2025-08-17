import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Child-friendly button component with accessibility features and fun animations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'soft'],
      description: 'Button visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Button size - minimum md for touch accessibility',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
        'info',
        'neutral',
      ],
      description: 'Button color scheme',
    },
    animation: {
      control: 'select',
      options: ['bounce', 'fadeIn', 'slideIn', 'scaleIn', 'none'],
      description: 'Animation type for interactions',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button interactions',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Play Game',
    variant: 'solid',
    size: 'md',
    color: 'primary',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="soft">Soft</Button>
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="error">Error</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button leftIcon="🌱">Plant Seed</Button>
      <Button rightIcon="🚀">Launch</Button>
      <Button leftIcon="⭐" rightIcon="🎉">
        Celebrate
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
    size: 'lg',
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
    size: 'lg',
  },
  parameters: {
    layout: 'padded',
  },
};

export const GameActions: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button size="lg" color="success" leftIcon="🎮">
        Start Game
      </Button>
      <Button size="lg" variant="outline" color="warning" leftIcon="⏸️">
        Pause
      </Button>
      <Button size="lg" variant="soft" color="error" leftIcon="🔄">
        Restart
      </Button>
      <Button size="lg" variant="ghost" color="neutral" leftIcon="⚙️">
        Settings
      </Button>
    </div>
  ),
};
