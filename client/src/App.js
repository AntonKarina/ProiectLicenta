import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Profile from './Profile';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import AddEvent from './AddEvent';
import Event from './Event';
import EditEvent from './EditEvent';
import Clubs from './Clubs';
import GroupManagement from './GroupManagement';
import Competitions from './Competitions';
import AdminCompetitions from './AdminCompetitions'; 
import AddResult from './AddResults';
import Results from './Results';
import PaymentSummary from './PaymentSummary';
import PublicSchedule from './PublicSchedule';
import Layout from './Layout';
import ClubProfile from './ClubProfile';
import 'bootstrap/dist/css/bootstrap.min.css'


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
         <Route path="/" element={<Layout />}>
            <Route path='/home' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password/:token' element={<ResetPassword />} />
            <Route path='/clubs' element={<Clubs />} />
            <Route path='/clubs/:id' element={<ClubProfile/>} />
            <Route path='/groupmanagement' element={<GroupManagement/>} />
            <Route path='/profile' element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path='/events' element={<Event />} />
            <Route path='/paymentsummary' element={<PrivateRoute><PaymentSummary /></PrivateRoute>} />
            <Route path='/add-event' element={<AdminRoute><AddEvent /></AdminRoute>} />
            <Route path='/edit-event/:eventId' element={<AdminRoute><EditEvent /></AdminRoute>} />
            <Route path='/admin-competitions' element={<AdminRoute><AdminCompetitions /></AdminRoute>} />
            <Route path='/add-result/:competitionId' element={<AdminRoute><AddResult /></AdminRoute>} /> 
            <Route path='/results' element={<Results />} /> 
            <Route path='/publicschedule' element={<PublicSchedule />} /> 
            <Route path='/' element={<Navigate replace to="/home" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
