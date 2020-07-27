import React, { useRef, useLayoutEffect } from 'react'
import Typography from '@material-ui/core/Typography'

const ConsoleView = (props: { console: Array<{ id: number, text: string }> }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isScrolledToBottom = ref.current !== null ? (
    ref.current.scrollHeight - ref.current.clientHeight <= ref.current.scrollTop + 1
  ) : false

  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight - ref.current.clientHeight
  }, [])
  useLayoutEffect(() => {
    if (isScrolledToBottom && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight - ref.current.clientHeight
    }
  }, [props.console, isScrolledToBottom])

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        overflow: 'auto'
        // display: 'flex',
        // Firefox and EdgeHTML break this behaviour when using column-reverse.
        // flexDirection: 'column'
      }}
      ref={ref}
    >
      <Typography variant='body2' style={{ lineHeight: 1.5, wordWrap: 'break-word' }} component='div'>
        {props.console.map((i) => (
          <span key={i.id}>{i.text}<br /></span>
        )) /* Truncate to 650 lines due to performance issues afterwards. */}
      </Typography>
      <div style={{ minHeight: '5px' }} />
    </div>
  )
}

const PureConsoleView = React.memo(ConsoleView)
export default PureConsoleView
