# PetVue UI Components

This directory contains reusable UI components for the PetVue application. These components follow modern design principles and are built to be flexible, accessible, and consistent with the PetVue brand.

## Available Components

### Core Components

- **Avatar** - Display user or pet avatars with various sizes and styles
- **Badge** - Show status or category indicators
- **Button** - Action elements with multiple variants and states
- **Card** - Content containers with hover animations
- **Input** - Form input fields with validation states
- **Select** - Dropdown selection components
- **Alert** - Notification messages with different severity levels
- **Modal** - Dialog boxes for focused interactions
- **Tabs** - Tabbed interfaces for organizing content
- **Toast** - Temporary notification messages
- **Skeleton** - Loading placeholders for content
- **Stat** - Display metrics and statistics

### Usage Examples

```jsx
import { Button, Card, Input } from '../components/ui';

function MyComponent() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">My Form</h2>
      <Input 
        label="Pet Name" 
        placeholder="Enter pet's name"
        required
      />
      <Button variant="primary">
        Submit
      </Button>
    </Card>
  );
}
```

## Design Principles

1. **Consistency** - Components follow a consistent design language
2. **Accessibility** - All components are built with accessibility in mind
3. **Flexibility** - Components accept various props for customization
4. **Performance** - Optimized for rendering performance
5. **Animation** - Subtle animations enhance the user experience

## Component Structure

Each component follows a similar structure:

1. Import statements
2. PropTypes definition
3. Component definition with appropriate defaults
4. Style variations
5. Export statement

## Customization

Components can be customized via:

- **Props** - Each component accepts specific props for customization
- **Tailwind Classes** - Additional classes can be passed via `className` prop
- **Theme** - Global theme settings affect all components

## Accessibility

All components are designed with accessibility in mind:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Future Enhancements

- Form component (composing inputs, validation, etc.)
- Data table component
- Calendar/Date picker component
- Carousel component
- Progress indicators