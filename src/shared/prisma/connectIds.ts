export function idsFromFormValue(value: boolean | number[] | undefined) {
  return Array.isArray(value) ? value : []
}

export function connectIds(ids: number[]) {
  return { connect: ids.map((id) => ({ id })) }
}

/** Connects the given ids, leaving existing links untouched when the field is absent. */
export function connectIdsIfAny(value: boolean | number[] | undefined) {
  const ids = idsFromFormValue(value)
  return ids.length ? connectIds(ids) : undefined
}

export function setIds(ids: number[]) {
  return { set: ids.map((id) => ({ id })) }
}
