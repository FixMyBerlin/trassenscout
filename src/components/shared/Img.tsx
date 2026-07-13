import type { ComponentPropsWithoutRef } from "react"

type StaticImageLike = {
  src: string
}

type ImgProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  src?: ComponentPropsWithoutRef<"img">["src"] | StaticImageLike
}

function getImageSrc(src: ImgProps["src"]) {
  return typeof src === "object" && src !== null && "src" in src ? src.src : src
}

export function Img({ alt = "", loading = "lazy", decoding = "async", src, ...props }: ImgProps) {
  return <img alt={alt} loading={loading} decoding={decoding} src={getImageSrc(src)} {...props} />
}
