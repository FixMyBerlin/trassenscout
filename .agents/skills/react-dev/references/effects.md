# Effects: anti-patterns and alternatives

Quick table and naming rules live in `SKILL.md`. If the honest name of an effect sounds like derived state, event handling, or "notify parent", the fix is usually **not** another effect. Standard cases (derived state, filtering in render, event handlers instead of effect chains, store id not object, controlled components, `useSyncExternalStore`) follow [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

## 1. Derived values and expensive calculations

Compute during render; never mirror props/state into state with an effect. React Compiler is on: no `useMemo` unless profiling shows a need (then use a named factory function).

## 2. Reset state on prop change

Use `key`, not an effect with `setState`:

```tsx
function ProfilePage({ userId }) {
  return <Profile userId={userId} key={userId} /> // new key = fresh state
}
```

## 3. Event-specific logic

Result of a click/submit (notifications, analytics, navigation) belongs in the event handler. An effect on the resulting state also fires on refresh or remount. Share logic between handlers by extracting a function.

### Persist or sync on gesture, not on `isOpen` / transition flags

Persist/sync in the gesture's handler, not in an Effect watching `isOpen`, `isExpanded`, or a transition flag; the effect also runs on mount, prop-driven close, and remount. If animation timing matters, use the library's close-complete callback (still gesture-tied). Smell: `persistOnClose`, `syncWhenClosed`, `saveDraftOnDismiss`.

```tsx
function handleDismiss() {
  saveSettings(draft)
  onClose()
}
```

## 4. Passing data up to a parent

Data flows down: the parent fetches (loader / React Query) and passes data to the child as props. Never have the child call `onFetched` from an effect.

## 5. Data fetching

No `useEffect` fetching: route loaders + React Query (see `tanstack-router-conventions`). That gives caching, cancellation and race handling.

## 6. App initialization

Effects run twice in dev (Strict Mode), so one-time init (auth token check, loading localStorage) needs a module-level guard or module-level execution:

```tsx
let didInit = false

function App() {
  useEffect(function initializeAppOnce() {
    if (!didInit) {
      didInit = true
      loadDataFromLocalStorage()
      checkAuthToken() // may invalidate token on a second call
    }
  }, [])
}
```

## 7. `useEffectEvent` for non-reactive effect logic

Rules are in `SKILL.md`. Example: `theme` is read at its latest value without reconnecting.

```tsx
import { useEffect, useEffectEvent } from "react"

function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification("Connected!", theme)
  })

  useEffect(
    function connectToChatRoom() {
      const connection = createConnection(roomId)
      connection.on("connected", onConnected)
      connection.connect()
      return function disconnectFromChatRoom() {
        connection.disconnect()
      }
    },
    [roomId], // theme omitted, read via onConnected
  )
}
```

Docs: [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects) · [`useEffectEvent`](https://react.dev/reference/react/useEffectEvent)
