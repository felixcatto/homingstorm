import cn from 'classnames';
import s from './Collapse.module.css';

type ICollapseProps = {
  isHidden: boolean;
  children: any;
  minimumElHeight?: number;
};

export const Collapse = (props: ICollapseProps) => {
  const { isHidden, children, minimumElHeight = 65 } = props;

  const collapseClass = cn(s.collapse, {
    [s.collapse_hidden]: isHidden,
  });

  return (
    <div className={collapseClass} style={{ '--minimumElHeight': `${minimumElHeight}px` } as any}>
      <div className={s.collapseInner}>{children}</div>
    </div>
  );
};
