import React from 'react'
import Typography from '@material-ui/core/Typography'

const lastEls = (array: any[], size: number) => {
  const length = array.length
  if (length > 650) return array.slice(length - (size - 1))
  else return array
}

const ConsoleView = (props: { console: string }) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const isScrolledToBottom = ref.current !== null ? (
    ref.current.scrollHeight - ref.current.clientHeight <= ref.current.scrollTop + 1
  ) : false

  React.useEffect(() => {
    if (isScrolledToBottom && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight - ref.current.clientHeight
    }
  }, [props.console, isScrolledToBottom])

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        overflow: 'auto',
        display: 'flex',
        // Firefox and EdgeHTML break this behaviour when using column-reverse.
        flexDirection: 'column'
      }}
      ref={ref}
    >
      <Typography variant='body2' style={{ lineHeight: 1.5 }} component='div'>
        {lastEls(props.console.split('\n').map((i, index) => (
          <div key={index}>{i}<br /></div>
        )), 650) /* Truncate to 650 lines due to performance issues afterwards. */}
      </Typography>
      <div style={{ minHeight: '5px' }} />
    </div>
  )
}

const PureConsoleView = React.memo(ConsoleView)
export default PureConsoleView
