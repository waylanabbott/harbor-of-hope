import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

interface RiskBadgeProps {
  level: string | null | undefined;
}

function getRiskColor(
  level: string | null | undefined
): ChipProps['color'] | undefined {
  switch (level) {
    case 'Critical':
      return 'error';
    case 'High':
      return 'warning';
    case 'Low':
      return 'success';
    default:
      return 'default';
  }
}

function getRiskSx(level: string | null | undefined) {
  if (level === 'Medium') {
    return {
      backgroundColor: '#E6A817',
      color: '#2D2D2D',
    };
  }
  return {};
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <Chip
      label={level ?? 'Unknown'}
      size="small"
      color={getRiskColor(level)}
      sx={getRiskSx(level)}
    />
  );
}
