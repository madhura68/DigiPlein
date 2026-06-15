import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { preRegisterCopilotAppUser } from '@/lib/copilot-provision'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubEnv('S4M_COPILOT_URL', 'http://copilot.test')
  vi.stubEnv('S4M_COPILOT_APP_KEY', 'app-key-test')
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('preRegisterCopilotAppUser', () => {
  it('slaat over zonder service-env en doet geen fetch', async () => {
    vi.stubEnv('S4M_COPILOT_URL', '')

    const res = await preRegisterCopilotAppUser('staff-xyz')

    expect(res).toEqual({ registered: false })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('roept /v1/sessions aan met de app-key en de staffId als app-user', async () => {
    fetchMock.mockResolvedValue({ status: 200 })

    await preRegisterCopilotAppUser('staff-xyz')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://copilot.test/v1/sessions')
    expect(init.headers).toEqual({
      'X-S4M-App-Key': 'app-key-test',
      'X-S4M-App-User': 'staff-xyz',
    })
  })

  it('beschouwt 200 (al gekoppeld) als geregistreerd', async () => {
    fetchMock.mockResolvedValue({ status: 200 })
    expect(await preRegisterCopilotAppUser('s')).toEqual({ registered: true })
  })

  it('beschouwt 403 not_linked (PENDING aangemaakt) als geregistreerd', async () => {
    fetchMock.mockResolvedValue({ status: 403 })
    expect(await preRegisterCopilotAppUser('s')).toEqual({ registered: true })
  })

  it('beschouwt 401 (onbekende app-key) niet als geregistreerd', async () => {
    fetchMock.mockResolvedValue({ status: 401 })
    expect(await preRegisterCopilotAppUser('s')).toEqual({ registered: false })
  })

  it('beschouwt 503 (binding niet beschikbaar) niet als geregistreerd', async () => {
    fetchMock.mockResolvedValue({ status: 503 })
    expect(await preRegisterCopilotAppUser('s')).toEqual({ registered: false })
  })

  it('slikt een netwerk-/timeoutfout en gooit niet', async () => {
    fetchMock.mockRejectedValue(new Error('network down'))
    await expect(preRegisterCopilotAppUser('s')).resolves.toEqual({
      registered: false,
    })
  })
})
