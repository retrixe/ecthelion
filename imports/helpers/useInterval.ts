import { useEffect, useRef } from 'react'

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
const useInterval = (callback: (...args: any[]) => void, delay: number) => {
  const savedCallback = useRef<() => void>()
  // Remember the latest callback.
  useEffect(() => { savedCallback.current = callback }, [callback])
  // Set up the interval.
  useEffect(() => {
    const tick = () => savedCallback.current?.()
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

export default useInterval
