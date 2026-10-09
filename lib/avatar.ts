import { getImageProps } from "next/image"

/** A GitHub avatar, served through this site's own image optimiser (nothing loads from another host). */
export const avatar = (src: string, size: number) => getImageProps({ src, width: size, height: size, alt: "" }).props.src
