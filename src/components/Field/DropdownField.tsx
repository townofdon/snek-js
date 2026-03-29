import React, { useRef } from 'react';
import Select, { ActionMeta, OnChangeValue } from 'react-select'
// import Dropdown, { Group, Option } from 'react-dropdown';

import { FieldLabel } from './FieldLabel';

import './react-dropdown.css';

export interface Option {
  id?: string;
  value: string;
  label: string;
}

interface DropdownFieldProps {
  label?: string;
  options: Option[];
  value: string,
  onChange: (val: Option) => void;
  defaultValue?: string,
  placeholder?: string
}

export const DropdownField = ({ label, options, value, onChange, placeholder = "Select an option", defaultValue }: DropdownFieldProps) => {
  const select = useRef(null);

  const handleChange = (option: OnChangeValue<Option, false>, actionMeta: ActionMeta<Option>) => {
    onChange(option);
  }

  const selectedOption = options.find(option => option.value === value) || options.find(option => option.value === defaultValue);

  const dropdown = (
    <Select
      ref={select}
      options={options}
      onChange={handleChange}
      value={selectedOption}
      placeholder={placeholder}
      classNamePrefix="react-select"
      menuShouldScrollIntoView
      menuPlacement="top"
    />
  );

  if (!label) return dropdown;

  return (
    <FieldLabel text={label}>
      {dropdown}
    </FieldLabel>
  );
}
