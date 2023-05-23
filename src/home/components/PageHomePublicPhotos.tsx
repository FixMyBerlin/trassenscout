import clsx from "clsx"
import Image from "next/image"
import pngImage1 from "../assets/map-1.jpg"
import pngImage2 from "../assets/map-2.jpg"
import pngImage3 from "../assets/map-3.jpg"
import pngImage4 from "../assets/map-4.jpg"
import pngImage5 from "../assets/map-5.jpg"

export const PageHomePublicPhotos = () => {
  let rotations = ["rotate-2", "-rotate-2", "rotate-2", "rotate-2", "-rotate-2"]

  return (
    <div className="-my-4 flex justify-center gap-5 overflow-hidden py-4 sm:gap-8">
      {[pngImage1, pngImage2, pngImage3, pngImage4, pngImage5].map((image, imageIndex) => (
        <div
          key={image.src}
          className={clsx(
            "relative aspect-square w-44 flex-none overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 sm:w-72 sm:rounded-2xl",
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
