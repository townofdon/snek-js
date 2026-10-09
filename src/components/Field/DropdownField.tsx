import React, { useEffect, useRef, useState } from 'react';
import Select, { ActionMeta, OnChangeValue } from 'react-select'

import { FieldLabel } from './FieldLabel';

export interface Option {
  id?: string;
  value: string;
  label: string;
}

interface DropdownFieldProps {
  id?: string
  label?: string;
  options: Option[];
  value: string,
  onChange: (val: Option) => void;
  defaultValue?: string,
  placeholder?: string
  onMenuOpen?: () => void,
  onMenuClose?: () => void,
}

export const DropdownField = ({
  id,
  label,
  options,
  value,
  onChange,
  onMenuOpen,
  onMenuClose,
  placeholder = "Select an option",
  defaultValue,
}: DropdownFieldProps) => {
  const select = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleChange = (option: OnChangeValue<Option, false>, actionMeta: ActionMeta<Option>) => {
    setMenuOpen(false);
    onChange(option);
  }
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) => {
    if (!menuOpen && (ev.key === ' ' || ev.key === 'Enter')) {
      ev.preventDefault();
      select.current?.onMenuOpen?.();
    }
    if (menuOpen && ev.key === 'Backspace') {
      select.current?.onMenuClose?.();
    }
  }

  useEffect(() => {
    if (menuOpen) {
      onMenuOpen?.();
    } else {
      onMenuClose?.();
    }
  }, [menuOpen]);

  const handleMenuOpen = () => {
    setMenuOpen(true);
  }

  const handleMenuClose = () => {
    setMenuOpen(false);
  }

  const selectedOption = options.find(option => option.value === value) || options.find(option => option.value === defaultValue);

  const dropdown = (
    <Select
      ref={select}
      inputId={id}
      options={options}
      onChange={handleChange}
      value={selectedOption}
      placeholder={placeholder}
      classNamePrefix="react-select"
      menuShouldScrollIntoView
      menuPlacement="top"
      openMenuOnFocus={false}
      tabSelectsValue={false}
      openMenuOnClick
      closeMenuOnSelect
      onKeyDown={handleKeyDown}
      onMenuOpen={handleMenuOpen}
      onMenuClose={handleMenuClose}
      tabIndex={0}
    />
  );

  if (!label) return dropdown;

  return (
    <FieldLabel text={label}>
      {dropdown}
    </FieldLabel>
  );
}
