import { expect, test } from '@playwright/test'

// Fixture data (backend/internal/jpl/testdata): three close approaches, the
// closest being 2026 VK2; five Sentry objects led by 2014 HN197; three fireballs;
// SBDB profile for 99942 Apophis.

test.describe('overview', () => {
  test('shows the closest flyby, KPIs, risk and fireball sections', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: 'Planetary defense overview' })).toBeAttached()
    // The closest flyby's designation links to its object page.
    await expect(page.getByRole('link', { name: '2026 VK2', exact: true })).toBeVisible()
    await expect(page.getByText('APPROACHES · 30 D', { exact: false })).toBeVisible()
    await expect(page.getByText('2014 HN197').first()).toBeVisible()
    await expect(page.getByText('Recent atmospheric impacts')).toBeVisible()
  })

  test('masthead navigation reaches every section', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation').first()

    await nav.getByRole('link', { name: /approaches/i }).click()
    await expect(page).toHaveURL(/\/close-approaches/)
    await expect(page.getByRole('heading', { name: 'Close approaches' })).toBeVisible()

    await nav.getByRole('link', { name: /risk/i }).click()
    await expect(page).toHaveURL(/\/risk/)
    await expect(page.getByRole('heading', { name: 'Impact risk' })).toBeVisible()

    await nav.getByRole('link', { name: /fireballs/i }).click()
    await expect(page).toHaveURL(/\/fireballs/)
    await expect(page.getByRole('heading', { name: 'Fireballs' })).toBeVisible()
  })
})

test.describe('close approaches', () => {
  test('lists every approach from the API', async ({ page }) => {
    await page.goto('/close-approaches')

    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(3)
    await expect(page.getByText('2026 VZ3').first()).toBeVisible()
    await expect(page.getByText('2026 VK2').first()).toBeVisible()
  })
})

test.describe('impact risk', () => {
  test('sorts the Sentry list by cumulative Palermo scale', async ({ page }) => {
    await page.goto('/risk')

    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(5)
    await expect(rows.first()).toContainText('2014 HN197')
    await expect(rows.first()).toContainText('-5.50')
  })
})

test.describe('object detail', () => {
  test('search jumps to an object and renders its orbit', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('/')
    const search = page
      .getByRole('searchbox', { name: /look up an object/i })
      .or(page.getByLabel('Look up an object by designation or name'))
    await search.first().fill('99942')
    await search.first().press('Enter')

    await expect(page).toHaveURL(/\/objects\/99942$/)
    await expect(page.getByRole('heading', { name: '99942 Apophis' })).toBeVisible()
    await expect(page.getByText('PHA', { exact: true })).toBeVisible()
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('explains an unknown designation instead of failing', async ({ page }) => {
    await page.route('**/api/v1/objects/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'not_found', message: 'no such object' } }),
      }),
    )
    await page.goto('/objects/not-a-rock')

    await expect(page.getByText('No object matches “not-a-rock”.')).toBeVisible()
  })
})

test('unknown routes show the 404 page', async ({ page }) => {
  await page.goto('/nowhere')
  await expect(page.getByText('Nothing at these coordinates.')).toBeVisible()
})
