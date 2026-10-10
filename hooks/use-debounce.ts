"use client"

import { useEffect, useState } from "react"

/**
 * Mengembalikan nilai `value` yang di-debounce selama `delay` ms.
 * Dipakai supaya pencarian tidak men-filter di setiap ketukan keyboard.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
