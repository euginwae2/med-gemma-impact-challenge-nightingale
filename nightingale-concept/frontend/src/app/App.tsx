import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { HomePage } from '@/app/pages/HomePage';
import { TimelinePage } from '@/app/pages/TimelinePage';
import { CheckInPage } from '@/app/pages/CheckInPage';
import { CostsPage } from '@/app/pages/CostsPage';
import { VisitsPage } from '@/app/pages/VisitsPage';
import { WholePersonPage } from '@/app/pages/WholePersonPage';
import { SettingsPage } from '@/app/pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/costs" element={<CostsPage />} />
          <Route path="/visits" element={<VisitsPage />} />
          <Route path="/whole-person" element={<WholePersonPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
