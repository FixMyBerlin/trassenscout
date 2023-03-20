import * as React from "react"

const Pin = () => {
  return (
    <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_4450_57938)">
        <g filter="url(#filter0_d_4450_57938)">
          <path
            d="M19.5312 50C19.5312 50 32.7872 33.5791 35.1625 30.4904C37.6115 27.3059 39.0625 23.3485 39.0625 19.0604C39.0625 8.53366 30.3181 0 19.5312 0C8.74444 0 0 8.53366 0 19.0604C0 23.3506 1.45239 27.3098 3.90356 30.4951C6.27905 33.5821 19.5312 50 19.5312 50Z"
            fill="#E5007D"
          />
        </g>
        <ellipse
          opacity="0.01"
          cx="19.5312"
          cy="18.9025"
          rx="15.8691"
          ry="15.8537"
          fill="#E5007D"
        />
        <rect x="11.7188" y="10.9375" width="15.6403" height="15.625" rx="7.8125" fill="white" />
      </g>
      <defs>
        <filter
          id="filter0_d_4450_57938"
          x="-13"
          y="-10"
          width="65.0625"
          height="76"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="6.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4450_57938" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_4450_57938"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_4450_57938">
          <rect width="39.0625" height="50" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default React.memo(Pin)
