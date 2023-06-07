import { Side } from '@floating-ui/react';
import { Link as RemixLink, useLocation } from '@remix-run/react';
import { RemixLinkProps } from '@remix-run/react/dist/components';
import cn from 'classnames';
import { format, parseISO } from 'date-fns';
import { useFormikContext } from 'formik';
import produce from 'immer';
import { get, isEmpty, isFunction, isNull, isNumber, keyBy, omit, orderBy } from 'lodash';
import React from 'react';
import { createPortal } from 'react-dom';
import stringMath from 'string-math';
import { filterTypes, makeEnum, roles, sortOrders } from '../../lib/sharedUtils';
import {
  IApiErrors,
  IContext,
  IEmptyObject,
  IFMultiSelectProps,
  IMixedFilter,
  ISelectedOption,
  ISortOrder,
  IUseMergeState,
  IUseSelectedRows,
  IUseSubmit,
  IUseTable,
  IUseTableState,
  IUsualSelect,
  IWSDecodeReturn,
} from '../../lib/types';
import { MultiSelect } from '../ui/MultiSelect';
import { Select } from '../ui/Select';
import Context from './context';

export * from '../../lib/sharedUtils';
export { Context };

export const useContext = () => React.useContext<IContext>(Context);

export const Link = (props: Partial<RemixLinkProps> & { href?: string }) => {
  const newProps = { ...props, to: props.href || props.to } as any;
  return <RemixLink {...newProps} />;
};

export const NavLink = ({ href, children, ...restProps }) => {
  const location = useLocation();
  const { pathname } = location;
  const className = cn('nav-link', {
    'nav-link_active':
      (href !== '/' && pathname.startsWith(href)) || (href === '/' && pathname === '/'),
  });
  return (
    <Link {...restProps} href={href} className={className}>
      {children}
    </Link>
  );
};

export const dedup = fn => {
  let isRunning = false;
  return async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      return await fn();
    } finally {
      isRunning = false;
    }
  };
};

export const userRolesToIcons = {
  [roles.admin]: 'fa fa-star',
  [roles.user]: 'fa fa-fire',
  [roles.guest]: 'fa fa-ghost',
};

export const useMergeState: IUseMergeState = initialState => {
  const [state, setState] = React.useState(initialState);

  const setImmerState = React.useCallback(fnOrObject => {
    if (isFunction(fnOrObject)) {
      const fn = fnOrObject;
      setState(curState => {
        const newState = fn(curState);
        return { ...curState, ...newState };
      });
    } else {
      const newState = fnOrObject;
      setState(curState => ({ ...curState, ...newState }));
    }
  }, []);

  return [state, setImmerState];
};

type ITooltipContext = {
  x;
  y;
  strategy;
  refs;
  context;
  getReferenceProps;
  getFloatingProps;
  placement: Side;
  className;
  theme;
};
export const TooltipContext = React.createContext<ITooltipContext>(null as any);

export const FormContext = React.createContext<IApiErrors>(null as any);

export const FormWrapper = ({ apiErrors, setApiErrors, children }) => (
  <FormContext.Provider value={{ apiErrors, setApiErrors }}>{children}</FormContext.Provider>
);

export const WithApiErrors = (Component: React.ComponentType<IApiErrors>) => props => {
  const [apiErrors, setApiErrors] = React.useState({}); // eslint-disable-line
  return (
    <FormContext.Provider value={{ apiErrors, setApiErrors }}>
      <Component {...props} apiErrors={apiErrors} setApiErrors={setApiErrors} />
    </FormContext.Provider>
  );
};

export const useSubmit: IUseSubmit = onSubmit => {
  const { setApiErrors } = React.useContext(FormContext);

  const wrappedSubmit = async (values, actions) => {
    try {
      await onSubmit(values, actions);
    } catch (e: any) {
      const errors = e.response?.data?.errors;
      if (errors) setApiErrors(errors);
    }
  };

  return wrappedSubmit;
};

