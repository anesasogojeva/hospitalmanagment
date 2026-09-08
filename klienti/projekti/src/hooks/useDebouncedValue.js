import { useEffect, useState } from 'react';

// Delays reflecting `value` until it stops changing for `delayMs` - used to
// avoid firing a server search request on every keystroke.
export default function useDebouncedValue(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
