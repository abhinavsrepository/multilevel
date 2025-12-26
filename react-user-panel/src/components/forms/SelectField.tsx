import React from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  Box,
  Chip,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { KeyboardArrowDown } from '@mui/icons-material';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  helperText?: string;
  startIcon?: React.ReactNode;
  onChange?: (value: string | number | (string | number)[]) => void;
  renderValue?: SelectProps['renderValue'];
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  disabled = false,
  required = false,
  multiple = false,
  helperText,
  startIcon,
  onChange,
  renderValue,
}: SelectFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error} disabled={disabled}>
          <InputLabel
            id={`${name}-label`}
            required={required}
            sx={{
              '&.Mui-focused': {
                color: 'primary.main',
              },
              '&.Mui-error': {
                color: 'error.main',
              },
            }}
          >
            {label}
          </InputLabel>
          <Select
            {...field}
            labelId={`${name}-label`}
            id={name}
            label={label}
            multiple={multiple}
            value={field.value ?? (multiple ? [] : '')}
            displayEmpty
            IconComponent={KeyboardArrowDown}
            startAdornment={
              startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : undefined
            }
            renderValue={
              renderValue
                ? renderValue
                : (selected) => {
                  if (!selected || (Array.isArray(selected) && selected.length === 0)) {
                    return (
                      <Typography color="text.secondary" sx={{ opacity: 0.6 }}>
                        {placeholder || `Select ${label}`}
                      </Typography>
                    );
                  }

                  if (multiple && Array.isArray(selected)) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const option = options.find((opt) => opt.value === value);
                          return (
                            <Chip
                              key={value}
                              label={option?.label || value}
                              size="small"
                              sx={{
                                height: 24,
                                '& .MuiChip-label': {
                                  px: 1,
                                },
                              }}
                            />
                          );
                        })}
                      </Box>
                    );
                  }

                  const selectedOption = options.find((opt) => opt.value === (selected as string | number));
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {selectedOption?.icon}
                      <Typography>{selectedOption?.label || selected}</Typography>
                    </Box>
                  );
                }
            }
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e.target.value);
            }}
            inputProps={{
              'aria-label': label,
              'aria-required': required,
              'aria-invalid': !!error,
              'aria-describedby': error ? `${name}-error` : helperText ? `${name}-helper` : undefined,
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  mt: 1,
                  boxShadow: (theme) => theme.shadows[8],
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    },
                  },
                },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
                borderColor: 'primary.main',
              },
              '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                borderColor: 'error.main',
              },
            }}
          >
            {placeholder && !multiple && (
              <MenuItem value="" disabled>
                <Typography color="text.secondary">{placeholder}</Typography>
              </MenuItem>
            )}
            {options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {option.icon}
                <Typography>{option.label}</Typography>
              </MenuItem>
            ))}
          </Select>
          {(error || helperText) && (
            <FormHelperText
              id={error ? `${name}-error` : `${name}-helper`}
              error={!!error}
              role={error ? 'alert' : undefined}
            >
              {error?.message || helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
}
