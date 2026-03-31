import { isDev } from "@/src/core/utils/isEnv"
import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import type { Map as MapLibreMap } from "maplibre-gl"
import { TerraDraw } from "terra-draw"
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter"
import { createTerraDrawModes } from "./terraDrawConfig"
import type { TerraDrawMode } from "./useTerraDrawControl"
import { calculateEnabledButtons, getDefaultModeForGeometry } from "./utils/buttonState"
import { cleanupMixedFeatures } from "./utils/featureFiltering"
import { convertFeaturesToGeometry, convertGeometryToFeatures } from "./utils/geometryConversion"

export class TerraDrawControl {
  private draw: TerraDraw | null = null
  private map: MapLibreMap | null = null
  private onChange?: (geometry: SupportedGeometry | null, geometryType: string | null) => void
  private initialGeometry?: SupportedGeometry
  private currentMode: TerraDrawMode = "select"
  private onModeChange?: (mode: TerraDrawMode) => void
  private onButtonsChange?: () => void
  private onSelectionChange?: () => void
  private isInitialized = false
  private pendingMode: TerraDrawMode | null = null
  private ignoreNextChangeCount = 0
  private selectedIds: Array<string | number> = []
  private restorePending = false
  private styleLoadHandler = () => this.reinitAfterStyleChange()

  constructor(
    onChange?: (geometry: SupportedGeometry | null, geometryType: string | null) => void,
    initialGeometry?: SupportedGeometry,
  ) {
    this.onChange = onChange
    this.initialGeometry = initialGeometry
  }

  onAdd(map: MapLibreMap) {
    this.map = map
    this.draw = this.createDrawInstance(map)
    // Re-initialize TerraDraw when map style changes (e.g. vector ↔ satellite).
    // MapLibre replaces the entire style, so TerraDraw's layers are removed and must be re-added.
    map.on("style.load", this.styleLoadHandler)

    const init = () => {
      if (!this.draw) return
      this.draw.start()
      this.isInitialized = true
      this.restoreStateAndAttachListeners()
      if (this.pendingMode && this.draw) {
        this.draw.setMode(this.pendingMode)
        this.currentMode = this.pendingMode
        this.onModeChange?.(this.pendingMode)
        this.pendingMode = null
      }
    }

    // Wait for map to be fully loaded before initializing TerraDraw.
    // Use map.loaded() and 'load' event (not isStyleLoaded() and 'style.load') so the map
    // is ready to accept all layers (both React Source/Layer and TerraDraw layers).
    if (map.loaded()) init()
    else map.once("load", init)
    // Required by IControl interface, but unused (Terra Draw renders via adapter).
    return document.createElement("div")
  }

