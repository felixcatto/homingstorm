import cn from 'classnames';
import { isEmpty } from 'lodash-es';
import Image from 'next/image.js';
import React from 'react';
import { IHeaderCellProps, ISortOrder } from '../../lib/types.js';
import { filterTypes, sortOrders } from '../lib/utils.js';
import s from './HeaderCell.module.css';
import { Popup, usePopup } from './Popup.js';
import { SearchFilter, SelectFilter } from './TableFilters.js';

const getSortOrderIcon = (sortOrder: ISortOrder) => {
  switch (sortOrder) {
    case sortOrders.asc:
      return '/img/sortDown.svg';
    case sortOrders.desc:
      return '/img/sortUp.svg';
    default:
      return '/img/sort.svg';
  }
};

export const HeaderCell = (props: IHeaderCellProps) => {
  const {
    children,
    name,
    onSortChange,
    onFilterChange,
    filters,
    sortable = false,
    sortBy,
    sortOrder: parentSortOrder = null,
    className = '',
  } = props;

  const sortOrder = sortBy === name ? parentSortOrder : null;
  const filterObj = filters[name];
  const filterType = filterObj?.filterType;

  const [isOpen, setIsOpen] = React.useState(false);

  const { refs, getReferenceProps, popupProps } = usePopup({
    placement: 'bottom-end',
    isOpen,
    setIsOpen,
  });

  const { onClick: onReferenceClick, ...restReferenceProps } = getReferenceProps() as any;
  const stopPropagation = e => e.stopPropagation();
  const onFilterIconClick = e => {
    stopPropagation(e);
    onReferenceClick(e);
  };

  const ownOnSortChange = () => {
    if (!sortable) return;
    onSortChange(sortOrder, name);
  };

  return (
    <th
      className={cn(s.headCell, className, { [s.headCell_sortable]: sortable })}
      onClick={ownOnSortChange}
      ref={refs.setPositionReference}
    >
      <div className="flex items-center justify-between p-2">
        <div>{children}</div>
        <div className="flex items-center">
          {filterType && (
            <i
              className={cn('fa fa-filter', s.filterIcon, {
                [s.filterIcon_active]: !isEmpty(filterObj.filter),
              })}
              ref={refs.setReference}
              {...restReferenceProps}
              onClick={onFilterIconClick}
            ></i>
          )}
          {sortable && <Image src={getSortOrderIcon(sortOrder)} width={16} height={16} alt="" />}
        </div>
      </div>

      {filterType && (
        <Popup {...popupProps}>
          <div
            className="p-2 rounded shadow border border-slate-200 bg-white"
            onClick={stopPropagation}
          >
            {filterType === filterTypes.search && (
              <SearchFilter
                name={name}
                filter={filterObj.filter}
                onFilter={onFilterChange}
                setIsOpen={setIsOpen}
              />
            )}
            {filterType === filterTypes.select && (
              <SelectFilter
                name={name}
                filter={filterObj.filter}
                onFilter={onFilterChange}
                setIsOpen={setIsOpen}
                filterOptions={filterObj.filterOptions}
              />
            )}
          </div>
        </Popup>
      )}
    </th>
  );
};
