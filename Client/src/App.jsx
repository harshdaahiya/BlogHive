import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import Notification from "./pages/Notification";
import Library from "./pages/Library";
import ProtectedRoute from "./context/ProtectedRoute";
import BlogDetails from "./pages/BlogDetails";
import Layout from "./components/Layout";
import { UserProfileProvider } from "./context/userContext";
import { BlogsProvider } from "./context/BlogContext";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/Landing";
import Spinner from "./components/Spinner";
import AdminRoute from "./context/AdminRoute";
import AdminPage from "./pages/AdminPage";
import Stories from "./pages/Stories";
import Stats from "./pages/Stats";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if(loading){
    return <Spinner/>
  }

  return (
    <UserProfileProvider>
      <BlogsProvider>
        <Routes>
          {/* Showing Landing Page only if user is NOT authenticated */}
          {!isAuthenticated ? (
            <Route path="/" element={<LandingPage />} />
          ) : (
            <Route path="/" element={<Layout />}>
              <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notification /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
              <Route path="/stories" element={<ProtectedRoute><Stories /></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
              <Route path="/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/blog/:id" element={<ProtectedRoute><BlogDetails /></ProtectedRoute>} />
            </Route>
          )}

          {/* Upload page outside Layout */}
          <Route path="/blog/Upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/Admin" element={<AdminRoute><AdminPage/></AdminRoute>}/>

          {/* Redirect any unknown route to Home or Landing Page */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/"} />} />
        </Routes>
      </BlogsProvider>
    </UserProfileProvider>
  );
}

export default App;

