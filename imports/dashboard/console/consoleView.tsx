import React, { useRef, useLayoutEffect } from 'react'
import Typography from '@mui/material/Typography'
import styled from '@emotion/styled'

const chrome =
  Object.hasOwnProperty.call(window, 'chrome') &&
  typeof navigator === 'object' &&
  typeof navigator.userAgent === 'string' &&
  !navigator.userAgent.includes('Trident') &&
  !navigator.userAgent.includes('Edge') // Chromium Edge uses Edg *sad noises*

const ChromeConsoleViewContainer = styled.div({
  height: '100%',
  width: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column-reverse',
})

const ChromeConsoleView = (props: {
  console: { id: number; text: string }[]
}): React.JSX.Element => (
  <ChromeConsoleViewContainer>
    <div style={{ minHeight: '5px' }} />
    <Typography variant='body2' style={{ lineHeight: 1.5, wordWrap: 'break-word' }} component='div'>
      {props.console.map(i => (
        <span key={i.id}>
          {i.text}
          <br />
        </span>
      ))}
    </Typography>
  </ChromeConsoleViewContainer>
)

const ConsoleView = (props: { console: { id: number; text: string }[] }): React.JSX.Element => {
  const ref = useRef<HTMLDivElement>(null)
  const isScrolledToBottom =
    ref.current !== null
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
      <Typography
        variant='body2'
        style={{ lineHeight: 1.5, wordWrap: 'break-word' }}
        component='div'
      >
        {props.console.map(i => (
          <span key={i.id}>
            {i.text}
            <br />
          </span>
        ))}
      </Typography>
      <div style={{ minHeight: '5px' }} />
    </div>
  )
}

// Firefox and EdgeHTML break column-reverse behaviour.
const PureConsoleView = React.memo(chrome ? ChromeConsoleView : ConsoleView)
export default PureConsoleView
