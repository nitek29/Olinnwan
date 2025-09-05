import './App.scss';

import { Routes, Route } from 'react-router-dom';

import Header from './Header/Header';
import ModalsManager from './modals/ModalsManager';
import Home from '../pages/Home/Home';
import Footer from './Footer/Footer';
import Events from '../pages/Events/Events';
import Profile from '../pages/Profile/Profile';
import EventDetail from '../pages/EventDetail/EventDetail';
import Admin from '../pages/Admin/Admin';

export default function App() {
  return (
    <div className="app_container">
      <Header />
      <ModalsManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event" element={<EventDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </div>
  );
}
