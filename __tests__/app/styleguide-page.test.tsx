import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn() }))

vi.mock('@/lib/auth', () => ({ requireStaff: mocks.requireStaff }))

import StijlgidsPage from '@/app/stijlgids/page'

beforeEach(() => {
  mocks.requireStaff.mockReset()
  mocks.requireStaff.mockResolvedValue({
    staffId: 'staff-1',
    name: 'Bea',
    role: 'STAFF',
  })
})

describe('/stijlgids', () => {
  it('vereist een medewerker-sessie', async () => {
    render(await StijlgidsPage())
    expect(mocks.requireStaff).toHaveBeenCalledOnce()
    expect(screen.getByRole('heading', { level: 1, name: 'Stijlgids' })).toBeInTheDocument()
  })
})
