# CropSchool UI Component Library

A child-friendly design system and component library for educational applications, built with TypeScript, React, and accessibility in mind.

## Features

### 🎨 Child-Friendly Design

- Large touch targets (minimum 44px) optimized for children
- High contrast colors for better readability
- Rounded corners and friendly aesthetics
- Consistent spacing and typography scales

### ♿ Accessibility First

- WCAG AA compliant color contrasts
- Screen reader support
- Keyboard navigation
- Focus management
- Semantic HTML elements

### 🎮 Educational Game Components

- Score displays with animations
- Progress bars for learning milestones
- Countdown timers
- Achievement badges

### 🎬 Fun Animations

- Powered by Framer Motion
- Bounce, fade, slide, and scale animations
- Child-friendly interaction feedback
- Performance optimized

### 📱 Cross-Platform

- Works with React (web) and React Native (mobile)
- Responsive design
- Touch-friendly interactions

## Installation

```bash
npm install @cropschool/ui
# or
yarn add @cropschool/ui
```

### Peer Dependencies

```bash
npm install react react-dom framer-motion
```

## Quick Start

```tsx
import { Button, Card, Typography, Progress } from '@cropschool/ui';

function App() {
  return (
    <Card padding="lg" variant="elevated">
      <Typography variant="heading" size="2xl" color="primary">
        Welcome to CropSchool! 🌱
      </Typography>

      <Typography variant="body" size="lg" style={{ margin: '1rem 0' }}>
        Ready to learn about farming?
      </Typography>

      <Progress
        value={75}
        color="success"
        size="lg"
        showLabel
        label="Learning Progress"
        animated
      />

      <Button
        size="lg"
        color="primary"
        leftIcon="🚀"
        style={{ marginTop: '1rem' }}
      >
        Start Adventure
      </Button>
    </Card>
  );
}
```

## Components

### Core Components

#### Button

Child-friendly button with accessibility features and animations.

```tsx
<Button
  variant="solid"
  color="primary"
  size="lg"
  leftIcon={<StarIcon />}
  animation="bounce"
  onClick={() => console.log('Button clicked!')}
>
  Play Game
</Button>
```

**Props:**

- `variant`: 'solid' | 'outline' | 'ghost' | 'soft'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `color`: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `animation`: 'bounce' | 'fadeIn' | 'slideIn' | 'scaleIn' | 'none'

#### Card

Container component for grouping content.

```tsx
<Card variant="elevated" padding="lg" interactive>
  <h3>Farm Progress</h3>
  <p>You've planted 5 crops today!</p>
</Card>
```

#### Typography

Consistent text styling optimized for young readers.

```tsx
<Typography variant="heading" size="2xl" color="primary">
  Welcome to CropSchool!
</Typography>

<Typography variant="body" size="lg" lineHeight="relaxed">
  Learn about farming while having fun!
</Typography>
```

#### Input

Form input with validation and child-friendly design.

```tsx
<Input
  label="Your Name"
  placeholder="Enter your name"
  size="lg"
  required
  leftIcon={<UserIcon />}
  helperText="This will be your display name in the game"
/>
```

### Educational Game Components

#### Progress

Progress indicators for learning milestones.

```tsx
<Progress
  value={75}
  color="success"
  size="lg"
  showLabel
  label="Level Progress"
  variant="circular"
  animated
/>
```

#### ScoreDisplay

Animated score display for games.

```tsx
<ScoreDisplay
  score={1250}
  previousScore={1000}
  showChange
  color="success"
  size="lg"
  icon={<StarIcon />}
  label="Total Score"
/>
```

#### Timer

Countdown timer with visual progress.

```tsx
<Timer
  duration={120}
  isRunning
  size="lg"
  color="warning"
  showProgress
  format="mm:ss"
  onComplete={() => console.log('Time up!')}
  onTick={remaining => console.log(`${remaining} seconds left`)}
/>
```

#### Modal

Child-friendly dialog component.

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Game Complete!"
  size="lg"
  animation="scaleIn"
>
  <p>Congratulations! You completed the level!</p>
  <Button onClick={() => setIsOpen(false)}>Continue</Button>
</Modal>
```

## Design Tokens

### Colors

```tsx
import { colors } from '@cropschool/ui';

// Primary colors
colors.primary[500]; // Main green
colors.secondary[500]; // Main orange

// Semantic colors
colors.semantic.success;
colors.semantic.warning;
colors.semantic.error;
colors.semantic.info;
```

### Typography

```tsx
import { typography } from '@cropschool/ui';

typography.fontFamily.primary; // System font stack
typography.fontFamily.display; // Child-friendly display font
typography.fontSize.base; // 16px minimum for accessibility
```

### Spacing

```tsx
import { spacing } from '@cropschool/ui';

spacing[12]; // 48px - minimum touch target
spacing[16]; // 64px - comfortable touch target
spacing[20]; // 80px - large touch target
```

## Theming

Create CSS custom properties for runtime theming:

```tsx
import { createCSSVariables } from '@cropschool/ui';

const cssVariables = createCSSVariables();
// Apply to your app root
```

## Accessibility

All components follow WCAG AA guidelines:

- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Touch Targets**: Minimum 44px for interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Running Storybook

```bash
npm run storybook
```

### Running Tests

```bash
npm test
npm run test:watch
```

### Building

```bash
npm run build
```

## Contributing

1. Follow the design system principles
2. Ensure accessibility compliance
3. Add proper TypeScript types
4. Include tests for new components
5. Update Storybook documentation

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for young learners everywhere! 🌱
