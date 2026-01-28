import type { Challenge } from '../../types';

export const frontendChallenges: Challenge[] = [
  // ============================================
  // COMPONENT ARCHITECTURE (4 challenges)
  // ============================================
  {
    id: 'fe-001',
    category: 'frontend',
    subcategory: 'component-architecture',
    title: 'Compound Component Pattern',
    difficulty: 3,
    type: 'CODE',
    description:
      'Build a reusable Tabs component using the compound component pattern. The parent Tabs component should manage which tab is active, while child TabList, Tab, and TabPanel components access shared state through React Context. This pattern allows consumers to compose tabs flexibly without prop-drilling.',
    starterCode: `import React, { createContext, useContext, useState, ReactNode } from 'react';

// TODO: Create a TabsContext to share active tab state

// TODO: Implement the Tabs provider component
interface TabsProps {
  defaultIndex?: number;
  children: ReactNode;
}

export function Tabs({ defaultIndex = 0, children }: TabsProps) {
  // Manage active index state
  // Provide context value to children
}

// TODO: Implement TabList (wraps Tab buttons)
export function TabList({ children }: { children: ReactNode }) {
  // Render tab buttons in a role="tablist" container
}

// TODO: Implement Tab (individual tab button)
interface TabProps {
  index: number;
  children: ReactNode;
}

export function Tab({ index, children }: TabProps) {
  // Read context, handle click to set active index
  // Apply aria-selected, role="tab"
}

// TODO: Implement TabPanel
interface TabPanelProps {
  index: number;
  children: ReactNode;
}

export function TabPanel({ index, children }: TabPanelProps) {
  // Only render children when this panel's index matches active index
  // Apply role="tabpanel"
}

// Usage example:
// <Tabs defaultIndex={0}>
//   <TabList>
//     <Tab index={0}>Tab 1</Tab>
//     <Tab index={1}>Tab 2</Tab>
//   </TabList>
//   <TabPanel index={0}>Content 1</TabPanel>
//   <TabPanel index={1}>Content 2</TabPanel>
// </Tabs>`,
    solution: `import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextType {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a <Tabs> provider');
  }
  return context;
}

interface TabsProps {
  defaultIndex?: number;
  children: ReactNode;
}

export function Tabs({ defaultIndex = 0, children }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div data-testid="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children }: { children: ReactNode }) {
  return (
    <div role="tablist" data-testid="tablist">
      {children}
    </div>
  );
}

interface TabProps {
  index: number;
  children: ReactNode;
}

export function Tab({ index, children }: TabProps) {
  const { activeIndex, setActiveIndex } = useTabsContext();

  return (
    <button
      role="tab"
      aria-selected={activeIndex === index}
      onClick={() => setActiveIndex(index)}
      data-testid={\`tab-\${index}\`}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  index: number;
  children: ReactNode;
}

export function TabPanel({ index, children }: TabPanelProps) {
  const { activeIndex } = useTabsContext();

  if (activeIndex !== index) return null;

  return (
    <div role="tabpanel" data-testid={\`tabpanel-\${index}\`}>
      {children}
    </div>
  );
}`,
    solutionExplanation:
      'The compound component pattern uses React Context to share implicit state between a parent component and its children. The Tabs component creates a context provider that holds the activeIndex and a setter. Each Tab reads the context to know if it is selected and to handle clicks. Each TabPanel reads the context to conditionally render its children. The useTabsContext hook enforces that children are used within the provider, throwing a helpful error message if not. This pattern gives consumers full control over composition and layout while the parent manages state internally.',
    hints: [
      'Create a context with activeIndex and setActiveIndex. Use a custom hook that throws if the context is undefined to enforce proper usage.',
      'The Tab component needs to call setActiveIndex(index) on click and set aria-selected based on whether its index matches activeIndex.',
      'TabPanel should return null when its index does not match activeIndex, and render children wrapped in a div with role="tabpanel" when it does.',
    ],
    testCases: [
      {
        input: 'render(<Tabs><TabList><Tab index={0}>A</Tab><Tab index={1}>B</Tab></TabList><TabPanel index={0}>Content A</TabPanel><TabPanel index={1}>Content B</TabPanel></Tabs>)',
        expectedOutput: 'Content A is visible, Content B is hidden',
        description: 'Default first tab is active and its panel is shown',
      },
      {
        input: 'click Tab index={1}',
        expectedOutput: 'Content B is visible, Content A is hidden',
        description: 'Clicking a tab switches the visible panel',
      },
      {
        input: 'render(<Tabs defaultIndex={1}>...)</Tabs>)',
        expectedOutput: 'Content B is visible initially',
        description: 'defaultIndex prop sets initial active tab',
      },
    ],
    tags: ['react', 'compound-components', 'context', 'composition', 'design-patterns'],
    estimatedMinutes: 20,
    walkthrough: [
      {
        title: 'Context Type and Creation',
        lines: [1, 8],
        what: 'Imports React utilities and creates a typed Context that holds the active tab index and a setter function. The context is initialized as undefined to detect misuse.',
        why: 'TypeScript generics ensure type safety throughout the component tree. Initializing with undefined lets us distinguish between "no provider" and "provider with default value", enabling the safety check in the custom hook.',
        when: 'Use React Context when sibling or deeply nested components need to share state without prop-drilling. The compound component pattern is ideal for UI components like Tabs, Accordions, and Menus.',
        how: 'createContext<TabsContextType | undefined>(undefined) creates a context with a union type. Components consuming this context will get either the full TabsContextType or undefined.',
      },
      {
        title: 'Custom Hook with Safety Check',
        lines: [10, 16],
        what: 'A custom hook that reads the TabsContext and throws a descriptive error if the component is used outside of a Tabs provider.',
        why: 'This is a guardrail pattern. Without it, context consumers would silently receive undefined, causing confusing runtime errors. The explicit error message tells developers exactly what went wrong and how to fix it.',
        when: 'Always create a custom hook for your contexts that validates the provider exists. This is a best practice in every compound component, not just Tabs.',
        how: 'useContext returns undefined if no provider exists above in the tree. The if (!context) check catches this and throws immediately, preventing the component from rendering with missing data.',
      },
      {
        title: 'Tabs Provider Component',
        lines: [23, 31],
        what: 'The root Tabs component that owns the active tab state and wraps children in a Context Provider, making the state accessible to all descendant Tab and TabPanel components.',
        why: 'Centralizing state in the parent follows the "single source of truth" principle. Children read and write state through context, so the parent does not need to know about the specific children or their structure.',
        when: 'Use this provider pattern whenever a parent component manages state that multiple children need. It enables flexible composition — consumers can arrange Tab and TabPanel components however they like.',
        how: 'useState manages the activeIndex. The Provider passes both the state value and setter as the context value. defaultIndex allows consumers to set which tab starts active.',
      },
      {
        title: 'TabList Semantic Wrapper',
        lines: [33, 39],
        what: 'A simple wrapper component that renders its children inside a div with role="tablist", providing semantic HTML structure for accessibility.',
        why: 'The WAI-ARIA Tabs pattern requires a tablist role on the container of tab buttons. This separation lets the Tabs component focus on state while TabList handles presentation semantics.',
        when: 'Use semantic wrapper components whenever you need to add accessibility roles or styling containers. Keeping them separate from logic components follows single responsibility.',
        how: 'TabList renders a div with role="tablist" and passes children through unchanged. It does not interact with context because it has no behavior — it is purely structural.',
      },
      {
        title: 'Tab Button Component',
        lines: [46, 59],
        what: 'An individual tab button that reads the shared context to know if it is currently active, and calls setActiveIndex when clicked to switch tabs.',
        why: 'Each Tab is self-aware through context — it knows if it is selected and can update the shared state. No props need to be threaded from Tabs to Tab, which is the core benefit of the compound component pattern.',
        when: 'This context-reading pattern is used in any compound child component that needs to respond to or modify shared state. Radio buttons, accordion items, and menu items follow the same pattern.',
        how: 'useTabsContext() provides activeIndex for comparison and setActiveIndex for the click handler. aria-selected communicates the active state to screen readers, making the component accessible.',
      },
      {
        title: 'TabPanel Conditional Rendering',
        lines: [66, 76],
        what: 'A panel component that only renders its children when its index matches the currently active tab index. Inactive panels return null, removing them from the DOM entirely.',
        why: 'Returning null for inactive panels is the simplest approach and works well for most cases. The DOM only contains the active panel, keeping it lightweight. For cases where panels have expensive initialization, you could alternatively toggle CSS visibility.',
        when: 'Conditional rendering with early return null is the standard React pattern for showing/hiding content. Use CSS visibility instead only when you need to preserve panel state (like form inputs) across tab switches.',
        how: 'useTabsContext() provides activeIndex. A simple equality check (activeIndex !== index) determines if this panel should render. The role="tabpanel" attribute satisfies ARIA requirements.',
      },
    ],
  },
  {
    id: 'fe-002',
    category: 'frontend',
    subcategory: 'component-architecture',
    title: 'Controlled Input Component',
    difficulty: 2,
    type: 'CODE',
    description:
      'Build a reusable controlled TextInput component that supports validation. The component should accept a value and onChange prop (controlled pattern), display inline error messages when a validate function returns an error string, and show a character count when maxLength is provided. It must handle focus/blur states to only show validation errors after the user has interacted with the field (touched state).',
    starterCode: `import React, { useState } from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  validate?: (value: string) => string | null; // returns error message or null
  disabled?: boolean;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  validate,
  disabled = false,
}: TextInputProps) {
  // TODO: Track whether the field has been touched (blurred at least once)
  // TODO: Run validation and display error only if touched
  // TODO: Show character count if maxLength is provided
  // TODO: Apply error styling when there's an error

  return (
    <div>
      {/* Implement the controlled input with label, error, and char count */}
    </div>
  );
}`,
    solution: `import React, { useState } from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  validate?: (value: string) => string | null;
  disabled?: boolean;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  validate,
  disabled = false,
}: TextInputProps) {
  const [touched, setTouched] = useState(false);

  const error = validate ? validate(value) : null;
  const showError = touched && error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <div className="text-input-wrapper">
      <label htmlFor={label}>
        {label}
      </label>
      <input
        id={label}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!showError}
        aria-describedby={showError ? \`\${label}-error\` : undefined}
        className={showError ? 'input-error' : ''}
      />
      {maxLength && (
        <span className="char-count">
          {value.length}/{maxLength}
        </span>
      )}
      {showError && (
        <span id={\`\${label}-error\`} className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}`,
    solutionExplanation:
      'The TextInput component follows the controlled component pattern by receiving value and onChange as props, letting the parent own the state. A local touched state tracks whether the user has interacted with the field (set on blur), which prevents showing validation errors before the user has had a chance to type. The validate function runs on every render but errors are only displayed when touched is true. The maxLength guard in handleChange prevents input beyond the limit. Accessibility is handled with aria-invalid, aria-describedby linking to the error message, and a role="alert" on the error span for screen reader announcements.',
    hints: [
      'Use a local useState for "touched" state. Set it to true in the onBlur handler so validation errors only appear after the user leaves the field.',
      'For maxLength enforcement, check the new value length in handleChange and return early if it exceeds the limit. Display the count as value.length/maxLength.',
    ],
    testCases: [
      {
        input: 'render(<TextInput label="Name" value="" onChange={fn} validate={v => v.length === 0 ? "Required" : null} />); blur the input',
        expectedOutput: 'Error message "Required" appears after blur',
        description: 'Shows validation error only after field is touched',
      },
      {
        input: 'render(<TextInput label="Name" value="abc" onChange={fn} maxLength={5} />)',
        expectedOutput: 'Character count shows "3/5"',
        description: 'Displays character count when maxLength is provided',
      },
      {
        input: 'render(<TextInput label="Name" value="" onChange={fn} validate={v => v ? null : "Required"} />); type without blurring',
        expectedOutput: 'No error message shown (not yet touched)',
        description: 'Does not show error before field is blurred',
      },
    ],
    tags: ['react', 'controlled-component', 'forms', 'validation', 'accessibility'],
    estimatedMinutes: 15,
  },
  {
    id: 'fe-003',
    category: 'frontend',
    subcategory: 'component-architecture',
    title: 'Composition vs Inheritance in React',
    difficulty: 3,
    type: 'EXPLAIN',
    description:
      'Explain why React strongly favors composition over inheritance for code reuse. Describe the specific patterns (children prop, render props, custom hooks) that replace what classical inheritance would provide. Include concrete examples of when developers might be tempted to use inheritance and show the composition-based alternative.',
    solution: `React favors composition over inheritance because components are functions (or function-like) that produce UI, not class hierarchies that share implementation. Composition is more flexible, easier to reason about, and avoids the tight coupling and fragile base class problems that plague inheritance-heavy architectures.

**Why Composition Wins in React:**

1. **Children prop (containment):** When a component needs to render arbitrary content inside itself, use the children prop rather than subclassing. A Dialog component doesn't need a WarningDialog subclass — you just pass different children: \`<Dialog><WarningContent /></Dialog>\`.

2. **Props for specialization:** Instead of creating a SaveButton that extends Button, create a Button component that accepts variant, icon, and label props. This is specialization through configuration, not inheritance.

3. **Render props and children-as-function:** When a component needs to share behavior or data with its children, it can pass it via render props: \`<MouseTracker render={({x, y}) => <Cursor x={x} y={y} />} />\`. This avoids the diamond problem and makes data flow explicit.

4. **Custom hooks (modern approach):** The most powerful composition primitive. Instead of a WithAuth base class, you write a useAuth() hook. Any component can use it without changing its inheritance chain. Hooks compose naturally: useAuthenticatedQuery() can use both useAuth() and useQuery() internally.

**When developers are tempted to inherit:**
- Shared lifecycle logic (e.g., fetching data on mount) → Use a custom hook instead
- Shared UI chrome (e.g., all pages have a header and sidebar) → Use a Layout component with children
- Shared method logic (e.g., validation) → Extract to a utility function or custom hook
- Variants of a component (e.g., PrimaryButton, DangerButton) → Use props/variants on a single component

**The key insight:** Inheritance creates an "is-a" relationship that's rigid. Composition creates a "has-a" or "uses-a" relationship that's flexible. A component that uses useAuth and useForm composes two behaviors without being locked into a class hierarchy. You can add or remove behaviors independently.

React's own documentation states: "At Facebook, we use React in thousands of components, and we haven't found any use cases where we would recommend creating component inheritance hierarchies."`,
    solutionExplanation:
      'This question tests whether a candidate understands React\'s fundamental design philosophy. The key points are: children prop for containment, props for specialization, render props and hooks for sharing behavior. The strongest answers will give concrete before/after examples showing an inheritance approach refactored to composition, and explain the practical benefits — easier testing, flexible composition of multiple behaviors, and avoidance of fragile base class problems. Mentioning custom hooks as the modern preferred approach for sharing stateful logic is essential.',
    hints: [
      'Think about the specific problems inheritance causes: fragile base classes, the diamond problem, tight coupling. How does composition avoid each of these?',
      'Consider three patterns: children prop for containment, configurable props for specialization, and custom hooks for shared stateful logic. Give a concrete example of each.',
    ],
    tags: ['react', 'composition', 'inheritance', 'design-patterns', 'hooks', 'architecture'],
    estimatedMinutes: 10,
  },
  {
    id: 'fe-004',
    category: 'frontend',
    subcategory: 'component-architecture',
    title: 'Design a Form Builder',
    difficulty: 5,
    type: 'SCENARIO',
    description:
      'You are tasked with designing a dynamic form builder component system for an enterprise application. The system must support dynamic field types (text, select, checkbox, date, file upload), conditional visibility rules (show field B only when field A has value X), cross-field validation, and a schema-driven approach where a JSON config produces a complete form. Walk through the component API design, state management approach, validation architecture, and dynamic field rendering strategy.',
    scenario:
      'Your team is building an internal tool where non-developers define forms via a JSON schema. Forms can have 5-50 fields, nested sections, conditional fields, and complex validation rules like "end date must be after start date." The forms need to work for both create and edit modes, support draft saving, and be accessible.',
    solution: `**Part 1: Schema Design**

The form schema is a JSON object that describes fields, layout, and rules:

\`\`\`typescript
interface FormSchema {
  id: string;
  title: string;
  sections: FormSection[];
  validationRules: CrossFieldRule[];
}

interface FormSection {
  id: string;
  title: string;
  fields: FieldConfig[];
}

interface FieldConfig {
  id: string;
  type: 'text' | 'select' | 'checkbox' | 'date' | 'file' | 'textarea';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[]; // for select
  defaultValue?: unknown;
  validation?: FieldValidation;
  visibility?: VisibilityRule;
}

interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: string; // function name for custom validator
}

interface VisibilityRule {
  dependsOn: string; // field id
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan';
  value: unknown;
}

interface CrossFieldRule {
  type: 'dateAfter' | 'requiredIf' | 'custom';
  fields: string[];
  message: string;
  params?: Record<string, unknown>;
}
\`\`\`

**Part 2: Component Architecture**

\`\`\`tsx
// Top-level component
<FormBuilder
  schema={formSchema}
  initialValues={existingData}   // for edit mode
  onSubmit={handleSubmit}
  onSaveDraft={handleDraft}
  mode="create" | "edit"
/>

// Internal component tree:
FormBuilder
  ├── FormProvider (context with form state, errors, handlers)
  │   ├── FormSection (renders each section)
  │   │   ├── ConditionalField (evaluates visibility rule)
  │   │   │   └── FieldRenderer (renders correct input by type)
  │   │   │       ├── TextInput
  │   │   │       ├── SelectInput
  │   │   │       ├── CheckboxInput
  │   │   │       ├── DateInput
  │   │   │       └── FileInput
  │   │   └── ...more fields
  │   └── ...more sections
  └── FormActions (Submit, Save Draft, Reset)
\`\`\`

**Part 3: State Management**

Use useReducer for form state since it handles complex updates predictably:

\`\`\`typescript
interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isSubmitting: boolean;
}

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: unknown }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'SET_TOUCHED'; field: string }
  | { type: 'VALIDATE_ALL' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_END' }
  | { type: 'RESET'; initialValues: Record<string, unknown> };
\`\`\`

**Part 4: Validation Architecture**

Three layers of validation run in order:
1. Field-level: Required, pattern, min/max — runs on blur
2. Cross-field: Date comparisons, conditional requirements — runs on submit
3. Server-side: Unique constraints, business rules — runs on submit

The validation engine is a pure function: \`validate(schema, values) => errors\`. This makes it testable independently of React.

**Part 5: Conditional Visibility**

The ConditionalField wrapper component subscribes to the depended-on field's value via context. When the visibility rule evaluates to false, the field is unmounted AND its value is cleared from state (to prevent submitting hidden field values).

\`\`\`typescript
function ConditionalField({ rule, children }) {
  const { values } = useFormContext();
  const dependentValue = values[rule.dependsOn];
  const isVisible = evaluateRule(rule, dependentValue);

  useEffect(() => {
    if (!isVisible) {
      clearField(rule.fieldId);
    }
  }, [isVisible]);

  return isVisible ? children : null;
}
\`\`\``,
    solutionExplanation:
      'This scenario tests the ability to design a complex component system from scratch. A strong answer addresses five concerns: schema design (how forms are configured), component hierarchy (how the UI is structured), state management (why useReducer suits complex form state), validation architecture (separating field-level and cross-field validation into testable pure functions), and conditional rendering (evaluating visibility rules and cleaning up hidden field values). The answer should also mention accessibility considerations like ARIA attributes on fields and error announcements, and the importance of making the validation engine a pure function that can be tested without rendering components.',
    hints: [
      'Start with the schema — what JSON structure would a non-developer need to define a form? Think about field types, validation rules, and visibility conditions.',
      'For state management, consider why useReducer is better than useState for forms with 50+ fields, cross-field validation, and undo/reset functionality.',
      'Do not forget to handle conditional fields: when a field becomes hidden, should its value be cleared? What about validation on hidden fields?',
    ],
    tags: ['react', 'system-design', 'forms', 'architecture', 'useReducer', 'validation', 'accessibility'],
    estimatedMinutes: 30,
  },

  // ============================================
  // REACT INTERNALS (4 challenges)
  // ============================================
  {
    id: 'fe-005',
    category: 'frontend',
    subcategory: 'react-internals',
    title: 'Stale Closure in useEffect',
    difficulty: 4,
    type: 'DEBUG',
    description:
      'The following component implements a notification auto-dismiss feature. After a notification appears, it should automatically dismiss after 5 seconds by calling onDismiss with the current notification ID. However, users report that when a new notification appears before the timer expires, the wrong notification gets dismissed. Find and fix the stale closure bug.',
    starterCode: `import React, { useEffect } from 'react';

interface NotificationProps {
  id: string;
  message: string;
  onDismiss: (id: string) => void;
  autoDismissMs?: number;
}

export function Notification({ id, message, onDismiss, autoDismissMs = 5000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // BUG: This closes over the initial 'id' value
      // When the component re-renders with a new id,
      // the timeout still references the old id
      onDismiss(id);
    }, autoDismissMs);

    // Missing cleanup! If id changes, the old timer still fires
    // with the captured (stale) id value
  }, []); // BUG: Empty dependency array means this only runs once

  return (
    <div className="notification" role="alert">
      <p>{message}</p>
      <button onClick={() => onDismiss(id)}>Dismiss</button>
    </div>
  );
}

// Parent component usage:
// const [notification, setNotification] = useState({ id: '1', message: 'Hello' });
// <Notification id={notification.id} message={notification.message} onDismiss={dismiss} />
// When setNotification({ id: '2', message: 'World' }) is called,
// the timer still dismisses id '1' instead of id '2'`,
    solution: `import React, { useEffect } from 'react';

interface NotificationProps {
  id: string;
  message: string;
  onDismiss: (id: string) => void;
  autoDismissMs?: number;
}

export function Notification({ id, message, onDismiss, autoDismissMs = 5000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, autoDismissMs);

    // Cleanup: clear old timer when id changes or component unmounts
    return () => clearTimeout(timer);
  }, [id, onDismiss, autoDismissMs]); // Include all dependencies

  return (
    <div className="notification" role="alert">
      <p>{message}</p>
      <button onClick={() => onDismiss(id)}>Dismiss</button>
    </div>
  );
}`,
    solutionExplanation:
      'The bug has two parts. First, the useEffect dependency array is empty ([]), meaning the effect only runs once on mount. When the id prop changes, the effect does not re-run, so the timeout callback still captures the original id value — this is a stale closure. Second, there is no cleanup function, so even if the dependencies were correct, old timers would not be cancelled when the component re-renders. The fix adds [id, onDismiss, autoDismissMs] to the dependency array so the effect re-runs when any of these change, and adds a cleanup function that calls clearTimeout to cancel the previous timer. This ensures each render gets a fresh timer with the current id value.',
    hints: [
      'Look at the useEffect dependency array. What values does the effect callback reference? What happens when those values change but the effect does not re-run?',
      'A useEffect with an empty dependency array runs once on mount. If the callback closes over props, it captures the initial values forever. Add the correct dependencies and a cleanup function.',
    ],
    testCases: [
      {
        input: 'render with id="1", wait 3s, re-render with id="2", wait 5s',
        expectedOutput: 'onDismiss called with "2" (not "1")',
        description: 'Timer resets with correct id when notification changes',
      },
      {
        input: 'render with id="1", unmount before 5s',
        expectedOutput: 'onDismiss is NOT called (timer cleaned up)',
        description: 'Timer is cleared on unmount to prevent memory leak',
      },
    ],
    tags: ['react', 'hooks', 'useEffect', 'stale-closure', 'debugging', 'closures'],
    estimatedMinutes: 10,
  },
  {
    id: 'fe-006',
    category: 'frontend',
    subcategory: 'react-internals',
    title: 'Custom Hook: useDebounce',
    difficulty: 3,
    type: 'CODE',
    description:
      'Implement a useDebounce custom hook that delays updating a value until a specified amount of time has passed since the last change. This is commonly used for search inputs to avoid making API calls on every keystroke. The hook should accept a value and a delay in milliseconds, and return the debounced value. It must properly clean up timers to prevent memory leaks.',
    starterCode: `import { useState, useEffect } from 'react';

/**
 * useDebounce - Returns a debounced version of the provided value.
 * The debounced value only updates after the specified delay has passed
 * without the value changing.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 *
 * Usage:
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 300);
 *   useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  // TODO: Implement the debounce logic
  // 1. Store the debounced value in state
  // 2. Set up a timer in useEffect that updates debounced value after delay
  // 3. Clear the timer on cleanup (when value or delay changes)
}`,
    solution: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
    solutionExplanation:
      'The hook maintains its own state (debouncedValue) initialized to the input value. A useEffect runs every time value or delay changes: it sets a timeout that will update debouncedValue after the specified delay. The cleanup function clears the timeout, which is critical — when value changes rapidly, each change clears the previous timer and starts a new one. Only when the value stops changing for the full delay duration does the timer fire and update the debounced state. The generic type parameter <T> makes the hook work with any value type (strings, numbers, objects). This pattern separates the debounce concern from the component, making it reusable across any input that needs debouncing.',
    hints: [
      'You need two things: useState to hold the debounced value, and useEffect to set a timer that updates it. The effect should depend on both value and delay.',
      'The cleanup function in useEffect is what makes it a debounce — clearing the previous timeout each time the value changes ensures only the last value within the delay window triggers an update.',
    ],
    testCases: [
      {
        input: 'useDebounce("hello", 300) — value does not change for 300ms',
        expectedOutput: '"hello" (debounced value updates after delay)',
        description: 'Returns debounced value after delay expires',
      },
      {
        input: 'Rapidly change value: "h", "he", "hel", "hell", "hello" within 300ms',
        expectedOutput: 'Only "hello" is returned as debounced value (intermediate values skipped)',
        description: 'Intermediate rapid changes are ignored, only final value emits',
      },
      {
        input: 'useDebounce("test", 500) — unmount component before 500ms',
        expectedOutput: 'No state update occurs (timer cleaned up)',
        description: 'Cleanup prevents state updates after unmount',
      },
    ],
    tags: ['react', 'hooks', 'custom-hook', 'debounce', 'useEffect', 'performance'],
    estimatedMinutes: 10,
  },
  {
    id: 'fe-007',
    category: 'frontend',
    subcategory: 'react-internals',
    title: 'React Reconciliation',
    difficulty: 4,
    type: 'EXPLAIN',
    description:
      'Explain how React\'s reconciliation algorithm (the "diffing" algorithm) works under the hood. Cover the two key heuristics React uses, the role of keys in list reconciliation, common pitfalls that cause unnecessary re-renders or broken state, and how the Fiber architecture changed the reconciliation process.',
    solution: `**React's Reconciliation Algorithm**

React's reconciliation is the process of comparing the previous virtual DOM tree with the new one to determine the minimum set of DOM mutations needed. It relies on two key heuristics to achieve O(n) complexity instead of the O(n³) of generic tree diffing:

**Heuristic 1: Different element types produce different trees.**
When the root element type changes (e.g., from <div> to <section>, or from <ComponentA> to <ComponentB>), React tears down the entire old subtree (unmounting all components, destroying DOM nodes) and builds the new subtree from scratch. It does not try to "morph" one type into another.

**Heuristic 2: Keys provide stable identity for elements in lists.**
When reconciling children of the same element, React uses keys to match old children with new children. Without keys, React compares children by index — which means inserting an item at the beginning causes every subsequent item to be "different" and re-render. With stable keys, React can identify which items moved, which were added, and which were removed, minimizing DOM operations.

**How diffing works step by step:**
1. Compare root elements. If type differs, replace entire subtree.
2. If same DOM element type (e.g., both <div>), compare attributes and update only changed ones.
3. If same component type, keep the instance alive, update props, and call render again. The component's state is preserved.
4. Recursively diff children using the key-based matching strategy.

**The role of keys:**
- Keys must be stable, unique among siblings, and predictable.
- Using array index as key breaks when items are reordered, inserted, or deleted — React thinks the item at index 0 is still the same component, so state carries over incorrectly.
- Using random values (Math.random()) as keys causes every render to unmount and remount all items, destroying state and hurting performance.
- The ideal key is a stable identifier from your data (database ID, unique slug).

**When reconciliation breaks:**
- Changing component identity by defining components inside render: each render creates a new function reference, so React sees a different "type" and unmounts/remounts.
- Using index keys with stateful list items that reorder.
- Wrapping components in dynamically-created higher-order components during render.

**Fiber Architecture:**
React Fiber (React 16+) rebuilt the reconciliation engine to support incremental rendering. Instead of recursively diffing the entire tree in one synchronous pass, Fiber breaks work into units (fibers) that can be paused, resumed, and prioritized. This enables concurrent features like Suspense, transitions, and time-slicing. Each fiber node represents a component instance and contains pointers to its child, sibling, and parent, forming a linked list that can be traversed incrementally.`,
    solutionExplanation:
      'This question tests deep understanding of React internals. The two heuristics (different types = different trees, keys provide identity) are the foundation. Strong answers explain why index keys break with reordering (state is tied to position, not identity), why defining components inside render causes remounting (new function = new type each render), and how Fiber changed reconciliation from a synchronous recursive process to an incremental, interruptible one. Mentioning practical implications — like why you should not use Math.random() as a key or define components inside render — shows the candidate can apply this knowledge to avoid real bugs.',
    hints: [
      'Start with the two heuristics: different element types produce different trees, and keys provide stable identity in lists. These give React O(n) complexity.',
      'For keys, explain what goes wrong with index keys when items reorder — state gets attached to the wrong items because React matches by position, not identity.',
    ],
    tags: ['react', 'reconciliation', 'virtual-dom', 'fiber', 'keys', 'performance', 'internals'],
    estimatedMinutes: 12,
  },
  {
    id: 'fe-008',
    category: 'frontend',
    subcategory: 'react-internals',
    title: 'Keys and Rendering Stability',
    difficulty: 3,
    type: 'DEBUG',
    description:
      'The following component renders a list of editable todo items. Users report that when they type in one input field and then add a new todo at the top of the list, the text they typed appears in the wrong input. This is a key-related bug. Find and fix it.',
    starterCode: `import React, { useState } from 'react';

interface Todo {
  id: number;
  text: string;
}

let nextId = 3;

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build app' },
  ]);

  const addTodoAtTop = () => {
    setTodos([{ id: nextId++, text: '' }, ...todos]);
  };

  const updateTodo = (index: number, newText: string) => {
    const updated = [...todos];
    updated[index] = { ...updated[index], text: newText };
    setTodos(updated);
  };

  const deleteTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <button onClick={addTodoAtTop}>Add Todo</button>
      <ul>
        {todos.map((todo, index) => (
          // BUG: Using index as key causes input state to be associated
          // with the array position rather than the actual todo item
          <li key={index}>
            <input
              value={todo.text}
              onChange={(e) => updateTodo(index, e.target.value)}
            />
            <button onClick={() => deleteTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
    solution: `import React, { useState } from 'react';

interface Todo {
  id: number;
  text: string;
}

let nextId = 3;

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build app' },
  ]);

  const addTodoAtTop = () => {
    setTodos([{ id: nextId++, text: '' }, ...todos]);
  };

  const updateTodo = (id: number, newText: string) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, text: newText } : todo));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div>
      <button onClick={addTodoAtTop}>Add Todo</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              value={todo.text}
              onChange={(e) => updateTodo(todo.id, e.target.value)}
            />
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
    solutionExplanation:
      'The bug is using the array index as the key prop. When a new todo is added at the top, all existing items shift down by one index. React uses keys to match old elements with new elements — with index keys, React thinks the element at index 0 is the same component that was previously at index 0, so it reuses its DOM state. This causes the input value from what was the first item to appear in the new first item. The fix is using todo.id as the key, which is a stable unique identifier. Additionally, updateTodo and deleteTodo should use the todo id instead of the array index, since the index is unreliable when items shift positions.',
    hints: [
      'When items are inserted at the beginning of a list, every item\'s index changes. If key={index}, React thinks each position contains the same component as before.',
      'Use a stable, unique identifier (like todo.id) as the key. Also update the event handlers to use id instead of index for correctness.',
    ],
    testCases: [
      {
        input: 'Type "hello" in first input, then click "Add Todo"',
        expectedOutput: 'New empty input appears at top, "hello" stays in the second input',
        description: 'Adding item at top preserves existing input values in correct positions',
      },
      {
        input: 'Have 3 todos, delete the middle one',
        expectedOutput: 'First and third todos remain with correct text',
        description: 'Deleting an item does not corrupt other items text',
      },
    ],
    tags: ['react', 'keys', 'lists', 'debugging', 'reconciliation', 'state'],
    estimatedMinutes: 10,
  },

  // ============================================
  // STATE MANAGEMENT (4 challenges)
  // ============================================
  {
    id: 'fe-009',
    category: 'frontend',
    subcategory: 'state-management',
    title: 'When NOT to Use Redux',
    difficulty: 3,
    type: 'EXPLAIN',
    description:
      'Many teams default to adding Redux (or similar global state managers) to every React project. Explain when global state management is unnecessary or even harmful, what problems it introduces, and what alternatives work better for different types of state. Provide concrete guidelines for deciding when global state is appropriate.',
    solution: `**When NOT to Use Global State Management:**

1. **Local UI state** — Modal open/close, form field values, accordion expanded state, hover/focus states. These belong to the component that owns them. Putting them in Redux adds boilerplate with zero benefit, and couples unrelated components to global state changes.

2. **Server state / cached data** — Data fetched from APIs (user lists, product catalogs) is not truly "application state" — it's a cache of server state. Tools like React Query (TanStack Query), SWR, or Apollo Client handle this far better than Redux because they manage caching, background refetching, optimistic updates, and stale-while-revalidate patterns out of the box. Duplicating server state in Redux leads to stale data bugs and complex synchronization logic.

3. **URL-derived state** — Current page, filters, search queries, pagination. This state belongs in the URL (via router params or query strings). Duplicating it in Redux means you have two sources of truth that can get out of sync. Use the router as your state manager for navigation-related state.

4. **Derived / computed state** — Values calculated from other state (e.g., filtered lists, total counts). These should be computed on render (useMemo) or via selectors, not stored separately in global state where they can become inconsistent.

**Problems with unnecessary global state:**
- **Indirection**: Simple "set a value" becomes action → action creator → dispatch → reducer → selector → component. A useState call is one line.
- **Performance**: Every dispatched action notifies all connected components. Without careful selector optimization, this causes unnecessary re-renders.
- **Tight coupling**: Components become dependent on the global store shape. Refactoring the store shape requires updating every consumer.
- **Testing complexity**: Components need a store provider wrapper in tests instead of just passing props.

**When global state IS appropriate:**
- Truly global UI state: current user/auth, theme, locale, feature flags
- State shared between many distant components with no common parent
- Complex state machines with many transitions (though useReducer + context works well too)
- Undo/redo or time-travel debugging requirements
- Offline-first apps that need a client-side database

**Decision framework:**
1. Start with local state (useState, useReducer)
2. For server data, use React Query or SWR
3. For shared state between nearby components, lift state up
4. For shared state between distant components, use Context + useReducer
5. Only reach for Redux/Zustand when you have genuinely complex global state that does not fit the above categories`,
    solutionExplanation:
      'This question tests state management maturity. Junior developers often put everything in Redux because it is what they learned. Senior developers understand that state has different categories (local UI, server cache, URL, derived) and each category has an ideal management approach. The strongest answers identify that server state tools like React Query have obsoleted a major Redux use case, that URL state belongs in the router, and that the overhead of global state (boilerplate, indirection, performance concerns, testing complexity) is only justified for truly global, client-side state like auth or theme.',
    hints: [
      'Think about the different categories of state: local UI state, server/cached data, URL state, derived state, and truly global state. Each has a different ideal management approach.',
      'Consider the overhead Redux adds: actions, reducers, selectors, store setup, provider wrappers in tests. When is this overhead justified vs. when is useState or useReducer sufficient?',
    ],
    tags: ['react', 'redux', 'state-management', 'react-query', 'architecture', 'best-practices'],
    estimatedMinutes: 10,
  },
  {
    id: 'fe-010',
    category: 'frontend',
    subcategory: 'state-management',
    title: 'Implement useReducer Shopping Cart',
    difficulty: 3,
    type: 'CODE',
    description:
      'Build a shopping cart using useReducer that supports adding items, removing items, updating quantities, and computing the total. The reducer should handle four action types: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, and CLEAR_CART. When adding an item that already exists, increment its quantity instead of creating a duplicate.',
    starterCode: `import { useReducer } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

// TODO: Define action types
type CartAction =
  | { type: 'ADD_ITEM'; payload: { id: string; name: string; price: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

// TODO: Implement the reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      // If item exists, increment quantity. Otherwise add with quantity 1.
      break;
    case 'REMOVE_ITEM':
      // Remove item by id
      break;
    case 'UPDATE_QUANTITY':
      // Update quantity for item. If quantity <= 0, remove it.
      break;
    case 'CLEAR_CART':
      // Reset to empty cart
      break;
    default:
      return state;
  }
}

// TODO: Implement the hook
export function useShoppingCart() {
  // Use useReducer with cartReducer
  // Return state, dispatch helpers, and computed total
  // Helpers: addItem, removeItem, updateQuantity, clearCart
  // Computed: total, itemCount
}`,
    solution: `import { useReducer, useMemo } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { id: string; name: string; price: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingIndex >= 0) {
        const updatedItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return { ...state, items: updatedItems };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
}

export function useShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = (id: string, name: string, price: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { id, name, price } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const total = useMemo(
    () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.items]
  );

  const itemCount = useMemo(
    () => state.items.reduce((count, item) => count + item.quantity, 0),
    [state.items]
  );

  return {
    items: state.items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}`,
    solutionExplanation:
      'The reducer handles four action types with immutable state updates. ADD_ITEM checks if the item already exists by id — if so, it maps over items and increments the matching item\'s quantity; otherwise, it appends a new item with quantity 1. REMOVE_ITEM filters out the item by id. UPDATE_QUANTITY maps over items to update the matching one, but if the new quantity is 0 or less, it removes the item entirely (using filter). CLEAR_CART returns an empty items array. The useShoppingCart hook wraps the reducer with convenience methods and computes the total and item count using useMemo for efficiency. This pattern encapsulates all cart logic in a reusable hook with a clean API.',
    hints: [
      'For ADD_ITEM, first check if the item already exists using findIndex. If it does, map over items and increment that item\'s quantity. If not, spread the payload with quantity: 1 into the array.',
      'For UPDATE_QUANTITY, handle the edge case where quantity is 0 or negative by removing the item entirely instead of keeping it with zero quantity.',
    ],
    testCases: [
      {
        input: 'addItem("1", "Shirt", 25); addItem("1", "Shirt", 25)',
        expectedOutput: 'items: [{ id: "1", name: "Shirt", price: 25, quantity: 2 }], total: 50',
        description: 'Adding the same item twice increments quantity instead of duplicating',
      },
      {
        input: 'addItem("1", "Shirt", 25); addItem("2", "Pants", 40); removeItem("1")',
        expectedOutput: 'items: [{ id: "2", name: "Pants", price: 40, quantity: 1 }], total: 40',
        description: 'Removing an item filters it from the cart',
      },
      {
        input: 'addItem("1", "Shirt", 25); updateQuantity("1", 0)',
        expectedOutput: 'items: [], total: 0',
        description: 'Setting quantity to 0 removes the item',
      },
    ],
    tags: ['react', 'useReducer', 'state-management', 'hooks', 'shopping-cart'],
    estimatedMinutes: 20,
  },
  {
    id: 'fe-011',
    category: 'frontend',
    subcategory: 'state-management',
    title: 'Custom Context with Selector Pattern',
    difficulty: 4,
    type: 'CODE',
    description:
      'Build a custom state management solution using React Context that avoids the common performance pitfall of re-rendering all consumers when any part of the context value changes. Implement a createSelectableContext factory that returns a Provider and a useSelector hook. The useSelector hook should only trigger a re-render when the selected slice of state changes, using useRef and useSyncExternalStore internally.',
    starterCode: `import React, { useRef, useCallback, createContext, useContext, ReactNode } from 'react';

// TODO: Implement createSelectableContext
// It should return:
// 1. A Provider component that accepts a 'value' prop
// 2. A useSelector hook: useSelector(selector) that only re-renders
//    when the selected value changes (by reference equality)

type Selector<T, R> = (state: T) => R;
type Listener = () => void;

export function createSelectableContext<T>() {
  // TODO: Create a store-like wrapper that tracks subscribers
  // and only notifies them when their selected value changes

  // Provider component
  function Provider({ value, children }: { value: T; children: ReactNode }) {
    // Store the latest value in a ref
    // Notify all subscribers when value changes
  }

  // useSelector hook
  function useSelector<R>(selector: Selector<T, R>): R {
    // Subscribe to store changes
    // Only re-render if selector(newState) !== selector(oldState)
  }

  return { Provider, useSelector };
}

// Usage example:
// const { Provider, useSelector } = createSelectableContext<AppState>();
//
// function App() {
//   return <Provider value={state}><Children /></Provider>;
// }
//
// function UserName() {
//   const name = useSelector(state => state.user.name);
//   // Only re-renders when state.user.name changes
// }`,
    solution: `import React, {
  useRef,
  useCallback,
  useEffect,
  createContext,
  useContext,
  useSyncExternalStore,
  ReactNode,
} from 'react';

type Selector<T, R> = (state: T) => R;
type Listener = () => void;

export function createSelectableContext<T>() {
  // We use a context to pass a store object (not the value directly)
  const StoreContext = createContext<{
    getState: () => T;
    subscribe: (listener: Listener) => () => void;
  } | null>(null);

  function Provider({ value, children }: { value: T; children: ReactNode }) {
    const storeRef = useRef(value);
    const listenersRef = useRef(new Set<Listener>());

    // Update the ref on each render so getState always returns latest
    storeRef.current = value;

    // Notify all subscribers after value changes
    useEffect(() => {
      listenersRef.current.forEach(listener => listener());
    });

    // Stable store object — never changes reference, so context consumers
    // do NOT re-render when value changes
    const store = useRef({
      getState: () => storeRef.current,
      subscribe: (listener: Listener) => {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
    }).current;

    return (
      <StoreContext.Provider value={store}>
        {children}
      </StoreContext.Provider>
    );
  }

  function useSelector<R>(selector: Selector<T, R>): R {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error('useSelector must be used within the Provider');
    }

    return useSyncExternalStore(
      store.subscribe,
      () => selector(store.getState())
    );
  }

  return { Provider, useSelector };
}`,
    solutionExplanation:
      'The key insight is that React Context re-renders ALL consumers whenever the context value changes by reference. To avoid this, we make the context value a stable store object (created once via useRef) that never changes reference. The store provides getState() and subscribe() methods — the same interface that useSyncExternalStore expects. The Provider updates a ref with the latest value and notifies listeners via useEffect. Each useSelector call uses useSyncExternalStore, which subscribes to the store and only triggers a re-render when the return value of the selector function changes. This gives us Redux-like selector performance without the Redux boilerplate. The useSyncExternalStore hook is the React 18+ approved way to subscribe to external stores, handling concurrent mode edge cases correctly.',
    hints: [
      'The trick is to NOT put the actual value in context. Instead, put a stable store object with getState() and subscribe() methods. The context value reference never changes, so consumers do not re-render from context changes.',
      'Use useSyncExternalStore from React 18 — it takes a subscribe function and a getSnapshot function. The subscribe function registers a listener; the getSnapshot returns the current selected value.',
    ],
    testCases: [
      {
        input: 'const { Provider, useSelector } = createSelectableContext<{a: number, b: number}>(); Component A selects state.a, Component B selects state.b. Update only state.a.',
        expectedOutput: 'Component A re-renders, Component B does NOT re-render',
        description: 'Only components whose selected slice changed re-render',
      },
      {
        input: 'useSelector(state => state.user.name) when state.user.name is unchanged but state.count changes',
        expectedOutput: 'Component does NOT re-render',
        description: 'Selector returning same value prevents unnecessary re-render',
      },
      {
        input: 'useSelector outside of Provider',
        expectedOutput: 'Throws Error: "useSelector must be used within the Provider"',
        description: 'Throws error when used outside provider',
      },
    ],
    tags: ['react', 'context', 'performance', 'useSyncExternalStore', 'selectors', 'advanced'],
    estimatedMinutes: 25,
  },
  {
    id: 'fe-012',
    category: 'frontend',
    subcategory: 'state-management',
    title: 'Server vs Client Components',
    difficulty: 4,
    type: 'SCENARIO',
    description:
      'You are building a Next.js 14+ application and need to decide which components should be Server Components and which should be Client Components. Walk through a product page that displays product details (from DB), user reviews (from DB), an "Add to Cart" button (interactive), and a review submission form (interactive with validation). Explain your decisions and the data flow.',
    scenario:
      'Your team is migrating a React SPA to Next.js App Router. The product page has: a product image gallery, product details (name, price, description from DB), a list of reviews (from DB), star rating filter (interactive), "Add to Cart" button with quantity selector (interactive), and a "Write Review" form (interactive). The page should be SEO-friendly and fast on first load.',
    solution: `**Component Breakdown and Decision Rationale:**

\`\`\`
app/products/[id]/page.tsx          → Server Component (page-level data fetching)
├── ProductImageGallery             → Client Component (interactive: zoom, carousel)
├── ProductDetails                  → Server Component (static display from DB)
│   └── AddToCartButton             → Client Component (needs onClick, state for quantity)
├── ReviewsSection                  → Server Component (fetches reviews from DB)
│   ├── ReviewFilter                → Client Component (interactive star filter)
│   └── ReviewList                  → Server Component (renders review data)
│       └── ReviewCard              → Server Component (static display)
└── WriteReviewForm                 → Client Component (form state, validation, submission)
\`\`\`

**Decision Framework Applied:**

**Server Components (default):** ProductDetails, ReviewsSection, ReviewList, ReviewCard
- These only display data — no event handlers, no useState, no browser APIs
- They can directly query the database without an API layer
- They send zero JavaScript to the client, reducing bundle size
- They render to HTML on the server for instant display and SEO

**Client Components (opt-in with 'use client'):** ProductImageGallery, AddToCartButton, ReviewFilter, WriteReviewForm
- These need interactivity: onClick, onChange, useState, useEffect
- They still get server-side rendered on first load (SSR), but their JS bundle is sent to the client for hydration

**Data Flow:**

\`\`\`typescript
// app/products/[id]/page.tsx (Server Component)
export default async function ProductPage({ params }: { params: { id: string } }) {
  // Direct database access — no API needed
  const product = await db.products.findById(params.id);
  const reviews = await db.reviews.findByProduct(params.id);

  return (
    <main>
      <ProductImageGallery images={product.images} />  {/* serializable props */}
      <ProductDetails product={product} />
      <AddToCartButton productId={product.id} price={product.price} />
      <ReviewsSection reviews={reviews} productId={product.id} />
    </main>
  );
}
\`\`\`

**Key Rules:**
1. Server Components cannot use hooks or event handlers
2. Client Components cannot be async or access server-only resources
3. Server Components can import Client Components (but not vice versa)
4. Props passed from Server to Client Components must be serializable (no functions, classes, or Dates)
5. The 'use client' directive creates a boundary — everything imported by a client component is also client code

**Performance Wins:**
- Product details and review cards send 0 KB of JS (server-rendered only)
- Only interactive components (gallery, cart button, filter, form) contribute to the JS bundle
- Database queries happen at the edge, close to the data source
- The page is fully rendered HTML on first load — great for SEO and LCP`,
    solutionExplanation:
      'This scenario tests understanding of the Next.js App Router server/client component model. The key principle is "server by default, client when interactive." Components that only display data should be Server Components (zero JS sent to client, direct DB access). Components that need event handlers, state, or browser APIs must be Client Components. The strongest answers correctly identify the boundary — a Server Component page that passes serializable data down to Client Component islands of interactivity. Mentioning the serialization constraint (cannot pass functions as props from server to client) and the import direction rule (server can import client, not vice versa) shows deep understanding.',
    hints: [
      'The default in Next.js App Router is Server Components. Only add "use client" when a component needs hooks (useState, useEffect), event handlers (onClick, onChange), or browser APIs.',
      'Think about the data flow: the page-level Server Component fetches all data and passes serializable props down. Client Components receive plain data (strings, numbers, arrays of objects) — not functions or class instances.',
      'Consider the component tree boundary: when you mark a component as "use client", everything it imports also becomes client code. Keep client boundaries as low in the tree as possible.',
    ],
    tags: ['nextjs', 'server-components', 'client-components', 'app-router', 'architecture', 'performance'],
    estimatedMinutes: 20,
  },

  // ============================================
  // PERFORMANCE (3 challenges)
  // ============================================
  {
    id: 'fe-013',
    category: 'frontend',
    subcategory: 'performance',
    title: 'Performance Anti-Patterns',
    difficulty: 4,
    type: 'REVIEW',
    description:
      'Review the following React component for performance issues. The component renders a product catalog page that displays a filterable list of products. It has multiple performance anti-patterns causing unnecessary re-renders and slow rendering. Identify all the issues.',
    starterCode: `import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
  onClick: (id: string) => void;
}

function ProductCard({ product, onClick }: ProductCardProps) {
  console.log('ProductCard render:', product.name);
  return (
    <div
      className="product-card"
      // Issue: inline object style created every render
      style={{ border: '1px solid gray', padding: '16px', margin: '8px' }}
      onClick={() => onClick(product.id)}
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>\${product.price}</p>
    </div>
  );
}

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // Issue: filtering and sorting on every render without memoization
  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    );

  // Issue: new function reference every render, causing child re-renders
  const handleProductClick = (id: string) => {
    console.log('Clicked product:', id);
  };

  // Issue: new array reference every render for no reason
  const categories = products.map(p => p.category);
  const uniqueCategories = [...new Set(categories)];

  return (
    <div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Search products..."
      />
      <select onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
        <option value="asc">Price: Low to High</option>
        <option value="desc">Price: High to Low</option>
      </select>
      <div>
        {/* Issue: no key warning, using index would also be bad */}
        {uniqueCategories.map(cat => (
          <span key={cat} className="category-tag">{cat}</span>
        ))}
      </div>
      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            // Issue: inline arrow function creates new reference each render
            onClick={handleProductClick}
          />
        ))}
      </div>
    </div>
  );
}`,
    solution: `import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
  onClick: (id: string) => void;
}

// Fix 1: Memoize ProductCard to skip re-render when props haven't changed
const ProductCard = memo(function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      className="product-card"
      onClick={() => onClick(product.id)}
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>\${product.price}</p>
    </div>
  );
});

// Fix 2: Move static styles outside component to avoid recreating on every render
const cardStyle = { border: '1px solid gray', padding: '16px', margin: '8px' };

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // Fix 3: Memoize expensive filter + sort computation
  const filteredProducts = useMemo(
    () =>
      products
        .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) =>
          sortOrder === 'asc' ? a.price - b.price : b.price - a.price
        ),
    [products, filter, sortOrder]
  );

  // Fix 4: Stabilize callback reference with useCallback
  const handleProductClick = useCallback((id: string) => {
    console.log('Clicked product:', id);
  }, []);

  // Fix 5: Memoize derived data
  const uniqueCategories = useMemo(
    () => [...new Set(products.map(p => p.category))],
    [products]
  );

  return (
    <div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Search products..."
      />
      <select onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
        <option value="asc">Price: Low to High</option>
        <option value="desc">Price: High to Low</option>
      </select>
      <div>
        {uniqueCategories.map(cat => (
          <span key={cat} className="category-tag">{cat}</span>
        ))}
      </div>
      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={handleProductClick}
          />
        ))}
      </div>
    </div>
  );
}`,
    solutionExplanation:
      'The original code has five performance anti-patterns. First, ProductCard is not memoized, so it re-renders whenever the parent re-renders even if its props have not changed — wrapping it in React.memo fixes this. Second, the inline style object in JSX creates a new reference every render, which can defeat memo — moving it to a constant outside the component gives it a stable reference. Third, the filtering and sorting of products runs on every render even when the inputs have not changed — useMemo with the correct dependencies skips the computation when possible. Fourth, handleProductClick is re-created every render, giving ProductCard a new onClick prop reference each time — useCallback stabilizes it. Fifth, uniqueCategories is recomputed from scratch every render — useMemo ensures it only recalculates when products changes.',
    hints: [
      'Look at what happens when the filter input changes: which computations re-run? Which components re-render? Are any of those re-renders unnecessary?',
      'Check for new object/array/function references being created on every render. These defeat React.memo and cause child components to re-render unnecessarily.',
      'Consider which values should be memoized with useMemo (expensive computations, derived data) and which callbacks should be stabilized with useCallback.',
    ],
    reviewIssues: [
      {
        id: 'perf-001',
        description: 'ProductCard is not wrapped in React.memo, causing re-renders when parent state changes even though its props may be unchanged',
        severity: 'major',
        line: 14,
      },
      {
        id: 'perf-002',
        description: 'Inline style object {{ border: "1px solid gray", ... }} creates a new reference every render, which defeats React.memo on ProductCard',
        severity: 'minor',
        line: 19,
      },
      {
        id: 'perf-003',
        description: 'filteredProducts computed without useMemo — filter and sort run on every render even when products, filter, and sortOrder have not changed',
        severity: 'major',
        line: 42,
      },
      {
        id: 'perf-004',
        description: 'handleProductClick creates a new function reference every render, causing all ProductCard components to re-render even with React.memo',
        severity: 'major',
        line: 49,
      },
      {
        id: 'perf-005',
        description: 'uniqueCategories is derived data recomputed every render — should be memoized with useMemo depending on [products]',
        severity: 'minor',
        line: 53,
      },
    ],
    tags: ['react', 'performance', 'React.memo', 'useMemo', 'useCallback', 'code-review'],
    estimatedMinutes: 15,
  },
  {
    id: 'fe-014',
    category: 'frontend',
    subcategory: 'performance',
    title: 'Infinite Re-render Loop',
    difficulty: 3,
    type: 'DEBUG',
    description:
      'The following component fetches user data and formats it for display. When you open the page, it immediately causes an infinite re-render loop that freezes the browser. Identify the cause of the infinite loop and fix it without changing the component behavior.',
    starterCode: `import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface FormattedUser {
  id: string;
  displayName: string;
  email: string;
}

function formatUser(user: User): FormattedUser {
  return {
    id: user.id,
    displayName: \`\${user.firstName} \${user.lastName}\`,
    email: user.email,
  };
}

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [formattedUser, setFormattedUser] = useState<FormattedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    setLoading(true);
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  // BUG: This effect causes an infinite loop
  // Every render, it sets formattedUser to a new object,
  // which triggers a re-render, which runs this effect again...
  useEffect(() => {
    if (user) {
      // formatUser returns a new object every call
      setFormattedUser(formatUser(user));
    }
  }); // Missing dependency array!

  if (loading) return <div>Loading...</div>;
  if (!formattedUser) return <div>No user found</div>;

  return (
    <div>
      <h1>{formattedUser.displayName}</h1>
      <p>{formattedUser.email}</p>
    </div>
  );
}`,
    solution: `import React, { useState, useEffect, useMemo } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface FormattedUser {
  id: string;
  displayName: string;
  email: string;
}

function formatUser(user: User): FormattedUser {
  return {
    id: user.id,
    displayName: \`\${user.firstName} \${user.lastName}\`,
    email: user.email,
  };
}

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  // Fix: Derive formatted user with useMemo instead of effect + state
  const formattedUser = useMemo(
    () => (user ? formatUser(user) : null),
    [user]
  );

  if (loading) return <div>Loading...</div>;
  if (!formattedUser) return <div>No user found</div>;

  return (
    <div>
      <h1>{formattedUser.displayName}</h1>
      <p>{formattedUser.email}</p>
    </div>
  );
}`,
    solutionExplanation:
      'The infinite loop is caused by the second useEffect having no dependency array. Without a dependency array, useEffect runs after EVERY render. Each time it runs, it calls setFormattedUser with a new object (formatUser always returns a new reference), which triggers a re-render, which runs the effect again, ad infinitum. The quick fix would be adding [user] as the dependency array, but the better fix eliminates the unnecessary state entirely. formattedUser is derived data — it is a pure transformation of user. It should be computed with useMemo, not stored in a separate state variable synchronized via useEffect. This is a common anti-pattern called "syncing state with effects" — when you find yourself using useEffect to keep one state variable in sync with another, the answer is usually useMemo or computing the value directly during render.',
    hints: [
      'Look at the second useEffect — what happens when it has no dependency array? It runs after every render. What happens when it calls setState inside?',
      'Consider whether formattedUser needs to be state at all. It is derived from user — could you compute it directly during render using useMemo?',
    ],
    testCases: [
      {
        input: 'render(<UserProfile userId="1" />) with successful API response',
        expectedOutput: 'Component renders once after data loads (no infinite loop)',
        description: 'Component renders without infinite re-render loop',
      },
      {
        input: 'change userId from "1" to "2"',
        expectedOutput: 'Fetches new user and displays updated formatted data',
        description: 'Changing userId correctly re-fetches and re-formats data',
      },
    ],
    tags: ['react', 'useEffect', 'debugging', 'infinite-loop', 'performance', 'derived-state'],
    estimatedMinutes: 10,
  },
  {
    id: 'fe-015',
    category: 'frontend',
    subcategory: 'performance',
    title: 'Virtual List Implementation',
    difficulty: 4,
    type: 'CODE',
    description:
      'Implement a basic virtualized list component (windowed rendering) that only renders the visible items plus a small buffer. Given a list of 10,000 items where each item has a fixed height, the component should calculate which items are visible in the viewport and only render those, dramatically reducing DOM node count. The component should handle scrolling smoothly.',
    starterCode: `import React, { useState, useRef, useCallback } from 'react';

interface VirtualListProps {
  items: string[];
  itemHeight: number;      // Fixed height per item in pixels
  containerHeight: number; // Visible viewport height in pixels
  overscan?: number;       // Extra items to render above/below viewport
  renderItem: (item: string, index: number) => React.ReactNode;
}

export function VirtualList({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
  renderItem,
}: VirtualListProps) {
  // TODO:
  // 1. Track scroll position with state or ref
  // 2. Calculate total height (items.length * itemHeight)
  // 3. Calculate visible range: startIndex and endIndex
  // 4. Apply overscan buffer
  // 5. Render only visible items, positioned absolutely or with top padding
  // 6. Handle onScroll to update visible range

  return (
    <div>
      {/* Implement virtual scrolling container */}
    </div>
  );
}`,
    solution: `import React, { useState, useRef, useCallback } from 'react';

interface VirtualListProps {
  items: string[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  renderItem: (item: string, index: number) => React.ReactNode;
}

export function VirtualList({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
  renderItem,
}: VirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);

  // Calculate visible range with overscan buffer
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor(scrollTop / itemHeight) + visibleCount + overscan
  );

  // Slice only the visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Offset to position the visible items correctly
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      {/* Spacer div to create correct scrollbar size */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Positioned container for visible items */}
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, i) => (
            <div
              key={startIndex + i}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
    solutionExplanation:
      'The virtual list works by maintaining a scrollable container whose inner content div is sized to the total height of all items (creating the correct scrollbar). On scroll, we calculate which items are visible by dividing scrollTop by itemHeight to find the first visible index, then adding the visible count (containerHeight / itemHeight) to find the last. The overscan buffer adds extra items above and below the viewport so scrolling feels smooth — without it, items would pop in at the edges. Only the visible items (plus buffer) are rendered, positioned absolutely at the correct offset. For 10,000 items with 20 visible, this reduces DOM nodes from 10,000 to roughly 26 (20 + 2 * 3 overscan). The key prop uses startIndex + i to maintain stable identity as items scroll in and out of view.',
    hints: [
      'Calculate the total scrollable height (items.length * itemHeight) and create an inner div of that size. This gives the correct scrollbar behavior without rendering all items.',
      'Track scrollTop in state via the onScroll event. From scrollTop, compute startIndex = Math.floor(scrollTop / itemHeight). Add containerHeight / itemHeight to get the end index. Apply overscan as a buffer on both ends.',
    ],
    testCases: [
      {
        input: 'VirtualList({ items: Array(10000), itemHeight: 40, containerHeight: 400, renderItem: (item, i) => <div>{i}</div> })',
        expectedOutput: 'Only ~16 DOM nodes rendered (10 visible + 6 overscan), scrollbar represents 10000 items',
        description: 'Renders only visible items plus overscan buffer',
      },
      {
        input: 'Scroll to position 4000 (item index ~100)',
        expectedOutput: 'Items around index 97-113 are rendered, items 0-96 are not in DOM',
        description: 'Scrolling updates the visible window correctly',
      },
      {
        input: 'VirtualList with 5 items total, containerHeight fits all items',
        expectedOutput: 'All 5 items rendered (no virtualization needed for small lists)',
        description: 'Works correctly when all items fit in viewport',
      },
    ],
    tags: ['react', 'virtualization', 'performance', 'windowing', 'large-lists', 'scrolling'],
    estimatedMinutes: 25,
  },

  // ============================================
  // ACCESSIBILITY (2 challenges)
  // ============================================
  {
    id: 'fe-016',
    category: 'frontend',
    subcategory: 'accessibility',
    title: 'Accessibility Audit',
    difficulty: 3,
    type: 'REVIEW',
    description:
      'Review the following login form component for accessibility issues. The form is functional but has multiple WCAG violations that would make it difficult or impossible for screen reader users, keyboard-only users, and users with visual impairments to use.',
    starterCode: `import React, { useState } from 'react';

export function LoginForm({ onSubmit }: { onSubmit: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    onSubmit(email, password);
  };

  return (
    <div>
      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Login</div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <div>Email</div>
        <input
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email"
        />
      </div>

      <div>
        <div>Password</div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter password"
        />
      </div>

      <div onClick={handleSubmit} style={{
        background: 'blue',
        color: 'white',
        padding: '8px 16px',
        cursor: 'pointer',
        display: 'inline-block',
      }}>
        Log In
      </div>

      <div>
        <span onClick={() => window.location.href = '/forgot-password'}
              style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
          Forgot password?
        </span>
      </div>
    </div>
  );
}`,
    solution: `import React, { useState, useRef, useEffect } from 'react';

export function LoginForm({ onSubmit }: { onSubmit: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} aria-labelledby="login-heading">
      <h1 id="login-heading">Login</h1>

      {error && (
        <div
          ref={errorRef}
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          style={{ color: '#d32f2f' }}
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email-input">Email</label>
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          aria-required="true"
          aria-describedby={error ? 'form-error' : undefined}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password-input">Password</label>
        <input
          id="password-input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          aria-required="true"
          autoComplete="current-password"
        />
      </div>

      <button type="submit">Log In</button>

      <div>
        <a href="/forgot-password">Forgot password?</a>
      </div>
    </form>
  );
}`,
    solutionExplanation:
      'The original form has numerous accessibility violations. The heading uses a styled div instead of a semantic h1 element. Labels are plain divs not associated with inputs — screen readers cannot announce what each field is for. The submit button is a div with an onClick handler, making it unreachable by keyboard and invisible to assistive technology. The forgot password link is a span with onClick instead of an anchor tag, again unreachable by keyboard. The error message has no role="alert" so screen readers will not announce it. The email input uses type="text" instead of type="email". The form itself is a div, not a form element, so Enter key submission does not work. The fix uses semantic HTML (form, h1, label with htmlFor, button, a), ARIA attributes for dynamic content, and proper input types.',
    hints: [
      'Look at each interactive element: can it be reached and activated with only a keyboard (Tab, Enter, Space)? If not, it needs to be a semantic interactive element (button, a) not a div with onClick.',
      'Check if each input has a properly associated label element. Screen readers announce the label text when the user focuses an input — without this association, the input is unlabeled.',
      'When the error message appears dynamically, does the screen reader announce it? Consider role="alert" and aria-live for dynamic content.',
    ],
    reviewIssues: [
      {
        id: 'a11y-001',
        description: 'Heading is a styled <div> instead of a semantic <h1>. Screen readers cannot identify it as a heading for navigation.',
        severity: 'major',
        line: 18,
      },
      {
        id: 'a11y-002',
        description: 'Error message has no role="alert" or aria-live attribute. Screen readers will not announce dynamic error messages.',
        severity: 'critical',
        line: 20,
      },
      {
        id: 'a11y-003',
        description: 'Labels are plain <div> elements not associated with inputs via <label htmlFor>. Screen readers cannot determine what each input is for.',
        severity: 'critical',
        line: 23,
      },
      {
        id: 'a11y-004',
        description: 'Email input uses type="text" instead of type="email", losing input validation and mobile keyboard optimization.',
        severity: 'minor',
        line: 25,
      },
      {
        id: 'a11y-005',
        description: 'Submit button is a <div> with onClick. It is not focusable by keyboard, not announced as a button by screen readers, and cannot be activated with Enter/Space.',
        severity: 'critical',
        line: 40,
      },
      {
        id: 'a11y-006',
        description: 'Forgot password link is a <span> with onClick instead of an <a> tag. It is not keyboard accessible and not announced as a link.',
        severity: 'major',
        line: 49,
      },
      {
        id: 'a11y-007',
        description: 'Form uses a <div> wrapper instead of a <form> element. Enter key submission does not work, and the form is not identified as a form landmark for screen readers.',
        severity: 'major',
        line: 17,
      },
    ],
    tags: ['accessibility', 'a11y', 'WCAG', 'semantic-html', 'screen-readers', 'forms'],
    estimatedMinutes: 15,
  },
  {
    id: 'fe-017',
    category: 'frontend',
    subcategory: 'accessibility',
    title: 'Accessible Modal Dialog',
    difficulty: 2,
    type: 'CODE',
    description:
      'Build an accessible modal dialog component that follows WAI-ARIA dialog pattern requirements. The modal must trap focus within itself when open (Tab cycles through focusable elements inside the modal), return focus to the trigger element when closed, close on Escape key press, and have proper ARIA attributes (role="dialog", aria-modal, aria-labelledby).',
    starterCode: `import React, { useRef, useEffect, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // TODO: Implement refs for the modal and the previously focused element
  // TODO: Trap focus inside modal when open
  // TODO: Return focus when modal closes
  // TODO: Handle Escape key to close
  // TODO: Add proper ARIA attributes

  if (!isOpen) return null;

  return (
    <div>
      {/* Backdrop */}
      <div onClick={onClose} />
      {/* Modal content */}
      <div>
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}`,
    solution: `import React, { useRef, useEffect, useCallback, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element and focus the modal when it opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the modal or first focusable element
      const modal = modalRef.current;
      if (modal) {
        const firstFocusable = modal.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          modal.focus();
        }
      }
    } else {
      // Return focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Handle Escape key and focus trapping
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if on first element, wrap to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose} aria-label="Close dialog">
          Close
        </button>
      </div>
    </div>
  );
}`,
    solutionExplanation:
      'The accessible modal implements four critical behaviors. First, focus management: when the modal opens, we store the previously focused element and move focus to the first focusable element inside the modal. When it closes, we restore focus to the trigger element. Second, focus trapping: the Tab key handler detects when focus is on the first or last focusable element and wraps it around, preventing focus from escaping the modal. Third, the Escape key handler calls onClose so keyboard users can dismiss the modal. Fourth, ARIA attributes: role="dialog" identifies the element as a dialog, aria-modal="true" tells assistive technology that content outside is inert, and aria-labelledby points to the title element so screen readers announce the dialog purpose. The backdrop has aria-hidden="true" since it is decorative.',
    hints: [
      'Store document.activeElement in a ref when the modal opens, and call .focus() on it when the modal closes. This returns the user to where they were before the modal opened.',
      'For focus trapping, query all focusable elements inside the modal. On Tab at the last element, preventDefault and focus the first. On Shift+Tab at the first element, focus the last.',
    ],
    testCases: [
      {
        input: 'Open modal, press Tab repeatedly',
        expectedOutput: 'Focus cycles through focusable elements inside modal and wraps around (never leaves modal)',
        description: 'Focus is trapped within the modal',
      },
      {
        input: 'Open modal, press Escape',
        expectedOutput: 'Modal closes and focus returns to the button that opened it',
        description: 'Escape key closes modal and restores focus',
      },
      {
        input: 'Screen reader reads the modal',
        expectedOutput: 'Announces "dialog" role and reads the title via aria-labelledby',
        description: 'Proper ARIA attributes for screen reader announcement',
      },
    ],
    tags: ['accessibility', 'a11y', 'modal', 'focus-trap', 'aria', 'keyboard-navigation'],
    estimatedMinutes: 20,
  },

  // ============================================
  // TESTING (1 challenge)
  // ============================================
  {
    id: 'fe-018',
    category: 'frontend',
    subcategory: 'testing',
    title: 'Testing Strategy for React Components',
    difficulty: 3,
    type: 'EXPLAIN',
    description:
      'Explain a comprehensive testing strategy for React components. Cover what to test vs. what not to test, the testing trophy (unit, integration, e2e), why testing behavior is better than testing implementation details, and how React Testing Library enforces this philosophy. Provide concrete examples of good vs. bad tests.',
    solution: `**The Testing Trophy (Kent C. Dodds Model):**

