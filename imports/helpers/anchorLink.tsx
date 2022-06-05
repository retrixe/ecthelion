import React from 'react'
import Link from 'next/link'
import { Url } from 'url'

const AnchorLink = (props: React.PropsWithChildren<{
  href: string | Url
  as?: string | Url
  prefetch?: boolean
}>) => (
  <Link passHref href={props.href} as={props.as} prefetch={props.prefetch}>
    <a style={{ textDecoration: 'none', color: 'inherit' }}>
      {props.children}
    </a>
  </Link>
)

export default AnchorLink
