import React from 'react';
import { TDate } from '../../fakeServer/rs8/dates.const';
import { DateEntry } from './DateEntry';

type Props = {
  dates: TDate[];
};

export const DateList: React.FC<Props> = ({ dates }) => {
  if (!dates.length) {
    return (
      <p className="py-3 text-base text-gray-500">
        <span>Es wurden noch keine Termine eingetragen</span>
      </p>
    );
  }

  return (
    <ul className="overflow-clip rounded-lg border border-x-2 border-gray-100 shadow-md">
      {dates.map((date) => {
        return (
          <li
            key={date.start}
            className="border-t-2 border-gray-100 first:border-t-0"
          >
            <DateEntry date={date} />
          </li>
        );
      })}
    </ul>
  );
};
