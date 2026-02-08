import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddMedication } from './pages/AddMedication';
import { History } from './pages/History';
import { NotificationManager } from './components/NotificationManager';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <NotificationManager />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add" element={<AddMedication />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