export const ErrorMessage = ({ name }) => {
  const { apiErrors } = React.useContext(FormContext);
  const error = apiErrors[name];
  return error ? <div className="error">{error}</div> : null;
};

export const Field = props => {
  const { apiErrors, setApiErrors } = React.useContext(FormContext);
  const { values, handleBlur: onBlur, handleChange }: any = useFormikContext();
  const value = values[props.name];
  const { as, children, ...restProps } = props;
  const asElement = as || 'input';
  const onChange = e => {
    setApiErrors(omit(apiErrors, e.target.name));
    handleChange(e);
  };

  return React.createElement(asElement, { ...restProps, onChange, onBlur, value }, children);
};

export const SubmitBtn = ({ children, ...props }) => {
  const { isSubmitting } = useFormikContext();
  return (
    <button type="submit" disabled={isSubmitting} {...props}>
      {children}
    </button>
  );
};

export const UsualSelect: IUsualSelect = ({ name, options, defaultItem }) => {
  const { setFieldValue } = useFormikContext();
  const [selectedOption, setSelectedOption] = React.useState<ISelectedOption>(null);
  const computedOption = selectedOption || defaultItem;

  return (
    <Select
      options={options}
      selectedOption={computedOption}
      placeholder=""
      searchable={false}
      onSelect={selectedOption => {
        setFieldValue(name, selectedOption.value, false);
        setSelectedOption(selectedOption);
      }}
    />
  );
};

export const FMultiSelect = (props: IFMultiSelectProps) => {
  const { name, options, defaultOptions = [] } = props;
  const { setFieldValue } = useFormikContext();
  const [selectedOptions, setSelectedOptions] = React.useState(defaultOptions);

  return (
    <MultiSelect
      options={options}
      selectedOptions={selectedOptions}
      onSelect={newSelectedOptions => {
        setSelectedOptions(newSelectedOptions);
        setFieldValue(
          name,
          newSelectedOptions.map(el => el.value),
          false
        );
      }}
    />
  );
};

export const emptyObject: IEmptyObject = new Proxy(
  {},
  {
    get() {
      return '';
    },
  }
);

export const decode = (message: string) => JSON.parse(message) as IWSDecodeReturn;

export const tooltipRootId = 'tooltipRoot';
export const popoverRootId = 'popoverRoot';

export const Portal = ({ children, selector }) => {
  const ref: any = React.useRef();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    ref.current = document.querySelector(selector);
    setMounted(true);
  }, [selector]);

  return mounted ? createPortal(children, ref.current) : null;
};

export const fmtISO = (isoDate, formatStr) => format(parseISO(isoDate), formatStr);

