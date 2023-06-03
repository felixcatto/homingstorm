import { Placement } from '@floating-ui/react';
import cn from 'classnames';
import { isEmpty, isFunction, isNull, isString } from 'lodash-es';
import React from 'react';
import { ISelectOption } from '../../lib/types.js';
import { makeCaseInsensitiveRegex, useMergeState } from '../lib/utils.js';
import { Popup, usePopup } from './Popup.js';
import s from './Select.module.css';

type ISelectProps = {
  options: ISelectOption[];
  selectedOption?: ISelectOption | null;
  onSelect?: (selectedOption: ISelectOption) => void;
  optionComponent?: (opts: { option; isSelected }) => JSX.Element;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  inputClass?: string;
  popupClass?: string;
  optionClass?: string;
  nothingFound?: string | (() => JSX.Element);
  offset?: number;
  placement?: Placement;
  dataTest?: string;
};

type IState = {
  ownInputValue: string;
  hasChanges: boolean;
  ownKeyboardChoosenIndex: number | null;
};

const defaultState = {
  ownInputValue: '',
  hasChanges: false,
  ownKeyboardChoosenIndex: null,
};

export const Select = (props: ISelectProps) => {
  const {
    options,
    selectedOption = null,
    nothingFound = null,
    optionComponent = null,
    placeholder = 'Search',
    offset = 10,
    placement = 'bottom-start',
    searchable = true,
    onSelect = null,
    className = '',
    inputClass = '',
    popupClass = '',
    optionClass: parentOptionClass = '',
    dataTest = 'input',
  } = props;

  const popupDataTest = dataTest === 'input' ? 'popup' : `${dataTest}Popup`;

  const [isOpen, setIsOpen] = React.useState(false);
  const [state, setState] = useMergeState<IState>(defaultState);
  const { ownInputValue, hasChanges, ownKeyboardChoosenIndex } = state;

  const { refs, getReferenceProps, popupProps } = usePopup({
    isOpen,
    setIsOpen,
    offset,
    placement,
  });

  const getOptionIndex = (option: ISelectOption, options: ISelectOption[]) => {
    const i = options.findIndex(el => option.value === el.value);
    return i === -1 ? null : i;
  };

  const filteredOptions = React.useMemo(() => {
    const regex = makeCaseInsensitiveRegex(ownInputValue);
    return options.filter(el => el.label.match(regex));
  }, [options, ownInputValue]);

  const parentInputValue = selectedOption ? selectedOption.label : '';
  const inputValue = hasChanges ? ownInputValue : parentInputValue;

  const parentKeyboardChoosenIndex = selectedOption
    ? getOptionIndex(selectedOption, filteredOptions)
    : null;
  const keyboardChoosenIndex = ownKeyboardChoosenIndex ?? parentKeyboardChoosenIndex;

  const isOptionSelected = (option: ISelectOption) =>
    selectedOption && option.value === selectedOption.value;

  const onChange = e => {
    const { value } = e.target;
    if (!isOpen) {
      setIsOpen(true);
    }
    setState({ ownInputValue: value, hasChanges: true, ownKeyboardChoosenIndex: null });
  };

  const selectOption = (el: ISelectOption) => () => {
    const isNewOptionSameAsPrevious = !isNull(selectedOption) && el.value === selectedOption.value;

    setIsOpen(false);
    setState(defaultState);

    if (!isNewOptionSameAsPrevious && onSelect) {
      onSelect(el);
    }
  };

  const myOnKeyDown = e => {
    if (isEmpty(filteredOptions)) return;
    const i = keyboardChoosenIndex;
    switch (e.code) {
      case 'ArrowUp':
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        e.preventDefault(); // stop input cursor from moving left and right
        if (i === null || i === 0) {
          setState({ ownKeyboardChoosenIndex: filteredOptions.length - 1 });
        } else {
          setState({ ownKeyboardChoosenIndex: i - 1 });
        }
        break;
      case 'ArrowDown':
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        e.preventDefault(); // stop input cursor from moving left and right
        if (i === null) {
          setState({ ownKeyboardChoosenIndex: 0 });
        } else {
          setState({ ownKeyboardChoosenIndex: (i + 1) % filteredOptions.length });
        }
        break;
      case 'Enter':
        e.preventDefault(); // stop form submitting
        if (i !== null) {
          selectOption(filteredOptions[i])();
        }
        break;
      case 'Escape':
        setState(defaultState);
        break;
    }
  };

  const preventFocusLoosing = e => e.preventDefault();

  const optionClass = (el, i) =>
    cn(s.option, parentOptionClass, {
      [s.option_selected]: isOptionSelected(el),
      [s.option_keyboardChoosen]: i === keyboardChoosenIndex,
    });

  const { onKeyDown, ...referenceProps } = getReferenceProps() as any;
  const mergedOnKeyDown = e => {
    myOnKeyDown(e);
    onKeyDown(e);
  };

  return (
    <div className={className}>
      <input
        type="text"
        className={cn(inputClass || 'input', { 'cursor-pointer': !searchable })}
        placeholder={placeholder}
        onChange={onChange}
        value={inputValue}
        onKeyDown={mergedOnKeyDown}
        ref={refs.setReference}
        {...referenceProps}
        readOnly={!searchable}
        data-test={dataTest}
      />

      <Popup {...popupProps} shouldSkipCloseAnimation={searchable}>
        <div
          className={popupClass || s.popup}
          onMouseDown={preventFocusLoosing}
          data-test={popupDataTest}
        >
          {filteredOptions.map((el, i) => (
            <div
              key={el.value}
              className={optionClass(el, i)}
              onClick={selectOption(el)}
              data-test="option"
            >
              {optionComponent
                ? React.createElement(optionComponent, {
                    option: el,
                    isSelected: isOptionSelected(el),
                  })
                : el.label}
            </div>
          ))}
          {isEmpty(filteredOptions) && (
            <div className={cn(s.option, s.option_nothingFound)}>
              {isNull(nothingFound) && (
                <div data-test="not-found">
                  <span className="text-slate-500">Nothing found</span>
                  <i className="far fa-sad-tear ml-2 text-lg"></i>
                </div>
              )}
              {isFunction(nothingFound) && React.createElement(nothingFound)}
              {isString(nothingFound) && <div>{nothingFound}</div>}
            </div>
          )}
        </div>
      </Popup>
    </div>
  );
};
