import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export type FilterOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'in'
  | 'isNull'
  | 'isNotNull';

export type FilterType = 'text' | 'number' | 'date' | 'select' | 'boolean' | 'range';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  operators?: FilterOperator[];
  placeholder?: string;
}

export interface ActiveFilter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface FilterPanelProps {
  fields: FilterField[];
  activeFilters: ActiveFilter[];
  onFilterChange: (filters: ActiveFilter[]) => void;
  onClearFilters: () => void;
  className?: string;
  title?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  children?: ReactNode;
}

export function FilterPanel({
  fields,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className,
  title = 'Filters',
  collapsible = true,
  defaultCollapsed = false,
  children,
}: FilterPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator>('equals');
  const [filterValue, setFilterValue] = useState<string>('');

  const handleAddFilter = useCallback(() => {
    if (!selectedField || !filterValue) return;
    
    const newFilter: ActiveFilter = {
      field: selectedField,
      operator: selectedOperator,
      value: filterValue,
    };
    
    onFilterChange([...activeFilters, newFilter]);
    
    // Reset form
    setSelectedField('');
    setFilterValue('');
    setShowAddFilter(false);
  }, [selectedField, selectedOperator, filterValue, activeFilters, onFilterChange]);

  const removeFilter = useCallback((index: number) => {
    const newFilters = [...activeFilters];
    newFilters.splice(index, 1);
    onFilterChange(newFilters);
  }, [activeFilters, onFilterChange]);

  const getFieldLabel = (key: string) => {
    return fields.find(f => f.key === key)?.label || key;
  };

  const getFieldType = (key: string) => {
    return fields.find(f => f.key === key)?.type || 'text';
  };

  const getOperatorLabel = (operator: FilterOperator) => {
    const labels: Record<FilterOperator, string> = {
      equals: '=',
      notEquals: '≠',
      contains: 'contains',
      startsWith: 'starts with',
      endsWith: 'ends with',
      greaterThan: '>',
      lessThan: '<',
      between: 'between',
      in: 'in',
      isNull: 'is empty',
      isNotNull: 'is not empty',
    };
    return labels[operator];
  };

  const formatFilterValue = (filter: ActiveFilter) => {
    const value = filter.value;
    if (value === null || value === undefined) return 'empty';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const selectedFieldDef = fields.find(f => f.key === selectedField);
  const availableOperators = selectedFieldDef?.operators || ['equals', 'notEquals', 'contains'];

  return (
    <div className={clsx('filterpanel', className)}>
      <div className="filterpanel__header">
        <div className="filterpanel__title-wrapper">
          <Filter size={18} className="filterpanel__icon" />
          <h3 className="filterpanel__title">{title}</h3>
          {activeFilters.length > 0 && (
            <span className="filterpanel__badge">{activeFilters.length}</span>
          )}
        </div>
        
        <div className="filterpanel__actions">
          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="filterpanel__clear"
            >
              Clear all
            </button>
          )}
          
          {collapsible && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="filterpanel__toggle"
            >
              <ChevronDown
                size={18}
                className={clsx('filterpanel__toggle-icon', {
                  'filterpanel__toggle-icon--collapsed': collapsed,
                })}
              />
            </button>
          )}
        </div>
      </div>
      
      {!collapsed && (
        <div className="filterpanel__content">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="filterpanel__active">
              {activeFilters.map((filter, index) => (
                <div key={index} className="filterpanel__chip">
                  <span className="filterpanel__chip-text">
                    {getFieldLabel(filter.field)} {getOperatorLabel(filter.operator)} {formatFilterValue(filter)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFilter(index)}
                    className="filterpanel__chip-remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add Filter Form */}
          {showAddFilter ? (
            <div className="filterpanel__form">
              <select
                value={selectedField}
                onChange={(e) => {
                  setSelectedField(e.target.value);
                  setSelectedOperator('equals');
                }}
                className="filterpanel__select"
              >
                <option value="">Select field...</option>
                {fields.map(field => (
                  <option key={field.key} value={field.key}>{field.label}</option>
                ))}
              </select>
              
              {selectedField && (
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value as FilterOperator)}
                  className="filterpanel__select"
                >
                  {availableOperators.map(op => (
                    <option key={op} value={op}>{getOperatorLabel(op)}</option>
                  ))}
                </select>
              )}
              
              {selectedField && selectedFieldDef?.type === 'select' ? (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="filterpanel__select"
                >
                  <option value="">Select value...</option>
                  {selectedFieldDef.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : selectedField && selectedFieldDef?.type === 'boolean' ? (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="filterpanel__select"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : selectedField ? (
                <input
                  type={selectedFieldDef?.type === 'number' ? 'number' : selectedFieldDef?.type === 'date' ? 'date' : 'text'}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  placeholder={selectedFieldDef?.placeholder || 'Enter value...'}
                  className="filterpanel__input"
                />
              ) : null}
              
              <div className="filterpanel__form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddFilter(false)}
                  className="filterpanel__button filterpanel__button--secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddFilter}
                  disabled={!selectedField || !filterValue}
                  className="filterpanel__button filterpanel__button--primary"
                >
                  Add Filter
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddFilter(true)}
              className="filterpanel__add"
            >
              + Add filter
            </button>
          )}
          
          {children}
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