From bottom to top:
1. **Static analysis** (TypeScript, ESLint) — catches typos, type errors, unused imports. Free and fast.
2. **Unit tests** — test pure functions and hooks in isolation. Fast but low confidence in integration.
3. **Integration tests** — test components as users use them. Best balance of confidence vs. cost. THIS IS WHERE MOST TESTS SHOULD LIVE.
4. **E2E tests** (Cypress, Playwright) — test full user flows. Highest confidence but slowest and most brittle.

**What to Test:**
- User-visible behavior: "When I type in the search box and press Enter, results appear"
- Component contracts: "When passed an error prop, the error message is displayed"
- Edge cases: empty states, loading states, error states
- Accessibility: elements have correct roles, labels are associated with inputs
- Integration between components: "When I add an item to cart, the cart count updates"

**What NOT to Test:**
- Implementation details: internal state values, lifecycle method calls, specific DOM structure
- Third-party library internals (React itself, router, state management library)
- Styles/CSS (use visual regression tools instead)
- Private methods or internal component structure

**Good vs. Bad Tests:**

BAD (testing implementation details):
\`\`\`typescript
// Tests internal state — breaks if you refactor state shape
test('sets isOpen to true', () => {
  const { result } = renderHook(() => useModal());
  act(() => result.current.open());
  expect(result.current.isOpen).toBe(true);
});

// Tests that a specific function was called — breaks if you change how click works
test('calls handleClick on button press', () => {
  const spy = jest.spyOn(component, 'handleClick');
  fireEvent.click(button);
  expect(spy).toHaveBeenCalled();
});
\`\`\`

GOOD (testing behavior):
\`\`\`typescript
// Tests what the user sees
test('opens modal when trigger is clicked', () => {
  render(<ModalDialog />);
  fireEvent.click(screen.getByRole('button', { name: /open/i }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

// Tests the component contract
test('displays error message when submission fails', async () => {
  server.use(rest.post('/api/submit', (req, res, ctx) => res(ctx.status(500))));
  render(<Form />);
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
});
\`\`\`

**React Testing Library Philosophy:**
RTL provides queries that reflect how users interact with the page: getByRole, getByLabelText, getByText, getByPlaceholderText. These queries break when accessibility is broken (e.g., getByRole('button') fails if you used a div instead of a button). This means your tests pass when the component works for users and fail when it doesn't — regardless of how the internals are structured.

**Priority of queries (from RTL docs):**
1. getByRole — the most accessible, works with ARIA roles
2. getByLabelText — for form fields
3. getByText — for non-interactive content
4. getByTestId — last resort, use sparingly

**Testing Custom Hooks:**
Use renderHook from @testing-library/react. Test the hook's public API, not its internal state. If the hook is simple, test it through a component instead.

**Test Arrangement:**
Follow the Arrange-Act-Assert pattern:
- Arrange: render the component, set up mock data
- Act: simulate user interactions (click, type, submit)
- Assert: check what the user would see (text, elements, navigation)`,
    solutionExplanation:
      'This question evaluates testing maturity. The key insight is the testing trophy shape — most effort should go into integration tests that test components as users use them. Unit tests are valuable for pure logic (utilities, reducers) but not for component internals. The "test behavior not implementation" principle means your tests should not break when you refactor internals (rename a state variable, change a CSS class, restructure JSX) — they should only break when user-visible behavior changes. React Testing Library enforces this by providing user-centric queries (getByRole, getByLabelText) that inherently test accessibility. Strong answers mention the query priority list, the Arrange-Act-Assert pattern, and concrete examples of good vs. bad tests.',
    hints: [
      'Think about what happens when you refactor a component internally (rename state, change CSS classes, restructure JSX). Good tests should still pass. Bad tests break on refactoring.',
      'React Testing Library provides queries in priority order: getByRole > getByLabelText > getByText > getByTestId. Each level is a fallback when the higher priority query is not available.',
    ],
    tags: ['testing', 'react-testing-library', 'best-practices', 'integration-testing', 'testing-trophy'],
    estimatedMinutes: 12,
  },
];
