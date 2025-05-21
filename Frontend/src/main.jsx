// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/authuser";
import { CartProvider } from "./context/cartcon";
import { WebSocketProvider } from "./context/returncon";
import { WebSocketProviderAdmin } from "./context/adminreturn";
import { OffersProvider } from "./context/offerprice";
import { OffersCartProvider } from "./context/cartOffer";
import { WishlistCountProvider } from "./context/wishlistCount";
import App from "./App.jsx";

const queryclient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Toaster />
      <QueryClientProvider client={queryclient}>
        <OffersProvider>
          <OffersCartProvider>
          <WishlistCountProvider>
          <CartProvider>
            <WebSocketProvider>
              <WebSocketProviderAdmin>
                <AuthProvider>
                  <App />
                </AuthProvider>
              </WebSocketProviderAdmin>
            </WebSocketProvider>
          </CartProvider>
          </WishlistCountProvider>
          </OffersCartProvider>
        </OffersProvider>
      </QueryClientProvider>
    </Router>
  </StrictMode>
);
