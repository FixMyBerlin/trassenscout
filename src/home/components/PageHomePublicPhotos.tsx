import clsx from "clsx"
import Image from "next/image"
import pngImage1 from "../assets/map-part1.png"
import pngImage2 from "../assets/map-part2.png"
import pngImage3 from "../assets/map-part3.png"
import pngImage4 from "../assets/map-part4.png"
import pngImage5 from "../assets/map-part5.png"

export const PageHomePublicPhotos = () => {
  let rotations = ["rotate-2", "-rotate-2", "rotate-2", "rotate-2", "-rotate-2"]

  return (
    <div className="-my-4 flex justify-center gap-5 overflow-hidden py-4 sm:gap-8">
      {[pngImage1, pngImage2, pngImage3, pngImage4, pngImage5].map((image, imageIndex) => (
        <div
          key={image.src}
          className={clsx(
            "relative aspect-[1/1] w-44 flex-none overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:w-72 sm:rounded-2xl",
            rotations[imageIndex % rotations.length]
          )}
        >
          <Image
            src={image}
            alt=""
            sizes="(min-width: 640px) 18rem, 11rem"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  )
}
