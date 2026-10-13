// troika-three-text ships no usable types: its package.json names none, and its generated dist/types do not type
// Text as a three.js Mesh. This declares the part the world uses, as the troika-three-text README documents it
// (Text extends THREE.Mesh; sizes are in local units). Drop it once the package ships correct types.
declare module "troika-three-text" {
  import { Mesh, type ColorRepresentation, type Material } from "three"

  export class Text extends Mesh {
    text: string
    /** A .ttf, .otf or .woff URL (.woff2 is not supported). */
    font: string | null
    fontSize: number
    letterSpacing: number
    lineHeight: number | "normal"
    maxWidth: number
    textAlign: "left" | "right" | "center" | "justify"
    anchorX: number | "left" | "center" | "right" | `${number}%`
    anchorY: number | "top" | "top-baseline" | "top-cap" | "top-ex" | "middle" | "bottom-baseline" | "bottom" | `${number}%`
    color: ColorRepresentation | null
    /** Character index → colour, applied from that index on. */
    colorRanges: Record<number, ColorRepresentation> | null
    fillOpacity: number
    outlineWidth: number | `${number}%`
    outlineBlur: number | `${number}%`
    outlineColor: ColorRepresentation
    outlineOpacity: number
    material: Material
    /** Layout as of the last finished sync, or null before the first. */
    readonly textRenderInfo: { blockBounds: [number, number, number, number] } | null
    sync(callback?: () => void): void
    dispose(): void
  }
}
