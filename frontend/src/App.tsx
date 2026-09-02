import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ViewAllComponents from "./pages/ViewAllComponents";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/view-all-components" element={<ViewAllComponents />} />
    </Routes>
  );
}
