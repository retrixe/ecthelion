import React from 'react'
import Head from 'next/head'

const Title = ({
  title,
  description,
  url,
  index,
}: {
  title: string
  description: string
  url: string
  index?: boolean
}): React.JSX.Element => (
  <Head>
    <title>{title}</title>
    <meta property='og:title' content={title} />
    <meta property='og:url' content={url} />
    <meta property='og:description' content={description} />
    <meta name='Description' content={description} />
    {!index && <meta name='robots' content='noindex,nofollow' />}
  </Head>
)

export default Title
