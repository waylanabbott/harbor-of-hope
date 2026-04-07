import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import { useThemeMode } from '../../context/ThemeContext';

export default function FontSizeSelector() {
  const { fontSize, setFontSize } = useThemeMode();

  return (
    <Tooltip title="Text size (saved as a cookie with your consent)" arrow>
      <ToggleButtonGroup
        value={fontSize}
        exclusive
        onChange={(_, val) => {
          if (val) setFontSize(val);
        }}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            color: 'inherit',
            border: '1px solid rgba(255,255,255,0.3)',
            px: 1,
            py: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'inherit',
            },
          },
        }}
      >
        <ToggleButton value="small" aria-label="Small text">
          <TextDecreaseIcon sx={{ fontSize: 16 }} />
        </ToggleButton>
        <ToggleButton value="medium" aria-label="Medium text">
          <TextFieldsIcon sx={{ fontSize: 18 }} />
        </ToggleButton>
        <ToggleButton value="large" aria-label="Large text">
          <TextIncreaseIcon sx={{ fontSize: 20 }} />
        </ToggleButton>
      </ToggleButtonGroup>
    </Tooltip>
  );
}
