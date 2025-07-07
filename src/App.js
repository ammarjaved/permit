import {BrowserRouter,Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import  Dashboard  from './Dashboard';


function App() {
  return (
    <BrowserRouter basename="/permit">
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<LoginForm />} />
      </Routes>
     </BrowserRouter>
  );
}

export default App;