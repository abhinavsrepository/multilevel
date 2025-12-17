import React from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export interface InputFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  inputProps?: TextFieldProps['inputProps'];
  autoComplete?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
  onChange?: (value: string) => void;
}

export function InputField<T extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  startIcon,
  endIcon,
  helperText,
  multiline = false,
  rows,
  maxRows,
  inputProps,
  autoComplete,
  autoFocus = false,
  onBlur,
  onChange,
}: InputFieldProps<T>) {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box sx={{ width: '100%' }}>
          <TextField
            {...field}
            fullWidth
            label={label}
            type={type === 'password' && showPassword ? 'text' : type}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            error={!!error}
            helperText={error?.message || helperText}
            multiline={multiline}
            rows={rows}
            maxRows={maxRows}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            inputProps={{
              ...inputProps,
              'aria-label': label,
              'aria-required': required,
              'aria-invalid': !!error,
              'aria-describedby': error ? `${name}-error` : helperText ? `${name}-helper` : undefined,
            }}
            InputProps={{
              startAdornment: startIcon ? (
                <InputAdornment position="start">{startIcon}</InputAdornment>
              ) : undefined,
              endAdornment: (
                <>
                  {type === 'password' && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )}
                  {endIcon && <InputAdornment position="end">{endIcon}</InputAdornment>}
                </>
              ),
            }}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e.target.value);
            }}
            onBlur={() => {
              field.onBlur();
              onBlur?.();
            }}
            sx={{
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
            }}
          />
          {error && (
            <Typography
              id={`${name}-error`}
              variant="caption"
              color="error"
              sx={{ mt: 0.5, display: 'block' }}
              role="alert"
            >
              {error.message}
            </Typography>
          )}
        </Box>
      )}
    />
  );
}