  private createDrawInstance(map: MapLibreMap) {
    return new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: createTerraDrawModes(),
    })
  }

  /**
   * Restore features + mode (from initial geometry or from reinit snapshot), then attach event listeners.
   * Called after start() on initial load and after style-change reinit.
   */
  private restoreStateAndAttachListeners(restore?: {
    snapshot: ReturnType<TerraDraw["getSnapshot"]>
    mode: TerraDrawMode
  }) {
    if (!this.draw) return

    if (restore) {
      this.ignoreNextChangeCount = restore.snapshot.length
      if (restore.snapshot.length > 0) this.draw.addFeatures(restore.snapshot)
      this.draw.setMode(restore.mode)
      this.currentMode = restore.mode
    } else {
      // Load initial geometry only when store is empty (avoids duplicate geometry on React Strict Mode double-mount).
      // Set mode AFTER adding features so select mode recognizes them.
      if (this.initialGeometry && this.draw.getSnapshot().length === 0) {
        const featuresToAdd = convertGeometryToFeatures(this.initialGeometry)
        this.ignoreNextChangeCount = featuresToAdd.length
        const results = this.draw.addFeatures(featuresToAdd)
        if (isDev) {
          const invalid = results.filter((r) => !r?.valid)
          if (invalid.length > 0) {
            console.error(
              `[Terra Draw] ❌ ${invalid.length} feature(s) failed validation:`,
              invalid.map((r) => r.reason),
            )
          }
        }
      }
      const defaultMode = getDefaultModeForGeometry(this.initialGeometry)
      this.draw.setMode(defaultMode)
      this.currentMode = defaultMode
      this.onModeChange?.(defaultMode)
      if (this.initialGeometry) this.onButtonsChange?.()
      if (isDev && this.initialGeometry && defaultMode === "select") {
        console.log("[Terra Draw] Started in select mode - click a feature to edit it")
      }
    }

    this.setupTerraDrawListeners()
  }

  private setupTerraDrawListeners() {
    if (!this.draw) return

    this.draw.on("select", (id) => {
      if (!this.selectedIds.includes(id)) {
        this.selectedIds = [...this.selectedIds, id]
      }
      if (this.onSelectionChange) {
        this.onSelectionChange()
      }
    })

    this.draw.on("deselect", () => {
      this.selectedIds = []
      if (this.onSelectionChange) {
        this.onSelectionChange()
      }
    })

    this.draw.on("change", () => {
      if (!this.draw) return

      // Notify selection change
      if (this.onSelectionChange) {
        this.onSelectionChange()
      }

      // Skip onChange callback if this is a programmatic update
      if (this.ignoreNextChangeCount > 0) {
        this.ignoreNextChangeCount--
        return
      }

      let snapshot = this.draw.getSnapshot()

      // Cleanup: filter to keep only features matching the first feature's type family
      // This handles edge cases where mixed types might exist despite button disabling
      snapshot = cleanupMixedFeatures(snapshot)

      // Convert features to appropriate geometry
      const resultGeometry = convertFeaturesToGeometry(snapshot)

      if (resultGeometry && this.onChange) {
        this.onChange(resultGeometry, resultGeometry.type)
      }
    })
  }

  /**
   * Re-initialize after map style change (e.g. vector ↔ satellite).
   * MapLibre replaces the entire style, so our layers are gone; we restore from in-memory snapshot.
   */
  private reinitAfterStyleChange() {
    if (!this.draw || !this.isInitialized || !this.map) return
    // Ignore duplicate style.load (e.g. react-map-gl fires twice on layer switch); only first run has valid snapshot.
    if (this.restorePending) return
    this.restorePending = true

    const snapshot = this.draw.getSnapshot()
    const mode = this.currentMode
    const snapshotForRestore = snapshot.slice()

    // Do not call this.draw.stop() — after style change the map style was replaced, so TerraDraw's
    // layers/sources no longer exist; stop() would call setData() on undefined and throw.
    this.draw = null

    this.draw = this.createDrawInstance(this.map)
    this.draw.start()
    this.restoreStateAndAttachListeners({ snapshot: snapshotForRestore, mode })
    this.selectedIds = []
    this.onSelectionChange?.()
    this.onButtonsChange?.()
    this.restorePending = false
  }

  onRemove() {
    if (this.map) {
      this.map.off("style.load", this.styleLoadHandler)
      this.map = null
    }
    if (this.draw) {
      this.draw.stop()
      this.draw = null
    }
    this.isInitialized = false
    this.pendingMode = null
    this.ignoreNextChangeCount = 0
    this.restorePending = false
  }

  setMode(mode: TerraDrawMode) {
    if (this.draw && this.isInitialized) {
      if (mode !== this.currentMode) {
        if (isDev) {
          console.log(`[Terra Draw] Mode: ${this.currentMode} → ${mode}`)
        }
        this.draw.setMode(mode)
        this.currentMode = mode
      }
      if (this.onModeChange) {
        this.onModeChange(mode)
      }
    } else {
      // Store mode to apply after initialization
      this.pendingMode = mode
    }
  }

  getMode() {
    return this.currentMode
  }

  clear() {
    if (this.draw && this.isInitialized) {
      this.draw.clear()
      // Don't ignore the change event - we want to notify that geometry was cleared
      if (this.onChange) {
        this.onChange(null, null)
      }
    }
  }

  // Update TerraDraw features programmatically (e.g., from snapping)
  // Clears existing features and adds new ones
  updateFeatures(geometry: SupportedGeometry | null, ignoreChangeEvents = true) {
    if (!this.draw || !this.isInitialized) return

    // Clear existing features
    this.draw.clear()

    if (geometry) {
      // Convert geometry to features and add them
      const featuresToAdd = convertGeometryToFeatures(geometry)
      // Optionally ignore change events (default true to prevent loops, false for snapping to trigger onChange)
      if (ignoreChangeEvents) {
        this.ignoreNextChangeCount = featuresToAdd.length
      }
      this.draw.addFeatures(featuresToAdd)
    }
  }

  getSnapshot() {
    if (this.draw && this.isInitialized) {
      return this.draw.getSnapshot().map((f) => f.geometry as SupportedGeometry)
    }
    return []
  }

  // Get which drawing buttons should be enabled based on current features
  getEnabledButtons() {
    if (!this.draw || !this.isInitialized) {
      return {
        point: true,
        linestring: true,
        "freehand-linestring": true,
        polygon: true,
        edit: false,
      }
    }

    // Get cleaned snapshot (filters to single type family)
    const snapshot = cleanupMixedFeatures(this.draw.getSnapshot())

    if (snapshot.length === 0) {
      // No features - all drawing buttons enabled, edit disabled
      return {
        point: true,
        linestring: true,
        "freehand-linestring": true,
        polygon: true,
        edit: false,
      }
    }

    // Determine what type of features exist and calculate enabled buttons
    const geometryTypes = new Set(snapshot.map((f) => f.geometry.type))
    return calculateEnabledButtons(geometryTypes, true)
  }

  setOnModeChange(callback: (mode: TerraDrawMode) => void) {
    this.onModeChange = callback
  }

  setOnButtonsChange(callback: () => void) {
    this.onButtonsChange = callback
  }

  setOnSelectionChange(callback: () => void) {
    this.onSelectionChange = callback
  }

  getSelectedIds() {
    return this.selectedIds.map(String)
  }

  deleteSelected() {
    if (!this.draw || !this.isInitialized) return

    if (this.selectedIds.length > 0) {
      // Delete only selected features
      this.draw.removeFeatures(this.selectedIds)
      // Check if all features were deleted after removal
      const snapshot = this.draw.getSnapshot()
      if (snapshot.length === 0) {
        // All features deleted - use clear() to signal the app
        this.clear()
      }
      // Otherwise, the change event will handle updating the geometry
    } else {
      // No selection - delete all features
      this.clear()
    }
  }
}
