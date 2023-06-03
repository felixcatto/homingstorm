import { Placement } from '@floating-ui/react';
import cn from 'classnames';
import { differenceBy, isEmpty, isFunction, isNull, isString, isUndefined } from 'lodash-es';
import React from 'react';
import { ISelectOption } from '../../lib/types.js';
import { makeCaseInsensitiveRegex, useMergeState } from '../lib/utils.js';
import s from './MultiSelect.module.css';
import { Popup, usePopup } from './Popup.js';

type ISelectProps = {
  options: ISelectOption[];
  selectedOptions?: ISelectOption[];
  onSelect?: (selectedOptions: ISelectOption[]) => void;
  placeholder?: string;
  nothingFound?: string | (() => JSX.Element);
  offset?: number;
  placement?: Placement;
};

type IState = {
  inputValue: string;
  keyboardChoosenIndex: number | null;
  isFocused: boolean;
};

export const MultiSelect = (props: ISelectProps) => {
  const {
    options,
    nothingFound,
    selectedOptions = [],
    placeholder = 'Select...',
    offset = 10,
    placement = 'bottom-start',
    onSelect = () => {},
  } = props;

  const inputRef = React.useRef<any>(null);

  const [state, setState] = useMergeState<IState>({
    inputValue: '',
    keyboardChoosenIndex: null,
    isFocused: false,
  });
  const { inputValue, keyboardChoosenIndex, isFocused } = state;

  const [isOpen, setIsOpen] = React.useState(false);
  const { refs, getReferenceProps, popupProps } = usePopup({
    isOpen,
    setIsOpen,
    offset,
    placement,
  });

  const filteredOptions = React.useMemo(() => {
    const regex = makeCaseInsensitiveRegex(inputValue);
    return differenceBy(options, selectedOptions, 'value').filter(el => el.label.match(regex));
  }, [selectedOptions, inputValue]);

  const onChange = e => {
    if (!isOpen) {
      setIsOpen(true);
    }
    setState({ inputValue: e.target.value, keyboardChoosenIndex: null });
  };

  const selectItem = (el: ISelectOption) => () => {
    const newSelectedOptions = selectedOptions.concat(el);
    onSelect(newSelectedOptions);
    setIsOpen(false);
    setState({ inputValue: '', keyboardChoosenIndex: null });
  };

  const removeOption = el => e => {
    e.stopPropagation();
    const newSelectedOptions = selectedOptions.filter(item => item.value !== el.value);
    onSelect(newSelectedOptions);
  };

  const onKeyDown = e => {
    const i = keyboardChoosenIndex;
    switch (e.code) {
      case 'Backspace':
        if (inputValue) return;
        const newSelectedOptions = selectedOptions.slice(0, -1);
        onSelect(newSelectedOptions);
        break;
      case 'ArrowUp':
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        e.preventDefault(); // stop input cursor from moving left and right
        if (i === null || i === 0) {
          setState({ keyboardChoosenIndex: filteredOptions.length - 1 });
        } else {
          setState({ keyboardChoosenIndex: i - 1 });
        }
        break;
      case 'ArrowDown':
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        e.preventDefault(); // stop input cursor from moving left and right
        if (i === null) {
          setState({ keyboardChoosenIndex: 0 });
        } else {
          setState({ keyboardChoosenIndex: (i + 1) % filteredOptions.length });
        }
        break;
      case 'Enter':
        e.preventDefault(); // stop form submitting
        if (isEmpty(filteredOptions) || isNull(i)) return;
        selectItem(filteredOptions[i])();
        break;
      case 'Escape':
        setState({ keyboardChoosenIndex: null });
        break;
    }
  };

  const myOnClick = () => {
    inputRef.current.focus();
    setState({ isFocused: true });
  };
  const onBlur = () => setState({ isFocused: false });
  const preventFocusLoosing = e => e.preventDefault();

  const itemClass = (el, i) =>
    cn(s.item, {
      [s.item_keyboardChoosen]: i === keyboardChoosenIndex,
    });

  const { onClick, ...referenceProps } = getReferenceProps() as any;
  const mergedOnClick = e => {
    myOnClick();
    onClick(e);
  };

  return (
    <div>
      <div
        data-test="inputWrapper"
        className={cn(s.selectRoot, 'input', { [s.selectRoot_focused]: isFocused })}
        onClick={mergedOnClick}
        onBlur={onBlur}
        ref={refs.setReference}
        {...referenceProps}
      >
        <div className={cn(s.selectRow)}>
          {selectedOptions.map(el => (
            <div data-test="selectedOption" key={el.value} className={s.selectedItem}>
              <div data-test="selectedOptionLabel">{el.label}</div>
              <i
                data-test="removeBtn"
                className={cn('fa fa-circle-xmark ml-1', s.removeIcon)}
                onClick={removeOption(el)}
                onMouseDown={preventFocusLoosing}
              ></i>
            </div>
          ))}
          <input
            data-test="input"
            ref={inputRef}
            type="text"
            autoComplete="off"
            className={cn(s.input, { [s.input_active]: isFocused || isEmpty(selectedOptions) })}
            placeholder={isEmpty(selectedOptions) ? placeholder : ''}
            onKeyDown={onKeyDown}
            onChange={onChange}
            value={inputValue}
          />
        </div>
      </div>

      <Popup {...popupProps} shouldSkipCloseAnimation>
        <div data-test="popup" className={s.list} onMouseDown={preventFocusLoosing}>
          {filteredOptions.map((el, i) => (
            <div
              data-test="option"
              key={el.value}
              className={itemClass(el, i)}
              onClick={selectItem(el)}
            >
              {el.label}
            </div>
          ))}
          {isEmpty(filteredOptions) && (
            <div className={cn(s.item, s.item_nothingFound)}>
              {isUndefined(nothingFound) && (
                <div>
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
