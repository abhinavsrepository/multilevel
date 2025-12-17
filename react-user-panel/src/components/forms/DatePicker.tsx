import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField, Box, Typography } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';

export interface DatePickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
  disablePast?: boolean;
  disableFuture?: boolean;
  views?: ('year' | 'month' | 'day')[];
  format?: string;
  onChange?: (date: Date | null) => void;
}

export function DatePicker<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  disabled = false,
  required = false,
  helperText,
  minDate,
  maxDate,
  disablePast = false,
  disableFuture = false,
  views = ['year', 'month', 'day'],
  format = 'MM/dd/yyyy',
  onChange,
}: DatePickerProps<T>) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Box sx={{ width: '100%' }}>
            <MuiDatePicker
              {...field}
              label={label}
              disabled={disabled}
              minDate={minDate}
              maxDate={maxDate}
              disablePast={disablePast}
              disableFuture={disableFuture}
              views={views}
              format={format}
              onChange={(date) => {
                field.onChange(date);
                onChange?.(date);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: required,
                  error: !!error,
                  helperText: error?.message || helperText,
                  placeholder: placeholder,
                  inputProps: {
                    'aria-label': label,
                    'aria-required': required,
                    'aria-invalid': !!error,
                    'aria-describedby': error
                      ? `${name}-error`
                      : helperText
                      ? `${name}-helper`
                      : undefined,
                  },
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      },
                      '&.Mui-error fieldset': {
                        borderColor: 'error.main',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                      '&.Mui-error': {
                        color: 'error.main',
                      },
                    },
                  },
                },
                openPickerIcon: {
                  children: <CalendarToday />,
                },
                actionBar: {
                  actions: ['clear', 'accept', 'cancel'],
                },
              }}
            />
            {error && (
              <Typography
                id={`${name}-error`}
                variant="caption"
                color="error"
                sx={{ mt: 0.5, display: 'block', ml: 1.75 }}
                role="alert"
              >
                {error.message}
              </Typography>
            )}
          </Box>
        )}
      />
    </LocalizationProvider>
  );
}
