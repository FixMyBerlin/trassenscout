export function idsFromFormValue(value: boolean | number[] | undefined) {
  return Array.isArray(value) ? value : []
}

export function connectIds(ids: number[]) {
  return { connect: ids.map((id) => ({ id })) }
}

export function setIds(ids: number[]) {
  return { set: ids.map((id) => ({ id })) }
}
