import cn from 'classnames';
import s from './Checkbox.module.css';

type ICheckboxProps = {
  onChange: (e: any) => void;
  checked: boolean;
  partiallyChecked?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
};

type IExpandboxProps = {
  onClick: (e: any) => void;
  isExpanded: boolean;
  className?: string;
};

export const Checkbox = (props: ICheckboxProps) => {
  const {
    onChange,
    checked,
    partiallyChecked = false,
    label = '',
    className = '',
    disabled = false,
  } = props;

  const visualBoxClass = cn(s.visualBox, {
    [s.visualBox_disabled]: disabled,
    [s.visualBox_active]: checked,
  });
  const checkMarkClass = cn('fa fa-check', s.checkMark, {
    [s.checkMark_active]: checked,
  });
  const partiallyCheckedClass = cn(s.partiallyChecked, {
    [s.partiallyChecked_active]: partiallyChecked,
  });
  const labelClass = cn(s.label, {
    [s.label_disabled]: disabled,
  });

  return (
    <label className={cn(s.checkbox, className)}>
      <input
        type="checkbox"
        className={s.input}
        disabled={disabled}
        onChange={onChange}
        checked={checked}
      />
      <div className={visualBoxClass}>
        <i className={checkMarkClass}></i>
        <div className={partiallyCheckedClass}></div>
      </div>
      {label && <div className={labelClass}>{label}</div>}
    </label>
  );
};

export const Expandbox = (props: IExpandboxProps) => {
  const { onClick, isExpanded, className = '' } = props;

  const iconWrapClass = cn(s.iconWrap, {
    [s.iconWrap_active]: isExpanded,
  });

  const lineClass = lineMod =>
    cn(s.line, lineMod, {
      [s.line_expanded]: isExpanded,
    });

  return (
    <div className={cn(s.expandbox, className)} onClick={onClick}>
      <div className={s.expandVisualBox}>
        <div className={iconWrapClass}>
          <div className={lineClass(s.line_one)}></div>
          <div className={lineClass(s.line_two)}></div>
        </div>
      </div>
    </div>
  );
};
