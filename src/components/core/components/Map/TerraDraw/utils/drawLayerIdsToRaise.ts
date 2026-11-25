// TerraDraw's layers must stay on top, or later-added map layers cover the edited geometry
export const drawLayerIdsToRaise = (layerOrder: string[], prefix: string) => {
  const drawIds = layerOrder.filter((id) => id.startsWith(`${prefix}-`))
  const topIds = layerOrder.slice(layerOrder.length - drawIds.length)
  const onTop = drawIds.every((id, index) => topIds[index] === id)
  return onTop ? [] : drawIds
}
