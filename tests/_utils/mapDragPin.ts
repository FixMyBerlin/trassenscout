import { expect } from "@/tests/_utils/support"
import { Page } from "@playwright/test"

export const mapDragPin = async ({
  page,
  mapElement,
  pinElement,
}: {
  page: Page
  mapElement: any
  pinElement: any
}) => {
  await expect(mapElement).toBeInViewport()
  await expect(pinElement).toBeVisible({ timeout: 15_000 })

  // without this click the dragging does not work
  await mapElement.click({})

  const originalPinPosition = await pinElement.boundingBox()

  if (!originalPinPosition) {
    throw new Error("Pin bounding box could not be determined")
  }

  const startX = originalPinPosition.x + originalPinPosition.width / 2
  const startY = originalPinPosition.y + originalPinPosition.height / 2

  const targetX = startX + 50
  const targetY = startY + 25

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(targetX, targetY, { steps: 5 })
  await page.mouse.up()

  // Poll until the pin's position actually changes instead of sleeping a fixed amount.
  await expect
    .poll(
      async () => {
        const box = await pinElement.boundingBox()
        return box ? Math.round(box.x) : null
      },
      { timeout: 2_000 },
    )
    .not.toBe(Math.round(startX))

  const newPinPosition = await pinElement.boundingBox()
  if (!newPinPosition) {
    throw new Error("Updated pin bounding box could not be determined")
  }

  expect(newPinPosition.x).not.toBeCloseTo(originalPinPosition.x, 0)
  expect(newPinPosition.y).not.toBeCloseTo(originalPinPosition.y, 0)
}
