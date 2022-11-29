import React from 'react'
import Link from 'next/link'
import { UrlObject } from 'url'

const AnchorLink = (props: React.PropsWithChildren<{
  href: string | UrlObject
  as?: string | UrlObject
  prefetch?: boolean
}>) => (
  <Link
    style={{ textDecoration: 'none', color: 'inherit' }}
    prefetch={props.prefetch}
    href={props.href}
    as={props.as}
  >
    {props.children}
  </Link>
)

export default AnchorLink
