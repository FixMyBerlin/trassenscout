import { sharedColors } from "@/src/core/components/Map/colors/sharedColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import { isDev } from "@/src/core/utils/isEnv"
import type { Geometry } from "geojson"
import type { Map as MapLibreMap } from "maplibre-gl"
import { useState } from "react"
import { useControl } from "react-map-gl/maplibre"
import {
  type GeoJSONStoreFeatures,
  type HexColor,
  TerraDraw,
  TerraDrawFreehandLineStringMode,
  TerraDrawLineStringMode,
  TerraDrawPointMode,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from "terra-draw"
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter"

const TERRA_DRAW_COLORS = {
  drawing: sharedColors.hovered as HexColor, // Yellow for edited feature
  selectedDark: sharedColors.hovered as HexColor, // Yellow for selected feature
  selectionPoint: subsubsectionColors.lineDotSelected as HexColor, // Light blue for corner/vertex points
}

export type TerraDrawMode = "point" | "linestring" | "freehand-linestring" | "polygon" | "select"

// Helper to determine appropriate mode based on geometry type
// If geometry exists, use select mode to view/edit it
// Otherwise default to linestring for new drawings
const getDefaultModeForGeometry = (geometry: Geometry | undefined): TerraDrawMode => {
  if (!geometry) return "linestring"

  // When geometry exists, start in select mode to view and edit it
  return "select"
}

// Helper to determine geometry type family
const getGeometryFamily = (type: string): "point" | "line" | "polygon" | null => {
  if (type === "Point" || type === "MultiPoint") return "point"
  if (type === "LineString" || type === "MultiLineString") return "line"
  if (type === "Polygon" || type === "MultiPolygon") return "polygon"
  return null
}

// Cleanup function: filter features to match first feature's type family
// This prevents mixed geometries from being saved (enforced by button disabling during drawing)
const cleanupMixedFeatures = (features: GeoJSONStoreFeatures[]): GeoJSONStoreFeatures[] => {
  if (features.length === 0) return features

  const firstFeature = features[0]
  if (!firstFeature) return features // TypeScript guard

  const firstFamily = getGeometryFamily(firstFeature.geometry.type)
  if (!firstFamily) return features

  // Filter to keep only features of the same type family as the first
  return features.filter((f) => getGeometryFamily(f.geometry.type) === firstFamily)
}

// Helper to determine which buttons should be enabled based on geometry types
// After cleanupMixedFeatures, there will be at most one geometry type family present
// So we only enable buttons for the type that exists (or all if empty)
const calculateEnabledButtons = (geometryTypes: Set<string>, hasAnyGeometries: boolean) => {
  const hasPoints = geometryTypes.has("Point") || geometryTypes.has("MultiPoint")
  const hasLines = geometryTypes.has("LineString") || geometryTypes.has("MultiLineString")
  const hasPolygons = geometryTypes.has("Polygon") || geometryTypes.has("MultiPolygon")

  return {
    point: hasPoints,
    linestring: hasLines,
    "freehand-linestring": hasLines, // Enabled when linestring is enabled (same geometry type)
    polygon: hasPolygons,
    edit: hasAnyGeometries,
  }
}

type Props = {
  initialGeometry?: Geometry
  onChange?: (geometry: Geometry | null, geometryType: string | null) => void
}

class TerraDrawControl {
  private draw: TerraDraw | null = null
  private onChange?: (geometry: Geometry | null, geometryType: string | null) => void
  private initialGeometry?: Geometry
  private currentMode: TerraDrawMode = "select"
  private onModeChange?: (mode: TerraDrawMode) => void
  private onButtonsChange?: () => void
  private isInitialized = false
  private pendingMode: TerraDrawMode | null = null
  private ignoreNextChangeCount = 0

  constructor(
    onChange?: (geometry: Geometry | null, geometryType: string | null) => void,
    initialGeometry?: Geometry,
  ) {
    this.onChange = onChange
    this.initialGeometry = initialGeometry
  }

  /**
   * Convert a geometry (including Multi* types) into an array of features
   * Terra Draw only accepts Point, LineString, and Polygon - not Multi* geometries
   * Note: Coordinates need to be rounded to 6 decimal places already
   */
  private convertGeometryToFeatures(geometry: Geometry) {
    const features: GeoJSONStoreFeatures[] = []

    switch (geometry.type) {
      case "Point":
        features.push({
          type: "Feature" as const,
          properties: { mode: "point" },
          geometry: geometry,
        })
        break

      case "MultiPoint":
        // Split MultiPoint into individual Point features
        geometry.coordinates.forEach((coords) => {
          features.push({
            type: "Feature" as const,
            properties: { mode: "point" },
            geometry: { type: "Point", coordinates: coords },
          })
        })
        break

      case "LineString":
        features.push({
          type: "Feature" as const,
          properties: { mode: "linestring" },
          geometry: geometry,
        })
        break

      case "MultiLineString":
        // Split MultiLineString into individual LineString features
        geometry.coordinates.forEach((coords) => {
          features.push({
            type: "Feature" as const,
            properties: { mode: "linestring" },
            geometry: { type: "LineString", coordinates: coords },
          })
        })
        break

      case "Polygon":
        features.push({
          type: "Feature" as const,
          properties: { mode: "polygon" },
          geometry: geometry,
        })
        break

      case "MultiPolygon":
        // Split MultiPolygon into individual Polygon features
        geometry.coordinates.forEach((coords) => {
          features.push({
            type: "Feature" as const,
            properties: { mode: "polygon" },
            geometry: { type: "Polygon", coordinates: coords },
          })
        })
        break

      default:
        if (isDev) {
          console.warn("[Terra Draw] Unsupported geometry type:", geometry.type)
        }
    }

    return features
  }

  onAdd(map: MapLibreMap) {
    this.draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        // DOCS STYLING: https://github.com/JamesLMilner/terra-draw/blob/main/guides/5.STYLING.md
        new TerraDrawPointMode({
          styles: { pointColor: TERRA_DRAW_COLORS.drawing },
        }),
        new TerraDrawLineStringMode({
          styles: { lineStringColor: TERRA_DRAW_COLORS.drawing },
        }),
        new TerraDrawFreehandLineStringMode({
          styles: { lineStringColor: TERRA_DRAW_COLORS.drawing },
        }),
        new TerraDrawPolygonMode({
          styles: {
            outlineColor: TERRA_DRAW_COLORS.drawing,
            fillColor: TERRA_DRAW_COLORS.drawing, // Yellow fill for polygons
            fillOpacity: 0.3, // Semi-transparent yellow fill
          },
        }),
        new TerraDrawSelectMode({
          flags: {
            point: {
              feature: {
                draggable: true,
                coordinates: { draggable: true },
              },
            },
            linestring: {
              feature: {
                draggable: true,
                coordinates: { draggable: true },
              },
            },
            "freehand-linestring": {
              feature: {
                draggable: true,
                coordinates: { draggable: true },
              },
            },
            polygon: {
              feature: {
                draggable: true,
                coordinates: { draggable: true },
              },
            },
          },
          styles: {
            // https://github.com/JamesLMilner/terra-draw/blob/main/guides/5.STYLING.md#selection-points
            selectedPointColor: TERRA_DRAW_COLORS.selectionPoint, // Light blue for corner/vertex points
            selectionPointColor: TERRA_DRAW_COLORS.selectionPoint, // Light blue for corner/vertex points
            selectedLineStringColor: TERRA_DRAW_COLORS.selectedDark, // Yellow for selected line
            selectedPolygonColor: TERRA_DRAW_COLORS.selectedDark, // Yellow for selected polygon outline
            selectedPolygonFillOpacity: 0.3, // Semi-transparent yellow fill for selected polygon
          },
        }),
      ],
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
        const featuresToAdd = this.convertGeometryToFeatures(this.initialGeometry)

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

      // Set up change listener
      this.draw.on("change", () => {
        if (!this.draw) return

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
        let resultGeometry: Geometry | null = null

        if (snapshot.length === 0) {
          // Don't clear geometry on empty snapshot - might be temporary during drawing
          // Only clear() method should explicitly clear geometry
          return
        } else if (snapshot.length === 1) {
          const feature = snapshot[0]
          resultGeometry = feature ? feature.geometry : null
        } else {
          // Multiple features of same type - combine into Multi* geometry
          const firstFeature = snapshot[0]
          if (!firstFeature) return // TypeScript guard

          const firstType = firstFeature.geometry.type

          if (firstType === "Point") {
            const coordinates = snapshot
              .map((f) => (f.geometry.type === "Point" ? f.geometry.coordinates : null))
              .filter(Boolean)
            resultGeometry = { type: "MultiPoint", coordinates }
          } else if (firstType === "LineString") {
            const coordinates = snapshot
              .map((f) => (f.geometry.type === "LineString" ? f.geometry.coordinates : null))
              .filter(Boolean)
            resultGeometry = { type: "MultiLineString", coordinates }
          } else if (firstType === "Polygon") {
            const coordinates = snapshot
              .map((f) => (f.geometry.type === "Polygon" ? f.geometry.coordinates : null))
              .filter(Boolean)
            resultGeometry = { type: "MultiPolygon", coordinates }
          } else {
            // Already Multi* - just use first
            resultGeometry = firstFeature.geometry
          }
        }

        if (resultGeometry && this.onChange) {
          if (isDev) {
            const coordCount =
              resultGeometry.type === "Point"
                ? 1
                : resultGeometry.type === "LineString"
                  ? resultGeometry.coordinates.length
                  : resultGeometry.type === "Polygon"
                    ? resultGeometry.coordinates[0]?.length || 0
                    : resultGeometry.type === "MultiPoint"
                      ? resultGeometry.coordinates.length
                      : resultGeometry.type === "MultiLineString"
                        ? resultGeometry.coordinates.reduce((sum, line) => sum + line.length, 0)
                        : resultGeometry.type === "MultiPolygon"
                          ? resultGeometry.coordinates.reduce(
                              (sum, poly) => sum + (poly[0]?.length || 0),
                              0,
                            )
                          : 0
            console.log(`[Terra Draw] onChange: ${resultGeometry.type} (${coordCount} coords)`)
          }
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

  /**
   * Update TerraDraw features programmatically (e.g., from snapping)
   * Clears existing features and adds new ones
   * @param geometry - Geometry to update, or null to clear
   * @param ignoreChangeEvents - If true, ignore change events (prevents loops). If false, allow change events to fire (for snapping)
   */
  updateFeatures(geometry: Geometry | null, ignoreChangeEvents = true) {
    if (!this.draw || !this.isInitialized) return

    // Clear existing features
    this.draw.clear()

    if (geometry) {
      // Convert geometry to features and add them
      const featuresToAdd = this.convertGeometryToFeatures(geometry)
      // Optionally ignore change events (default true to prevent loops, false for snapping to trigger onChange)
      if (ignoreChangeEvents) {
        this.ignoreNextChangeCount = featuresToAdd.length
      }
      this.draw.addFeatures(featuresToAdd)
    }
  }

  getSnapshot() {
    if (this.draw && this.isInitialized) {
      return this.draw.getSnapshot().map((f) => f.geometry)
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
}

/**
 * Custom hook to integrate Terra Draw with react-map-gl using the useControl pattern
 * Manages terra-draw lifecycle internally without exposing refs or requiring useEffect in consumers
 */
export const useTerraDrawControl = ({ initialGeometry, onChange }: Props) => {
  const [mode, setModeState] = useState<TerraDrawMode>(() =>
    getDefaultModeForGeometry(initialGeometry),
  )

  // Initialize button state based on initial geometry type
  // Use the same logic as getEnabledButtons for consistency
  const getInitialButtonState = () => {
    if (!initialGeometry) {
      return {
        point: true,
        linestring: true,
        "freehand-linestring": true,
        polygon: true,
        edit: false,
      }
    }
    const geometryTypes = new Set([initialGeometry.type])
    return calculateEnabledButtons(geometryTypes, true)
  }

  const [enabledButtons, setEnabledButtons] = useState(getInitialButtonState())

  const control = useControl<TerraDrawControl>(
    () => {
      const wrappedOnChange = (geometry: Geometry | null, geometryType: string | null) => {
        // Update enabled buttons based on new state
        if (control) {
          setEnabledButtons(control.getEnabledButtons())
        }
        // Call original onChange
        if (onChange) {
          onChange(geometry, geometryType)
        }
      }

      const ctrl = new TerraDrawControl(wrappedOnChange, initialGeometry)
      ctrl.setOnModeChange(setModeState)
      ctrl.setOnButtonsChange(() => {
        if (ctrl) {
          setEnabledButtons(ctrl.getEnabledButtons())
        }
      })
      return ctrl
    },
    { position: "top-left" },
  )

  const setMode = (newMode: TerraDrawMode) => {
    if (control) {
      control.setMode(newMode)
    }
  }

  const clear = () => {
    if (control) {
      control.clear()
      setEnabledButtons({
        point: true,
        linestring: true,
        "freehand-linestring": true,
        polygon: true,
        edit: false,
      })
    }
  }

  const getSnapshot = () => {
    if (control) {
      return control.getSnapshot()
    }
    return []
  }

  const updateFeatures = (geometry: Geometry | null, ignoreChangeEvents = true) => {
    if (control) {
      control.updateFeatures(geometry, ignoreChangeEvents)
      setEnabledButtons(control.getEnabledButtons())
    }
  }

  return {
    mode,
    setMode,
    clear,
    getSnapshot,
    updateFeatures,
    enabledButtons,
  }
}
