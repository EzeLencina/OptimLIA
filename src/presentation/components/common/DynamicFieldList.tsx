import type { ReactNode } from 'react';
import { Button } from './Button';

interface DynamicFieldListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  onAdd: () => T;
  addLabel: string;
}

export function DynamicFieldList<T>({
  items,
  onChange,
  renderItem,
  onAdd,
  addLabel,
}: DynamicFieldListProps<T>) {
  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="dynamic-fields">
        {items.map((item, index) => (
          <div key={index} className="dynamic-field">
            {renderItem(item, index)}
            <button
              className="btn-remove"
              onClick={() => removeItem(index)}
              type="button"
            >
              <i className="fas fa-times" />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        icon={<i className="fas fa-plus" />}
        onClick={() => onChange([...items, onAdd()])}
        type="button"
      >
        {addLabel}
      </Button>
    </>
  );
}
