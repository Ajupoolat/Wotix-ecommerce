// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/authuser";
import { CartProvider } from "./context/cartcon";
import { OffersProvider } from "./context/offerprice";
import { OffersCartProvider } from "./context/cartOffer";
import { WishlistCountProvider } from "./context/wishlistCount";
import { WishlistProvider } from "./context/wishlistContext";
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
              <WishlistProvider>
                <CartProvider>
                  <AuthProvider>
                    <App />
                  </AuthProvider>
                </CartProvider>
              </WishlistProvider>
            </WishlistCountProvider>
          </OffersCartProvider>
        </OffersProvider>
      </QueryClientProvider>
    </Router>
  </StrictMode>
);
