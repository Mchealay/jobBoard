
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import JobDetails from "./pages/jobDetails";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import PostJob from "./components/postJob";

function App() {
  
 
  return (
    <Router>
    <Navbar  /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route
          path="/login"
          element={<Login/>}
        />
        <Route
          path="/signup"
          element={<SignUp/>}
        />
        <Route
          path="/postjob"
          element={<PostJob/>}
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;