# CropSchool UI Library Usage

## Installation

Since this is part of the monorepo, the UI library is automatically available to other packages.

## Quick Start

```tsx
import {
  Button,
  Card,
  Typography,
  Progress,
  ScoreDisplay,
  Timer,
  Input,
  Modal
} from '@cropschool/ui';

// Example: Basic Button
<Button
  color="primary"
  size="lg"
  animation="bounce"
  onClick={() => console.log('Clicked!')}
>
  Play Game!
</Button>

// Example: Educational Card
<Card
  variant="elevated"
  color="primary"
  interactive
  padding="lg"
>
  <Typography variant="h2" color="primary">
    🌱 Plant a Seed
  </Typography>
  <Typography variant="body1">
    Drag and drop seeds into the soil to start growing your crops!
  </Typography>
</Card>

// Example: Game Progress
<Progress
  value={75}
  max={100}
  size="lg"
  color="success"
  showLabel
  animated
/>

// Example: Score Display
<ScoreDisplay
  score={1250}
  level={3}
  showAnimation
  size="lg"
/>

// Example: Timer Component
<Timer
  initialTime={60}
  onTimeUp={() => console.log('Time is up!')}
  size="lg"
  showProgressRing
/>

// Example: Form Input
<Input
  placeholder="Enter your farm name"
  size="lg"
  variant="outlined"
  helperText="Choose a fun name for your farm!"
/>

// Example: Modal Dialog
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="🎉 Level Complete!"
  size="md"
>
  <Typography variant="body1">
    Congratulations! You've completed level 1 of CropSchool!
  </Typography>
  <Button color="primary" onClick={() => setIsModalOpen(false)}>
    Continue
  </Button>
</Modal>
```

## Design Tokens

The library includes a comprehensive design system:

### Colors

- Primary colors with child-friendly green tones
- Secondary colors with warm orange accents
- Semantic colors for success, warning, and error states
- Neutral grays for text and backgrounds

### Typography

- Child-friendly fonts optimized for readability
- Size scale from xs to 3xl
- Proper heading hierarchy (h1-h6)

### Spacing & Sizing

- Consistent spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
- Touch-friendly target sizes (minimum 44px)
- Responsive breakpoints

### Animations

- Gentle, child-friendly animations
- Reduced motion support
- Performance-optimized transitions

## Accessibility Features

All components follow WCAG 2.1 AA guidelines:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader compatibility
- Reduced motion preferences

## Storybook Documentation

Run Storybook to see all components in action:

```bash
cd packages/ui
npm run storybook
```

## Testing

Run the component tests:

```bash
cd packages/ui
npm test
```

## Building

Build the library for distribution:

```bash
cd packages/ui
npm run build
```

This creates optimized CommonJS and ES module builds in the `dist/` folder.
