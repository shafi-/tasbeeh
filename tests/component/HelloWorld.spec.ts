import { test, expect } from '@playwright/experimental-ct-vue'
import TasbeehTahleel from '../../src/components/TasbeehTahleel.vue'

test('should work', async ({ page, mount }) => {
  await mount(TasbeehTahleel, {
    props: {
      tasbeeh: {
        name: 'Tasbeeh Title',
        text: 'Tasbeeh text',
        repeatCount: 20,
      }
    },
  })
  // Can't use component selector here because HelloWorld is a gragment
  // (is multiple elements). So we are starting from page.
  await expect(page.locator('button')).toContainText(`0/20`)
})
