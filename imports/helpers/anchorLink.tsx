import React from 'react'
import Link from 'next/link'

const AnchorLink = (props: React.PropsWithChildren<{
  href: string
  as?: string
  prefetch?: boolean
}>) => (
  <Link passHref href={props.href} as={props.as} prefetch={props.prefetch}>
    <a style={{ textDecoration: 'none', color: 'inherit' }}>
      {props.children}
    </a>
  </Link>
)

export default AnchorLink
