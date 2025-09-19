# Fly-Fleet Accessibility Implementation

This document outlines the comprehensive accessibility features implemented in the Fly-Fleet application, ensuring WCAG 2.1 AA compliance and providing an excellent experience for all users, including those using assistive technologies.

## 🎯 Accessibility Goals

- **WCAG 2.1 AA Compliance**: All components meet or exceed WCAG 2.1 AA standards
- **Screen Reader Support**: Full compatibility with NVDA, JAWS, VoiceOver, and TalkBack
- **Keyboard Navigation**: Complete keyboard accessibility without mouse dependency
- **Focus Management**: Proper focus indicators and logical tab order
- **Live Regions**: Real-time announcements for dynamic content changes
- **Multilingual Support**: Accessibility features work across English, Spanish, and Portuguese

## 🏗️ Architecture Overview

### Core Components

#### 1. Accessibility Context (`src/contexts/AccessibilityContext.tsx`)
Provides global accessibility state management and screen reader announcements.

**Features:**
- Global live regions for announcements
- Screen reader detection
- Skip links for keyboard navigation
- Focus trap utilities for modals
- Page load announcements

**Usage:**
```tsx
import { useAccessibility } from '../contexts/AccessibilityContext';

const { announce, announceAssertive, skipToContent } = useAccessibility();
announce('Item added to cart', { priority: 'polite' });
```

#### 2. Keyboard Navigation Context (`src/contexts/KeyboardNavigationContext.tsx`)
Manages keyboard navigation patterns and roving tab index.

**Features:**
- Keyboard user detection
- Roving tab index for complex widgets
- Global keyboard shortcuts (F6 for region navigation)
- Element registration for navigation groups

**Usage:**
```tsx
import { useKeyboardNavigation } from '../contexts/KeyboardNavigationContext';

const { enableRovingTabIndex, moveFocus } = useKeyboardNavigation();
enableRovingTabIndex('toolbar', 'horizontal');
```

### UI Components

#### 1. FormField (`src/components/ui/FormField.tsx`)
Accessible form field wrapper with proper labeling and error handling.

**Features:**
- Automatic ARIA attributes
- Error announcements
- Required field indicators
- Proper label association

#### 2. LiveRegion (`src/components/ui/LiveRegion.tsx`)
Screen reader announcement component with automatic message clearing.

**Features:**
- Polite/assertive priority levels
- Automatic message clearing
- Atomic announcements
- Custom relevance settings

#### 3. VisuallyHidden (`src/components/ui/VisuallyHidden.tsx`)
Component for content that should be available to screen readers but hidden visually.

#### 4. FocusRing (`src/components/ui/FocusRing.tsx`)
Consistent focus indication across all interactive elements.

### Accessibility Hooks

#### 1. useAnnouncer (`src/hooks/useAnnouncer.ts`)
Hook for making screen reader announcements.

```tsx
const { announce, announceAssertive } = useAnnouncer();
announce('Loading complete', { priority: 'polite', delay: 500 });
```

#### 2. useFocusManagement (`src/hooks/useFocusManagement.ts`)
Hook for managing focus state and focus restoration.

```tsx
const { focusElement, trapFocus, restoreFocus } = useFocusManagement();
focusElement('#main-content', { preventScroll: false });
```

#### 3. useKeyboardNavigation (`src/hooks/useKeyboardNavigation.ts`)
Hook for implementing keyboard navigation patterns.

```tsx
useKeyboardNavigation({
  container: containerRef.current,
  orientation: 'vertical',
  onEscape: () => closeDropdown(),
  onEnter: (element) => selectOption(element)
});
```

## 🎛️ Form Components

### AirportSearch Component
Accessible combobox implementation with ARIA support.

**Accessibility Features:**
- ARIA combobox pattern
- Keyboard navigation (Arrow keys, Enter, Escape)
- Screen reader announcements for search results
- Live search status updates
- Proper labeling and descriptions

**ARIA Attributes:**
- `role="combobox"`
- `aria-expanded`
- `aria-autocomplete="list"`
- `aria-owns` for dropdown association
- `aria-describedby` for status messages

### QuoteForm Component
Comprehensive quote request form with full accessibility support.

**Accessibility Features:**
- Progressive form validation
- Screen reader friendly error messages
- Keyboard navigation for service type selection
- Accessible passenger counter with +/- buttons
- Form submission status announcements

### ContactForm Component
Accessible contact form with inquiry types and communication preferences.

**Accessibility Features:**
- Radio button groups with proper ARIA labels
- Urgency level indicators with visual and semantic meaning
- Field validation with immediate feedback
- Accessible form structure with fieldsets

## 🔧 Backend API Accessibility

All API endpoints return accessibility metadata to support frontend screen reader announcements:

```json
{
  "success": true,
  "data": {...},
  "accessibility": {
    "ariaLiveMessage": "Quote request submitted successfully",
    "ariaAnnouncement": "Thank you for your request. We'll respond within 24 hours.",
    "focusTarget": "#success-message",
    "formStatus": "submitted"
  }
}
```

### API Endpoints with Accessibility Support:
- `/api/quote` - Quote request submission
- `/api/contact` - Contact form submission
- `/api/airports` - Airport search with ARIA labels

## ⌨️ Keyboard Navigation

