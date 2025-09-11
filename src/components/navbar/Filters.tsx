'use client';

import { useFilters } from '@/hooks/useFilters';
import { Button, Spinner } from '@nextui-org/react';

export default function Filters() {
  const {
    genderList,
    orderByList,
    filters,
    selectAge,
    selectGender,
    selectOrder,
    clientLoaded,
    isPending,
    totalCount,
    selectWithPhoto,
  } = useFilters();

  return (
    <div className='shadow-md py-2'>
      <div className='flex flex-row justify-around items-center'>
        <div className='flex gap-2 items-center'>
          <div className='text-secondary font-semibold text-xl'>
            Results: {isPending ? <Spinner size='sm' color='secondary' /> : totalCount}
          </div>
        </div>

        <div className='flex gap-2 items-center'>
          <div>Gender:</div>
          {genderList.map(({ icon: Icon, value }) => (
            <Button
              key={value}
              size='sm'
              isIconOnly
              color={filters.gender.includes(value) ? 'secondary' : 'default'}
              onClick={() => selectGender(value)}
            >
              <Icon size={24} />
            </Button>
          ))}
        </div>
        <div className='flex flex-row items-center gap-2 w-1/4'>
          <div className="flex flex-col w-full">
            <label className="text-sm text-gray-600 mb-1">Age range: {filters.ageRange[0]} - {filters.ageRange[1]}</label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="18"
                max="100"
                value={filters.ageRange[0]}
                onChange={(e) => selectAge([parseInt(e.target.value), filters.ageRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="18"
                max="100"
                value={filters.ageRange[1]}
                onChange={(e) => selectAge([filters.ageRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        <div className='flex flex-col items-center'>
          <p className='text-sm'>With photo</p>
          <input
            type="checkbox"
            defaultChecked={filters.withPhoto}
            onChange={(e) => selectWithPhoto(e.target.checked)}
            className="mt-1"
          />
        </div>
        <div className='w-1/4'>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Order by</label>
            <select
              value={filters.orderBy}
              onChange={(e) => selectOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {orderByList.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
