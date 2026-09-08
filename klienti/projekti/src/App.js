import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useLocation, Navigate } from "react-router-dom";
import Doktori from "./View/Doktori";
import Header from "./View/Header";
import LoginForm from "./View/LoginForm";
import RegisterForm from "./View/RegisterForm";
import PacCrud from "./View/PacCrud";
import RekCrud from "./View/RekCrud";
import ServCrud from "./View/ServCrud";
import ContactCrud from "./View/ContactCrud";
import InfCrud from "./View/InfCrud";
import ReservationCrud from './View/ReservationCrud';
import DoktoriDash from './View/DoktoriDash';
import PatientDashboard from './View/PatientDashboard';
import About from './View/About';
import ContactForm from "./View/ContactForm";
import Service from "./View/Services";
import Home from './View/Home';
import Reviews from './View/Reviews';
import ReviewCrud from './View/ReviewCrud';
import EmergencyCrud from './View/EmergencyCrud';
import AdminDashboard from './View/AdminDashboard';
import NurseScheduleCrud from './View/NurseScheduleCrud';
/*
import Home from './View/Home';
import Services from './View/Services';
import Doktori from './View/Doktori';
import AboutUs from './View/About';
import ContactForm from './View/ContactForm';
import PatientDashboard from './View/PatientDashboard';
import ContactCRUD from './View/ContactCrud';
import Reviews from './View/Reviews';
import Ligjerusi from './View/Ligjerusi';
import Ligjerata from './View/Ligjerata';
import Team from './View/Team';
import Player from './View/Player';
import Universiteti from './View/Universiteti';
import Programet from './View/Programet';*/

function App() {
  return (
    <Router>
      <RouteRender />
    </Router>
  );
}

function RouteRender() {
  const location = useLocation();
  const CRUDPaths = [
    "/AdminDashboard",
    "/Doki",
    "/InfCrud",
    "/NurseSchedule",
    "/RekCrud",
    "/PacCrud",
    "/ReservationCrud",
    "/ServCrud",
    "/ContactCrud",
    "/ReviewCrud",
    "/EmergencyCrud",
  ];

  const shouldShowHeader = CRUDPaths.includes(location.pathname);

  const routes = (
    <Routes>
      <Route path="/" element={<Navigate to="/Home" />} />
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
      <Route path="/Doki" element={<Doktori />} />
      <Route path="/LoginForm" element={<LoginForm />} />
      <Route path="/RegisterForm" element={<RegisterForm />} />
      <Route path="/PacCrud" element={<PacCrud />} />
      <Route path="/RekCrud" element={<RekCrud />} />
      <Route path="/ServCrud" element={<ServCrud />} />
      <Route path="/ContactCrud" element={<ContactCrud />} />
      <Route path="/InfCrud" element={<InfCrud />} />
      <Route path="/NurseSchedule" element={<NurseScheduleCrud />} />
      <Route path="/ReservationCrud" element={<ReservationCrud />} />
      <Route path="/Doktori" element={<DoktoriDash />} />
      <Route path="/PatientDashboard" element={<PatientDashboard />} />
      <Route path="/About" element={<About />} />
      <Route path="/ContactForm" element={<ContactForm />} />
      <Route path="/Services" element={<Service />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Reviews" element={<Reviews />} />
      <Route path="/ReviewCrud" element={<ReviewCrud />} />
      <Route path="/EmergencyCrud" element={<EmergencyCrud />} />
      {/*
        <Route path="/Home" element={<Home />} />
        <Route path="/Services" element={<Services />} />
         <Route path="/About" element={<AboutUs />} /> 
         <Route path="/Doktori" element={<Doktori />} /> 
         <Route path="/Contact" element={<ContactForm />} /> 
         <Route path="/PatientDashboard" element={<PatientDashboard />} /> 
         <Route path="/ContactCrud" element={<ContactCRUD />} /> 
         <Route path="/Reviews" element={<Reviews />} /> 
         <Route path="/Ligjerusi" element={<Ligjerusi />} /> 
         <Route path="/ligjerata" element={<Ligjerata />} /> 
         <Route path="/team" element={<Team />} /> 
         <Route path="/player" element={<Player />} /> 
         <Route path="/uni" element={<Universiteti />} /> 
         <Route path="/prog" element={<Programet />} />  */}
    </Routes>
  );

  if (shouldShowHeader) {
    return (
      <div className="admin-shell">
        <Header />
        <div className="admin-shell__content">{routes}</div>
      </div>
    );
  }

  return routes;
}

export default App;
