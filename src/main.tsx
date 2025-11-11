import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
  <AppWrapper>
    <ToastContainer
      position="bottom-center"
      style={{ zIndex: 9999 }}
      toastStyle={{ zIndex: 9999 }}
    />
    <App />
  </AppWrapper>
);
