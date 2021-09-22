import React, { useRef, useLayoutEffect } from 'react'
import Typography from '@mui/material/Typography'

let chrome = false
try {
  if (
    Object.hasOwnProperty.call(window, 'chrome') &&
    !navigator.userAgent.includes('Trident') &&
    !navigator.userAgent.includes('Edge') // Chromium Edge uses Edg *sad noises*
  ) chrome = true
} catch (e) {}

const ChromeConsoleView = (props: { console: Array<{ id: number, text: string }> }) => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse'
      }}
    >
      <div style={{ minHeight: '5px' }} />
      <Typography variant='body2' style={{ lineHeight: 1.5, wordWrap: 'break-word' }} component='div'>
        {props.console.map((i) => (
          <span key={i.id}>{i.text}<br /></span>
        )) /* Truncate to 650 lines due to performance issues afterwards. */}
      </Typography>
    </div>
  )
}

const ConsoleView = (props: { console: Array<{ id: number, text: string }> }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isScrolledToBottom = ref.current !== null
    ? ref.current.scrollHeight - ref.current.clientHeight <= ref.current.scrollTop + 1
    : false

  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight - ref.current.clientHeight
  }, [])
  useLayoutEffect(() => {
    if (isScrolledToBottom && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight - ref.current.clientHeight
    }
  }, [props.console, isScrolledToBottom])

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto' }} ref={ref}>
      <Typography variant='body2' style={{ lineHeight: 1.5, wordWrap: 'break-word' }} component='div'>
        {props.console.map((i) => (
          <span key={i.id}>{i.text}<br /></span>
        )) /* Truncate to 650 lines due to performance issues afterwards. */}
      </Typography>
      <div style={{ minHeight: '5px' }} />
    </div>
  )
}

// Firefox and EdgeHTML break column-reverse behaviour.
const PureConsoleView = React.memo(chrome ? ChromeConsoleView : ConsoleView)
export default PureConsoleView