export const makeCaseInsensitiveRegex = str =>
  new RegExp(str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');

export const toSelectOptions = values => values.map(value => ({ value, label: value }));

export const getCssValue = (cssValue: string) =>
  stringMath(cssValue.trim().replaceAll('calc', '').replaceAll('s', ''));

export const isTabActive = () => document.visibilityState === 'visible';

export const useTable: IUseTable = props => {
  const { rows: originalRows } = props;

  const [state, setState] = useMergeState<IUseTableState>({
    page: props.page,
    size: props.size,
    sortBy: props.sortBy,
    sortOrder: props.sortOrder,
    filters: props.filters,
  });
  const { page, size, sortBy, sortOrder, filters } = state;

  const filtersList = React.useMemo(() => (filters ? Object.values(filters) : []), [filters]);

  const onPageChange = newPage => setState({ page: newPage });
  const onSizeChange = newSize => setState({ size: newSize, page: 0 });

  const onSortChange = (sortOrder, sortBy) => {
    let newSortOrder: ISortOrder = null;
    if (isNull(sortOrder)) newSortOrder = sortOrders.asc;
    if (sortOrders.asc === sortOrder) newSortOrder = sortOrders.desc;

    setState({ sortBy, sortOrder: newSortOrder });
  };

  const onFilterChange = (filter: IMixedFilter, filterBy) => {
    if (!filters) return;
    setState({
      filters: produce(filters, draft => {
        draft[filterBy].filter = filter;
      }),
      page: 0,
    });
  };

  const { rows, totalRows } = React.useMemo(() => {
    if (!originalRows) return { rows: [], totalRows: 0 };

    let filtered;

    if (isEmpty(filtersList)) {
      filtered = originalRows;
    } else {
      filtered = originalRows.filter(row =>
        filtersList.every(filterObj => {
          const { filter, filterBy, filterType, customFilterFn } = filterObj;
          if (isEmpty(filter)) return true;

          const rowValueOfField = get(row, filterBy);
          if (customFilterFn) {
            return customFilterFn(rowValueOfField, filter);
          }

          if (filterType === filterTypes.search) {
            const regex = makeCaseInsensitiveRegex(filter);
            return rowValueOfField.match(regex);
          }

          if (filterType === filterTypes.select) {
            return filter.some(selectFilter => selectFilter.value === rowValueOfField);
          }
        })
      );
    }

    const sorted = sortBy && sortOrder ? orderBy(filtered, sortBy, sortOrder) : filtered;

    const paginated =
      size && isNumber(page) ? sorted.slice(page * size, page * size + size) : sorted;

    return { rows: paginated, totalRows: sorted.length };
  }, [originalRows, page, size, sortBy, sortOrder, filters]);

  const paginationProps = { totalRows, page, size, onPageChange, onSizeChange };
  const headerCellProps = { sortBy, sortOrder, filters, onSortChange, onFilterChange };

  return {
    rows,
    totalRows,
    page: page as any,
    size: size as any,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any,
    filters: filters as any,
    paginationProps,
    headerCellProps,
  };
};

export const useSelectedRows: IUseSelectedRows = props => {
  const { rows, defaultSelectedRows = {}, rowKey = 'id' } = props;
  const [selectedRows, setSelectedRows] = React.useState(defaultSelectedRows);

  const selectedRowsState = React.useMemo(() => {
    if (isEmpty(selectedRows)) return selectedRowsStates.none;
    if (Object.keys(selectedRows).length === rows.length) return selectedRowsStates.all;
    return selectedRowsStates.partially;
  }, [rows, selectedRows]);

  const isRowSelected = row => (selectedRows[row[rowKey]] ? true : false);

  const onSelectAllRows = () => {
    if (selectedRowsState === selectedRowsStates.all) {
      setSelectedRows({});
    } else {
      setSelectedRows(keyBy(rows, rowKey));
    }
  };

  const onSelectRow = row => () => {
    const rowId = row[rowKey];
    if (isRowSelected(row)) {
      delete selectedRows[rowId];
      setSelectedRows({ ...selectedRows });
    } else {
      selectedRows[rowId] = row;
      setSelectedRows({ ...selectedRows });
    }
  };

  const selectAllRowsCheckboxProps = {
    onChange: onSelectAllRows,
    checked: selectedRowsState === selectedRowsStates.all,
    partiallyChecked: selectedRowsState === selectedRowsStates.partially,
  };

  return { selectedRows, setSelectedRows, isRowSelected, onSelectRow, selectAllRowsCheckboxProps };
};

export const selectedRowsStates = makeEnum('all', 'none', 'partially');

export const useSetGlobalState = () => {
  const { useStore } = useContext();
  return useStore(state => state.setGlobalState);
};

export const usePendingValues = (asyncFn, onSuccess?) => {
  const [pendingValues, setPendingValues] = React.useState<any[]>([]);

  const execute = React.useCallback(
    value => async () => {
      if (pendingValues.includes(value)) return;

      setPendingValues(pendingValues => pendingValues.concat(value));
      try {
        await asyncFn(value);
        if (onSuccess) onSuccess();
      } catch (e) {
        throw e;
      } finally {
        setPendingValues(pendingValues =>
          pendingValues.filter(pendingValue => pendingValue !== value)
        );
      }
    },
    [pendingValues]
  );

  return [execute, pendingValues] as const;
};