### Global Shortcuts
- **Tab/Shift+Tab**: Navigate between focusable elements
- **F6/Shift+F6**: Navigate between page regions (header, main, footer)
- **Escape**: Close modals, dropdowns, and overlays
- **Enter/Space**: Activate buttons and interactive elements

### Form Navigation
- **Arrow Keys**: Navigate radio button groups and dropdown options
- **Home/End**: Jump to first/last option in lists
- **Page Up/Page Down**: Navigate long option lists

### Component-Specific Navigation

#### Airport Search
- **Arrow Down**: Open dropdown and navigate options
- **Arrow Up/Down**: Navigate search results
- **Enter**: Select highlighted option
- **Escape**: Close dropdown and return to input

#### Quote Form
- **Arrow Keys**: Navigate service type radio buttons
- **+/- Buttons**: Adjust passenger count (also keyboard accessible)
- **Tab**: Move through form fields in logical order

## 📱 Screen Reader Support

### Announcements
The application provides comprehensive screen reader announcements for:

- **Form validation**: Immediate feedback on field errors
- **Search results**: Number of results and navigation instructions
- **Status changes**: Loading states, submission success/failure
- **Navigation**: Page changes and region focus
- **Interactive elements**: Button states, selection changes

### Live Regions
- **Polite announcements**: Non-interrupting status updates
- **Assertive announcements**: Important error messages and alerts
- **Atomic updates**: Complete message replacement for clarity

### ARIA Patterns Implemented
- **Combobox**: Airport search with listbox popup
- **Radiogroup**: Service type and preference selections
- **Alert**: Error and success messages
- **Status**: Loading and progress indicators
- **Region**: Page sections with proper landmarks

## 🎨 Visual Accessibility

### Color and Contrast
- **WCAG AA Compliance**: Minimum 4.5:1 contrast ratio for normal text
- **Enhanced Contrast**: 7:1 ratio for improved readability
- **No Color-Only Information**: All information conveyed through multiple means
- **Dark Mode Support**: Full accessibility maintained in dark theme

### Focus Indicators
- **Visible Focus**: Clear 2px blue outline on all focusable elements
- **High Contrast**: Focus indicators work in both light and dark modes
- **Consistent Styling**: Same focus treatment across all components

### Typography
- **Readable Fonts**: System font stack for optimal rendering
- **Appropriate Sizing**: Minimum 16px for body text
- **Line Spacing**: 1.5x line height for improved readability

## 🧪 Testing

### Automated Testing
- **axe-core**: Automated accessibility testing
- **ESLint jsx-a11y**: Linting for accessibility issues
- **TypeScript**: Type safety for ARIA attributes

### Manual Testing
- **Screen Readers**: NVDA, JAWS, VoiceOver testing
- **Keyboard Only**: Complete navigation without mouse
- **High Contrast**: Windows High Contrast Mode compatibility
- **Zoom**: 200% zoom level testing

### Testing Commands
```bash
# Run accessibility linting
npm run lint

# Build and test for production
npm run build

# Start development server for testing
npm run dev
```

## 📊 Compliance Standards

### WCAG 2.1 AA Compliance
- ✅ **Perceivable**: Text alternatives, color contrast, resizable text
- ✅ **Operable**: Keyboard accessibility, no seizure triggers, navigation
- ✅ **Understandable**: Readable text, predictable functionality
- ✅ **Robust**: Compatible with assistive technologies

### Section 508 Compliance
- ✅ All interactive elements keyboard accessible
- ✅ No time-based limitations without user control
- ✅ Screen reader compatible markup
- ✅ Alternative text for images

## 🚀 Implementation Guide

### Setting Up Accessibility
1. Wrap your app with accessibility providers:

```tsx
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { KeyboardNavigationProvider } from './contexts/KeyboardNavigationContext';

export default function App({ children }) {
  return (
    <AccessibilityProvider>
      <KeyboardNavigationProvider>
        {children}
      </KeyboardNavigationProvider>
    </AccessibilityProvider>
  );
}
```

2. Use accessibility hooks in components:

```tsx
import { useAccessibility } from './contexts/AccessibilityContext';

function MyComponent() {
  const { announce } = useAccessibility();

  const handleAction = () => {
    // Perform action
    announce('Action completed successfully');
  };
}
```

### Best Practices
1. **Always test with keyboard only**
2. **Use semantic HTML elements**
3. **Provide meaningful labels and descriptions**
4. **Implement proper focus management**
5. **Test with actual screen readers**
6. **Follow ARIA authoring practices**

## 🔗 Demo

Visit `/accessibility-demo` to see all accessibility features in action:

- Airport search with keyboard navigation
- Accessible quote request form
- Contact form with comprehensive validation
- Keyboard navigation demonstrations
- Screen reader announcement examples

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Next.js Accessibility](https://nextjs.org/docs/accessibility)

## 🤝 Contributing

When contributing to accessibility features:

1. **Test with screen readers** before submitting
2. **Validate keyboard navigation** works completely
3. **Check color contrast** meets WCAG AA standards
4. **Update documentation** for new accessibility features
5. **Include accessibility tests** in your changes

## 📞 Support

For accessibility questions or issues:
- Review this documentation
- Test with the `/accessibility-demo` page
- Check console for accessibility warnings
- Validate with automated tools like axe DevTools