const TILDA_RADINFRA_URL = "https://tilda-geo.de/regionen/radinfra"

const round = (value: number, digits: number) => Number.parseFloat(value.toFixed(digits))

// Same rounding as TILDA's own map URL
export const getTildaInfraUrl = ({
  zoom,
  lat,
  lng,
}: {
  zoom: number
  lat: number
  lng: number
}) => {
  const digits = zoom >= 17 ? 5 : zoom < 13 ? 3 : 4
  return `${TILDA_RADINFRA_URL}?map=${round(zoom, 1)}/${round(lat, digits)}/${round(lng, digits)}`
}
