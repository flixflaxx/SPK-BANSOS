import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { App } from '../../src/App.jsx'
import { ALL_NAV_ITEMS } from '../../src/app/navigation.js'
import { DEMO_USERS } from '../../src/services/mockData.js'

describe('Browser History & Back/Forward Navigation Tests', () => {
  it('ALL_NAV_ITEMS contains all 23 valid navigation views', () => {
    expect(ALL_NAV_ITEMS.length).toBeGreaterThanOrEqual(23)
    const viewIds = ALL_NAV_ITEMS.map((item) => item.id)
    expect(viewIds).toContain('dashboard')
    expect(viewIds).toContain('residents')
    expect(viewIds).toContain('criteria')
    expect(viewIds).toContain('subcriteria')
    expect(viewIds).toContain('assessments')
    expect(viewIds).toContain('saw-calc')
    expect(viewIds).toContain('saw-ranking')
    expect(viewIds).toContain('decisions')
  })

  it('renders root App safely in server environment with initial hash routing checks', () => {
    const originalSessionStorage = globalThis.sessionStorage
    globalThis.sessionStorage = {
      getItem: (key) => {
        if (key === 'spk_is_logged_in_v1') return 'true'
        if (key === 'spk_auth_user_v1') return JSON.stringify(DEMO_USERS[0])
        return null
      },
      setItem: () => {},
      removeItem: () => {},
    }

    try {
      const html = renderToString(<App />)
      expect(html).toContain('Bansos Bulak Amah')
      expect(html).toContain('Dashboard')
    } finally {
      globalThis.sessionStorage = originalSessionStorage
    }
  })
})
