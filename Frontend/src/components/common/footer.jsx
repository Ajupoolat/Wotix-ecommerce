import React from "react";

export  const Footer = () => {
  return (
    <div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">WOTIX WATCHES</h3>
              <p className="text-gray-400 text-sm">
                Luxury timepieces crafted with precision and elegance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">QUICK LINKS</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/shop"
                    className="text-sm hover:underline text-gray-300"
                  >
                    Shop Collection
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">STAY CONNECTED</h3>
              <p className="text-gray-400 text-sm mb-4">
                Follow us on social media for the latest updates.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-gray-300">
                  FB
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  IG
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  TW
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} WOTIX WATCHES. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
