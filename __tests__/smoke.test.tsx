import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('scaffold smoke', () => {
  it('rendert de placeholder-startpagina (vitest + jsdom + TSX-keten)', () => {
    render(<Home />)
    expect(
      screen.getByRole('heading', { level: 1, name: /digiplein/i }),
    ).toBeInTheDocument()
  })
})
