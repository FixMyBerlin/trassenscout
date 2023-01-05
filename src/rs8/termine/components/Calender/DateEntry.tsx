import { ComputerDesktopIcon } from "@heroicons/react/24/outline"
import { CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/solid"
import clsx from "clsx"
import React from "react"
import { TDate } from "src/fakeServer/rs8/dates.const"
import { Disclosure } from "../Disclosure"
import { Link, linkStyles } from "src/core/components/links"
import { Markdown } from "src/core/components/Markdown/Markdown"

type Props = {
  date: TDate
}

export const DateEntry: React.FC<Props> = ({ date }) => {
  const locationDomain = date.locationUrl && new URL(date.locationUrl).hostname

  return (
    <Disclosure
      classNameButton="py-4 px-6 text-left text-sm text-gray-900"
      classNamePanel="px-6 pb-3"
      button={
        <div className="flex-auto">
          <h3 className={clsx("pr-10 font-semibold group-hover:underline md:pr-0", linkStyles)}>
            {date.title}
          </h3>
          <dl className="mt-2 flex w-full flex-row justify-between">
            {/* Date / Location / Arrow Container */}
            <div className="flex flex-col justify-start md:flex-row md:items-center md:space-x-8">
              {/* Date / Location Container */}
              <div className="flex items-start space-x-3">
                <dt className="">
                  <span className="sr-only">Termin</span>
                  <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                </dt>
                <dd>
                  <time className=" text-gray-500" dateTime={date.start}>
                    {new Date(date.start).toLocaleDateString()}
                  </time>
                </dd>
                <dd>
                  <time className=" text-gray-500" dateTime={date.start}>
                    {new Date(date.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </dd>
              </div>
              <div className="flex items-start space-x-3">
                {date.locationUrl && (
                  <>
                    <dt>
                      <span className="sr-only">Online-Konferenz-URL</span>{" "}
                      <ComputerDesktopIcon className="h-5 w-5 text-gray-500" />
                    </dt>
                    <dd className="text-gray-500">
                      <Link blank href={date.locationUrl}>
                        {locationDomain}
                      </Link>
                    </dd>
                  </>
                )}
                {date.locationName && (
                  <>
                    <dt>
                      <span className="sr-only">Treffpunkt</span>{" "}
                      <MapPinIcon className="h-5 w-5 text-gray-500" />
                    </dt>
                    <dd className="text-gray-500">{date.locationName}</dd>
                  </>
                )}
              </div>
            </div>
          </dl>
        </div>
      }
    >
      {!date.description ? (
        <p className="text-gray-300">Für diesen Termin liegen keine Details vor.</p>
      ) : (
        <Markdown className="prose-sm" markdown={date.description} />
      )}
    </Disclosure>
  )
}

// export const DateEntry: React.FC<Props> = ({ date }) => {
//   const locationDomain = date.locationUrl && new URL(date.locationUrl).hostname;

//   return (
//     <HeadlessUiDisclosure>
//       {({ open }) => (
//         <>
//           {/* Termin - eingeklappt / Button */}
//           <HeadlessUiDisclosure.Button className="group flex w-full justify-between  space-y-4 bg-white py-3 px-6 text-left text-sm font-medium text-gray-900 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
//             <div className="flex-auto">
//               <h3 className="pr-10 font-semibold text-gray-900 underline-offset-4 group-hover:underline md:pr-0">
//                 {date.title}
//               </h3>
//               <dl className="mt-2 flex w-full flex-row justify-between">
//                 {/* Date / Location / Arrow Container */}
//                 <div className="flex flex-col justify-start md:flex-row md:items-center md:space-x-8">
//                   {/* Date / Location Container */}
//                   <div className="flex items-start space-x-3">
//                     <dt className="">
//                       <span className="sr-only">Termin</span>
//                       <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
//                     </dt>
//                     <dd>
//                       <time className=" text-gray-500" dateTime={date.start}>
//                         {new Date(date.start).toLocaleDateString()}
//                       </time>
//                     </dd>
//                     <dd>
//                       <time className=" text-gray-500" dateTime={date.start}>
//                         {new Date(date.start).toLocaleTimeString([], {
//                           hour: '2-digit',
//                           minute: '2-digit',
//                         })}
//                       </time>
//                     </dd>
//                   </div>
//                   <div className="flex items-start space-x-3">
//                     {date.locationUrl && (
//                       <>
//                         <dt>
//                           <span className="sr-only">Online-Konferenz-URL</span>{' '}
//                           <ComputerDesktopIcon className="h-5 w-5 text-gray-500" />
//                         </dt>
//                         <dd className="text-gray-500">
//                           <Link to={date.locationUrl} newWindow>
//                             {locationDomain}
//                           </Link>
//                         </dd>
//                       </>
//                     )}
//                     {date.locationName && (
//                       <>
//                         <dt>
//                           <span className="sr-only">Treffpunkt</span>{' '}
//                           <MapPinIcon className="h-5 w-5 text-gray-500" />
//                         </dt>
//                         <dd className="text-gray-500">{date.locationName}</dd>
//                       </>
//                     )}
//                   </div>
//                 </div>
//                 {open ? (
//                   <ChevronUpIcon className="h-3 w-3 text-gray-700 group-hover:text-black" />
//                 ) : (
//                   <ChevronDownIcon className="h-3 w-3 text-gray-700 group-hover:text-black" />
//                 )}
//               </dl>
//             </div>
//           </HeadlessUiDisclosure.Button>
//           <Transition
//             show={open}
//             enter="transition duration-100 ease-out"
//             enterFrom="transform scale-95 opacity-0"
//             enterTo="transform scale-100 opacity-100"
//             leave="transition duration-75 ease-out"
//             leaveFrom="transform scale-100 opacity-100"
//             leaveTo="transform scale-95 opacity-0"
//           >
//             {/* Termin - ausgeklappt / zusätzliche Info */}
//             <HeadlessUiDisclosure.Panel
//               static
//               className="overflow-clip px-6 pb-3 text-sm"
//             >
//               {!date.description ? (
//                 <p className="text-gray-300">
//                   Für diesen Termin liegen keine Details vor.
//                 </p>
//               ) : (
//                 <Markdown
//                   className="prose-sm prose-a:underline"
//                   markdown={date.description}
//                 />
//               )}
//             </HeadlessUiDisclosure.Panel>
//           </Transition>
//         </>
//       )}
//     </HeadlessUiDisclosure>
//   );
// };
