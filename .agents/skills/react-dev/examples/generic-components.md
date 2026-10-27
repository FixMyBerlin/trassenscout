# Generic component patterns

Generic components infer `T` from props; no explicit type argument at the call site.

## Constrained generic (`T extends HasId`)

```typescript
type HasId = { id: string | number };

function List<T extends HasId>({ items }: { items: T[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{/* render item */}</li>
      ))}
    </ul>
  );
}
```

## Select with value accessors

Keeps `T` opaque while rendering options:

```typescript
type SelectProps<T> = {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
  placeholder?: string;
};

function Select<T>({
  options,
  value,
  onChange,
  getLabel,
  getValue,
  placeholder = 'Select…',
}: SelectProps<T>) {
  return (
    <select
      value={value != null ? String(getValue(value)) : ''}
      onChange={(e) => {
        const next = options.find((o) => String(getValue(o)) === e.target.value);
        if (next) onChange(next);
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={String(getValue(option))} value={String(getValue(option))}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}
```

Further reading: [Using TypeScript](https://react.dev/learn/typescript.md) · [Passing Props](https://react.dev/learn/passing-props-to-a-component.md)
