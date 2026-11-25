import { useTildaInfraLayerActions, useTildaInfraLayerVisible } from "./tilda-infra-layer-store"
import { TILDA_INFRA_LABEL } from "./tildaInfra.const"

export const TildaInfraLayerToggle = () => {
  const visible = useTildaInfraLayerVisible()
  const { toggle } = useTildaInfraLayerActions()

  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs sm:text-sm">
      <input
        type="checkbox"
        checked={visible}
        onChange={toggle}
        className="size-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      {TILDA_INFRA_LABEL}
    </label>
  )
}
