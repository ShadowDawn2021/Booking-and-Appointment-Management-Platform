import { Route, Routes } from "react-router-dom";
import BookingPage from "./pages/BookingPage";

function NotFound() {
  return <p className="p-6 text-gray-600">Page not found.</p>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/book/:slug" element={<BookingPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
