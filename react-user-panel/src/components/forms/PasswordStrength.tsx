import React, { useMemo } from 'react';
import { Box, Typography, LinearProgress, Stack, Chip } from '@mui/material';
import {
  Check,
  Close,
  CheckCircle,
  Lock,
  Numbers,
  AlternateEmail,
  TextFields,
} from '@mui/icons-material';

export interface PasswordStrengthProps {
  password: string;
  showCriteria?: boolean;
  minLength?: number;
}

interface PasswordCriteria {
  label: string;
  met: boolean;
  icon: React.ReactNode;
}

interface StrengthLevel {
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
  score: number;
}

const calculatePasswordStrength = (
  password: string,
  minLength: number
): {
  score: number;
  strength: StrengthLevel;
  criteria: PasswordCriteria[];
} => {
  let score = 0;
  const criteria: PasswordCriteria[] = [];

  // Check length
  const hasMinLength = password.length >= minLength;
  criteria.push({
    label: `At least ${minLength} characters`,
    met: hasMinLength,
    icon: <TextFields fontSize="small" />,
  });
  if (hasMinLength) score += 25;

  // Check for lowercase letters
  const hasLowercase = /[a-z]/.test(password);
  criteria.push({
    label: 'Contains lowercase letter',
    met: hasLowercase,
    icon: <TextFields fontSize="small" />,
  });
  if (hasLowercase) score += 15;

  // Check for uppercase letters
  const hasUppercase = /[A-Z]/.test(password);
  criteria.push({
    label: 'Contains uppercase letter',
    met: hasUppercase,
    icon: <TextFields fontSize="small" />,
  });
  if (hasUppercase) score += 15;

  // Check for numbers
  const hasNumbers = /\d/.test(password);
  criteria.push({
    label: 'Contains number',
    met: hasNumbers,
    icon: <Numbers fontSize="small" />,
  });
  if (hasNumbers) score += 15;

  // Check for special characters
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  criteria.push({
    label: 'Contains special character (!@#$%...)',
    met: hasSpecialChar,
    icon: <AlternateEmail fontSize="small" />,
  });
  if (hasSpecialChar) score += 20;

  // Bonus points for length
  if (password.length >= minLength + 4) score += 10;

  // Determine strength level
  let strength: StrengthLevel;
  if (score < 30) {
    strength = { label: 'Weak', color: 'error', score };
  } else if (score < 60) {
    strength = { label: 'Fair', color: 'warning', score };
  } else if (score < 80) {
    strength = { label: 'Good', color: 'info', score };
  } else {
    strength = { label: 'Strong', color: 'success', score };
  }

  return { score, strength, criteria };
};

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  showCriteria = true,
  minLength = 8,
}) => {
  const { score, strength, criteria } = useMemo(
    () => calculatePasswordStrength(password, minLength),
    [password, minLength]
  );

  if (!password) {
    return null;
  }

  const allCriteriaMet = criteria.every((c) => c.met);

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 1,
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
      }}
      role="region"
      aria-label="Password strength indicator"
    >
      <Stack spacing={2}>
        {/* Strength Indicator */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Password Strength
            </Typography>
            <Chip
              label={strength.label}
              color={strength.color}
              size="small"
              icon={allCriteriaMet ? <CheckCircle /> : <Lock />}
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={score}
            color={strength.color}
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                transition: 'transform 0.4s ease',
              },
            }}
            aria-label={`Password strength: ${strength.label}, ${score} out of 100`}
          />
        </Box>

        {/* Criteria List */}
        {showCriteria && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1, fontWeight: 600 }}
            >
              Password Requirements:
            </Typography>
            <Stack spacing={0.5}>
              {criteria.map((criterion, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.5,
                  }}
                >
                  {criterion.met ? (
                    <Check
                      fontSize="small"
                      sx={{ color: 'success.main' }}
                      aria-label="Requirement met"
                    />
                  ) : (
                    <Close
                      fontSize="small"
                      sx={{ color: 'error.main' }}
                      aria-label="Requirement not met"
                    />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      color: criterion.met ? 'success.main' : 'text.secondary',
                      textDecoration: criterion.met ? 'line-through' : 'none',
                      opacity: criterion.met ? 0.7 : 1,
                    }}
                  >
                    {criterion.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Security Tips */}
        {allCriteriaMet && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(76, 175, 80, 0.1)'
                  : 'rgba(76, 175, 80, 0.05)',
              border: 1,
              borderColor: 'success.main',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <CheckCircle fontSize="small" sx={{ color: 'success.main', mt: 0.25 }} />
              <Typography variant="caption" color="success.main">
                Great! Your password meets all security requirements.
              </Typography>
            </Stack>
          </Box>
        )}

        {score < 60 && password.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 152, 0, 0.1)'
                  : 'rgba(255, 152, 0, 0.05)',
              border: 1,
              borderColor: 'warning.main',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Lock fontSize="small" sx={{ color: 'warning.main', mt: 0.25 }} />
              <Typography variant="caption" color="warning.main">
                Consider using a stronger password for better security.
              </Typography>
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
