import type { GeoJSONStoreFeatures, HexColor } from "terra-draw"
import {
  TerraDrawFreehandLineStringMode,
  TerraDrawLineStringMode,
  TerraDrawPointMode,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from "terra-draw"

export const TERRA_DRAW_COLORS = {
  /** Yellow – selected (edit mode) or the feature being drawn (add mode) */
  drawing: "#F8C62B" as HexColor,
  selectedDark: "#F8C62B" as HexColor,
  /** Blue – unselected (edit mode) or at-rest features (add mode) */
  unselected: "#2c62a9" as HexColor,
  /** Pink – selection points (vertex handles) in edit mode */
  selectionPoint: "#ec407a" as HexColor,
  /** Purple – midpoint handles in edit mode */
  midPoint: "#a855f7" as HexColor,
}

/** Use yellow for the feature currently being drawn, blue for the rest. */
const colorByDrawingState = (feature: GeoJSONStoreFeatures) =>
  feature.properties?.currentlyDrawing ? TERRA_DRAW_COLORS.drawing : TERRA_DRAW_COLORS.unselected

// DOCS STYLING: https://github.com/JamesLMilner/terra-draw/blob/main/guides/5.STYLING.md
// In add/draw mode: existing features = blue (unselected), the one being drawn = yellow (colorByDrawingState).
// In edit/select mode: unselected = blue (from these mode styles), selected = yellow (from SelectMode selected* styles).
export const createTerraDrawModes = () => [
  new TerraDrawPointMode({
    styles: { pointColor: colorByDrawingState },
  }),
  new TerraDrawLineStringMode({
    styles: { lineStringColor: colorByDrawingState },
  }),
  new TerraDrawFreehandLineStringMode({
    styles: { lineStringColor: colorByDrawingState },
  }),
  new TerraDrawPolygonMode({
    styles: {
      outlineColor: colorByDrawingState,
      fillColor: colorByDrawingState,
      fillOpacity: 0.3,
    },
  }),
  new TerraDrawSelectMode({
    // Smaller hit area so midpoint can win over corners when segment is long enough.
    // Default 40px causes corner and midpoint to overlap on short segments (wrong action).
    pointerDistance: 12,
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
          coordinates: {
            draggable: true,
            // true, not {dragable:true} because that is worse UX
            midpoints: true,
          },
        },
      },
      "freehand-linestring": {
        feature: {
          draggable: true,
          coordinates: {
            draggable: true,
            // true, not {dragable:true} because that is worse UX
            midpoints: true,
          },
        },
      },
      polygon: {
        feature: {
          draggable: true,
          coordinates: {
            draggable: true,
            // true, not {dragable:true} because that is worse UX
            midpoints: true,
          },
        },
      },
    },
    styles: {
      // https://github.com/JamesLMilner/terra-draw/blob/main/guides/5.STYLING.md#selection-points
      // Edit mode: selected = yellow; unselected = blue (from drawing mode styles above).
      selectedPointColor: TERRA_DRAW_COLORS.selectedDark,
      selectionPointColor: TERRA_DRAW_COLORS.selectionPoint,
      selectionPointOpacity: 0.95,
      selectionPointOutlineColor: TERRA_DRAW_COLORS.selectionPoint,
      selectionPointOutlineOpacity: 0.95,
      selectionPointOutlineWidth: 2,
      selectionPointWidth: 7,
      selectedLineStringColor: TERRA_DRAW_COLORS.selectedDark,
      selectedPolygonColor: TERRA_DRAW_COLORS.selectedDark,
      selectedPolygonFillOpacity: 0.3,
      selectedPolygonOutlineColor: TERRA_DRAW_COLORS.selectedDark,
      midPointColor: TERRA_DRAW_COLORS.midPoint,
      midPointOpacity: 0.95,
      midPointOutlineColor: TERRA_DRAW_COLORS.midPoint,
      midPointOutlineOpacity: 0.95,
      midPointOutlineWidth: 0,
      midPointWidth: 3,
    },
  }),
]
