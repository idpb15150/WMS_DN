import { BrowserRouter as Router, Routes, Route } from "react-router";
import ProtectedRoute from "../src/pages/AuthPages/ProtectedRoute";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Tables from "../src/pages/Tables/BasicTables";
import Abouts from "./pages/OtherPage/About";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { AuthContext } from "./pages/AuthPages/AuthContext";
import { useContext } from "react";
import TokenRotator from "./components/auth/TokenRotator";
import FormElements from "./pages/Forms/FormElements";


// master //

import Master from "./pages/Master/Master";

// master //




export default function App() {
  const { authData } = useContext(AuthContext);

  return (
    <Router basename="/master">
      <ScrollToTop />
      {authData?.token ? <TokenRotator enabled /> : null}
      <Routes>
        {/* Dashboard Layout */}
        <Route element={<AppLayout />}>
     

          <Route path="/" element={<ProtectedRoute><Abouts /></ProtectedRoute>} />



          {/* master */}
          <Route path="/master" element={<ProtectedRoute><Master /></ProtectedRoute>} />
          {/* master */}



          {/* Other */}
          <Route path="/formElements" element={<ProtectedRoute><FormElements /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfiles /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/table" element={<ProtectedRoute><Tables /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><Abouts /></ProtectedRoute>} />
          {/* Other */}

        </Route>

        {/* Auth Layout */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        {/* Auth Layout */}



        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
        {/* Fallback Route */}
      </Routes>
    </Router>
  );
}














//
//
//                                                                                                                                            0000
//                                                                                                                                          00  00
//                                                                                         0000000000000000000000000                      00    00
//                                                                                     000000                     000000                00      00
//                                                                                  000000    -----------------        000000         00        00
//                                                                              000000        -----------------           000000    00          00
//                                      00000000000----00000000000000000000000000                                              00000000000000000000000000
//                                    0000                    |0|                                                                                      0000
//                                  0000                      |0|                                                                                        00000
//                                0000                        |0|                                                                                            0000
//                              0000000000000000000----000000000|                                                                                            0  0
//                            0000                                                                                                                           0  0
//                           00000                                                        00000000000000000000                                               0  0
//                           00000                                                        00                00                                               0000
//                            0000                                                        00                00                                            0000
//                              0000                                                      00                00                                         0000
//                                0000                                                    00                00                                 000000000
//                                   0000                                                 00                00                       0000000000000     
//                                     0000            000000000000000000                 00                00              0000000000000
//                                         00000000000000              00000000000000000000000000000000000000000000000000000000
//
//
//
//
