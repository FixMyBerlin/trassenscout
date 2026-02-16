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

  constructor(
    onChange?: (geometry: SupportedGeometry | null, geometryType: string | null) => void,
    initialGeometry?: SupportedGeometry,
  ) {
    this.onChange = onChange
    this.initialGeometry = initialGeometry
  }

  onAdd(map: MapLibreMap) {
    this.draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: createTerraDrawModes(),
    })

    // Initialize Terra Draw after map loads
    const initializeDraw = () => {
      if (!this.draw) return

      this.draw.start()

      // Mark as initialized immediately after start
      this.isInitialized = true

      // Load initial geometry if provided BEFORE setting the mode
      // This is required for select mode to recognize the features.
      // Only add when store is empty to avoid duplicate geometry on React Strict Mode double-mount.
      if (this.initialGeometry && this.draw && this.draw.getSnapshot().length === 0) {
        // Terra Draw only accepts Point, LineString, and Polygon (not Multi* geometries)
        // Convert Multi* geometries to individual features
        const featuresToAdd = convertGeometryToFeatures(this.initialGeometry)

        // Ignore the change events to prevent form update loop
        this.ignoreNextChangeCount = featuresToAdd.length

        const validationResults = this.draw.addFeatures(featuresToAdd)

        if (isDev) {
          const invalidResults = validationResults.filter((r) => !r?.valid)
          if (invalidResults.length > 0) {
            console.error(
              `[Terra Draw] ❌ ${invalidResults.length} feature(s) failed validation:`,
              invalidResults.map((r) => r.reason),
            )
          }
        }
      }

      // Determine appropriate starting mode based on geometry
      // Set mode AFTER adding features so select mode recognizes them
      const defaultMode = getDefaultModeForGeometry(this.initialGeometry)
      this.draw.setMode(defaultMode)
      this.currentMode = defaultMode

      // Notify parent of initial mode
      if (this.onModeChange) {
        this.onModeChange(defaultMode)
      }

      // Don't auto-select features on initial load
      // Let users click the feature in select mode to see edit handles
      // This matches the natural Terra Draw interaction pattern
      if (isDev && this.initialGeometry && defaultMode === "select") {
        console.log("[Terra Draw] Started in select mode - click a feature to edit it")
      }

      // Notify that buttons should be updated after loading initial features
      if (this.initialGeometry && this.onButtonsChange) {
        this.onButtonsChange()
      }

      // Track selection through events
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

      // Set up change listener
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

      // Apply any pending mode change
      if (this.pendingMode && this.draw) {
        this.draw.setMode(this.pendingMode)
        this.currentMode = this.pendingMode
        if (this.onModeChange) {
          this.onModeChange(this.pendingMode)
        }
        this.pendingMode = null
      }
    }

    // Wait for map to be fully loaded before initializing TerraDraw
    // Use map.loaded() and 'load' event (not isStyleLoaded() and 'style.load')
    // This follows the @watergis/maplibre-gl-terradraw pattern and ensures the map
    // is ready to accept all layers (both React Source/Layer and TerraDraw layers)
    if (map.loaded()) {
      initializeDraw()
    } else {
      map.once("load", () => {
        initializeDraw()
      })
    }

    // Required by IControl interface, but unused (Terra Draw renders via adapter)
    return document.createElement("div")
  }

  onRemove() {
    if (this.draw) {
      this.draw.stop()
      this.draw = null
    }
    this.isInitialized = false
    this.pendingMode = null
    this.ignoreNextChangeCount = 0
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
