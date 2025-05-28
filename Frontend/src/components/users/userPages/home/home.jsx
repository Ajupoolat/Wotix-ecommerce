import { Button } from "@/components/ui/button";
import heroWatch from "../../../../assets/Banner2.jpg";
import banner2 from "../../../../assets/bannerforhome.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/authuser";
import WebSocketListener from "@/Sockets/webSocketListner";
import LoaderSpinner from "@/components/common/spinner";
import SpecialOfferBanner from "@/components/common/SpeacialOfferBanner";
import { getshopproduct } from "@/api/users/shop/shopmgt";
import { Footer } from "@/components/common/footer";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/common/navbar";
import IconsArea from "@/components/common/IconsArea";


const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const category = "";
  const limit = 12;
  const page = 3;
  const minPrice = "";
  const maxPrice = "";
  const strapMeterial = "";
  const sortBy = "";

  const { data: pro } = useQuery({
    queryKey: ["shop"],
    queryFn: () =>
      getshopproduct({
        page,
        limit,
        category,
        minPrice,
        maxPrice,
        strapMeterial,
        sortBy,
      }),
  });

  const allproducts = pro?.products;

  if (isLoading) {
    return <LoaderSpinner />;
  }
  return (
    <div className="min-h-screen bg-white">
      {isAuthenticated && <WebSocketListener />}
      {/* Header */}
      <IconsArea />
      {/* navbar */}
      <Navbar />

      <div className="mt-5">
        <SpecialOfferBanner products={allproducts} />
      </div>
      {/* Hero Section */}
      <section className="relative">
        <img
          src={heroWatch}
          alt="Hero Watch"
          className="w-full h-64 sm:h-80 md:h-96 lg:h-112 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 bg-opacity-30" />
        <div className="absolute top-1/2 left-4 sm:left-12 transform -translate-y-1/2 max-w-xl">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
            WELCOME TO WOTIX
          </h1>
          <p className="text-lg sm:text-xl text-white mt-4 drop-shadow-md hidden sm:block">
            Discover precision timepieces that define your style
          </p>
          <Button
            className="mt-6 bg-white text-black hover:bg-gray-200 shadow-lg hidden sm:block"
            onClick={() => navigate("/shop")}
          >
            EXPLORE COLLECTION
          </Button>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          "A WATCH IS A SMALL WINDOW INTO THE SOUL OF TIME"
        </h2>
      </section>

      {/* Banner2 Section - Now styled like heroWatch */}
      <section className="relative">
        <img
          src={banner2}
          alt="Luxury Watch Collection"
          className="w-full h-64 sm:h-80 md:h-96 lg:h-112 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
        <div className="absolute top-1/2 left-4 sm:left-12 transform -translate-y-1/2 max-w-md">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
            Timeless Elegance Awaits
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-white mb-6 drop-shadow-md">
            Discover the perfect blend of luxury and precision with our latest
            collections.
          </p>
          <Button
            className="bg-white text-black hover:bg-gray-200 shadow-lg"
            onClick={() => navigate("/shop")}
          >
            EXPLORE PRODUCTS
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;
