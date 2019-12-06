import React from 'react'
import Head from 'next/head'

const Title = ({ title, description, url }: {
  title: string, description: string, url: string
}) => (
  <Head>
    <title>{title}</title>
    <meta property='og:title' content={title} />
    <meta property='og:url' content={url} /> {/* TODO */}
    <meta property='og:description' content={description} />
    <meta name='Description' content={description} />
  </Head>
)

export default Title
