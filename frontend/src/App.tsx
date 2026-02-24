import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import InvoiceWorkspace from "./pages/InvoiceWorkspace";
import HowItWorks from "./pages/HowItWorks";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route
                        path="/workspace"
                        element={
                            <ProtectedRoute>
                                <InvoiceWorkspace />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
