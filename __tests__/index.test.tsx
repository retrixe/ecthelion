import { render, screen } from '@testing-library/react'
import React from 'react'
import { expect, test } from 'vitest'
import Home from '../pages/index'

test('renders a heading', () => {
  render(<Home />)
  const heading = screen.getByRole('heading', { name: /Octyne/i })
  expect(heading).toBeDefined()
})
