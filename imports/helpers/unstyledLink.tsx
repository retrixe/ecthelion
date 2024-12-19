import React from 'react'
import Link, { type LinkProps } from 'next/link'

const UnstyledLink = (props: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps & {
  children?: React.ReactNode
} & React.RefAttributes<HTMLAnchorElement>): React.JSX.Element => (
  <Link
    {...props}
    style={{ textDecoration: 'none', color: 'inherit', ...(props.style ?? {}) }}
  />
)

export default UnstyledLink
