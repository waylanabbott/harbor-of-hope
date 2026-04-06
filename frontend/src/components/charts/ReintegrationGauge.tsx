import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface ReintegrationGaugeProps {
  rate: number; // 0-100
}

export default function ReintegrationGauge({
  rate,
}: ReintegrationGaugeProps) {
  const data = [{ name: 'rate', value: rate, fill: '#E8735A' }];

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="90%"
            startAngle={180}
            endAngle={0}
            data={data}
            barSize={12}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#E0E0E0' }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -30%)',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {rate}%
          </Typography>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: -2 }}>
        Reintegration Rate
      </Typography>
    </Box>
  );
}
