import cn from 'classnames';
import { isEmpty } from 'lodash-es';
import React from 'react';
import { ISearchFilterProps, ISelectFilterProps, ISelectOption } from '../../lib/types.js';
import { useMergeState } from '../lib/utils.js';
import { Checkbox } from './Checkbox.js';

type ISearchFilterState = {
  ownFilter: string;
  hasChanges: boolean;
};

export const SearchFilter = (props: ISearchFilterProps) => {
  const { filter: parentFilter, onFilter, name, setIsOpen } = props;
  const [state, setState] = useMergeState<ISearchFilterState>({ ownFilter: '', hasChanges: false });
  const { ownFilter, hasChanges } = state;

  const filter = hasChanges ? ownFilter : parentFilter;

  const onOwnFilterChange = e => setState({ ownFilter: e.target.value, hasChanges: true });
  const onResetOwnFilter = () => setState({ ownFilter: '', hasChanges: true });
  const onFilterChange = () => {
    onFilter(filter, name);
    setIsOpen(false);
    setState({ ownFilter: '', hasChanges: false });
  };
  const onFilterKeydown = e => {
    if (isEmpty(filter) || e.code !== 'Enter') return;
    onFilterChange();
  };

  return (
    <>
      <input
        type="text"
        className="input mb-4 w-52"
        placeholder="Search"
        onChange={onOwnFilterChange}
        onKeyDown={onFilterKeydown}
        value={filter}
      />
      <div className="flex items-center justify-between">
        <div
          className={cn('link text-sm mr-5', { link_disabled: !filter })}
          onClick={onResetOwnFilter}
        >
          Reset
        </div>
        <button className="btn btn_primary btn_sm rounded-md" onClick={onFilterChange}>
          Ok
        </button>
      </div>
    </>
  );
};

type ISelectFilterState = {
  ownFilter: ISelectOption[];
  hasChanges: boolean;
};

export const SelectFilter = (props: ISelectFilterProps) => {
  const { filter: parentFilter, onFilter, name, setIsOpen, filterOptions } = props;
  const [state, setState] = useMergeState<ISelectFilterState>({ ownFilter: [], hasChanges: false });
  const { ownFilter, hasChanges } = state;

  const filter = hasChanges ? ownFilter : parentFilter;

  const onOwnFilterChange = filterOption => e => {
    const shouldAddNewFilter = e.target.checked;
    const newFilter = shouldAddNewFilter
      ? filter.concat(filterOption)
      : filter.filter(el => el.value !== filterOption.value);

    setState({ ownFilter: newFilter, hasChanges: true });
  };
  const onResetOwnFilter = () => setState({ ownFilter: [], hasChanges: true });
  const onFilterChange = () => {
    onFilter(filter, name);
    setIsOpen(false);
    setState({ ownFilter: [], hasChanges: false });
  };

  return (
    <>
      <div className="mb-3">
        {filterOptions.map(el => (
          <div key={el.value}>
            <Checkbox
              label={el.label}
              checked={filter.some(filterEl => filterEl.value === el.value)}
              onChange={onOwnFilterChange(el)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div
          className={cn('link text-sm mr-5', { link_disabled: isEmpty(filter) })}
          onClick={onResetOwnFilter}
        >
          Reset
        </div>
        <button className="btn btn_primary btn_sm rounded-md" onClick={onFilterChange}>
          Ok
        </button>
      </div>
    </>
  );
};
