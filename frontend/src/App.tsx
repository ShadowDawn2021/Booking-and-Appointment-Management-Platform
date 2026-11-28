import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import BookingPage from "./pages/BookingPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function NotFound() {
  return <p className="p-6 text-gray-600">Page not found.</p>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="book/:slug" element={<BookingPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
