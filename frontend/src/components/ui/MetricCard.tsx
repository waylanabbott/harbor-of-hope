import { Card, CardContent, Typography, Box } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  trend,
  color = '#E8735A',
}: MetricCardProps) {
  return (
    <Card
      sx={{
        position: 'relative',
        borderLeft: `4px solid ${color}`,
        height: '100%',
      }}
    >
      <CardContent>
        {icon && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'text.secondary',
              opacity: 0.5,
            }}
          >
            {icon}
          </Box>
        )}

        <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
            {trend.value >= 0 ? (
              <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <ArrowDownwardIcon sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trend.value >= 0 ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              {Math.abs(trend.value)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {trend.label}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
