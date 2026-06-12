import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ChatWindowView } from '@/components/chat/chat-window-view'

describe('ChatWindowView (F-07 chat-inbedding)', () => {
  it('uitgelogd → niets zichtbaar', () => {
    const { container } = render(
      <ChatWindowView authenticated={false} enabled url="https://chat.example" />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('ingelogd + flag uit → "binnenkort"-staat, geen iframe', () => {
    render(<ChatWindowView authenticated enabled={false} />)
    expect(screen.getByText('Binnenkort')).toBeInTheDocument()
    expect(screen.queryByTitle('DigiPlein-chat')).not.toBeInTheDocument()
  })

  it('ingelogd + flag aan maar zonder URL → nog steeds "binnenkort"', () => {
    render(<ChatWindowView authenticated enabled />)
    expect(screen.getByText('Binnenkort')).toBeInTheDocument()
  })

  it('ingelogd + flag aan + URL → externe component ingebed', () => {
    render(
      <ChatWindowView authenticated enabled url="https://chat.example/embed" />
    )
    expect(screen.getByTitle('DigiPlein-chat')).toHaveAttribute(
      'src',
      'https://chat.example/embed'
    )
    expect(screen.queryByText('Binnenkort')).not.toBeInTheDocument()
  })
})
