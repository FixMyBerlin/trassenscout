# React 19 — TypeScript notes

Behavior and full API docs: [react.dev/llms.txt](https://react.dev/llms.txt).

## ref as prop

`forwardRef` still works but is unnecessary for new components:

```typescript
type ButtonProps = {
  ref?: React.Ref<HTMLButtonElement>;
} & React.ComponentPropsWithoutRef<'button'>;

function Button({ ref, children, ...props }: ButtonProps) {
  return <button ref={ref} {...props}>{children}</button>;
}
```

Generic component:

```typescript
type SelectProps<T> = {
  ref?: React.Ref<HTMLSelectElement>
  options: T[]
  value: T
  onChange: (value: T) => void
  getLabel: (option: T) => string
}
```

Blog: [React 19](https://react.dev/blog/2024/12/05/react-19)

## use()

Unwraps promises and context; can suspend. **Do not** await a promise before passing it if the child should stream with Suspense.

```typescript
import { use } from 'react'

function Profile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise)
  return <div>{user.name}</div>
}
```

`use()` may be conditional (unlike other hooks). Reference: [use](https://react.dev/reference/react/use.md)

## Forms

Forms: TanStack Form. Do not use `useActionState` / `useFormState`.

## Migration checklist (legacy codebases)

- [ ] Replace `forwardRef` with `ref` prop
- [ ] Replace `useFormState` / `useActionState` with TanStack Form
- [ ] `@types/react` 19.x
- [ ] Enable React Compiler + oxlint native `react/*` compiler rules
