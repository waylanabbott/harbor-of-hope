import { Routes, Route } from 'react-router-dom';
import { Typography, Container } from '@mui/material';

function App() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Routes>
        <Route path="/" element={<Typography variant="h2">Harbor of Hope</Typography>} />
      </Routes>
    </Container>
  );
}

export default App;
