import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import Filter, { FilterState } from "../../components/filter/Filter";
import Card from "../../components/card/Card";
import Map from "../../components/map/Map";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Navbar from "../../components/Navbar";
import instance from "../../utils/Axios/Axios";

// Swiper carousel images
const images: string[] = [
  "https://www.stanzaliving.com/_next/image?url=https%3A%2F%2Fasset-cdn.stanzaliving.com%2Fstanza-living%2Fimage%2Fupload%2Ff_auto%2Cq_auto%2Fv1688556582%2FWebsite%2FCMS-Uploads%2FWeb_Banner_03_Desktop_3_mknpwg.png&w=1920&q=75",
  "https://www.stanzaliving.com/_next/image?url=https%3A%2F%2Fasset-cdn.stanzaliving.com%2Fstanza-living%2Fimage%2Fupload%2Ff_auto%2Cq_auto%2Fv1688556552%2FWebsite%2FCMS-Uploads%2FWeb_Banner_03_Desktop_1_vzb4dj.png&w=1920&q=75",
  "https://www.stanzaliving.com/_next/image?url=https%3A%2F%2Fasset-cdn.stanzaliving.com%2Fstanza-living%2Fimage%2Fupload%2Ff_auto%2Cq_auto%2Fv1688556616%2FWebsite%2FCMS-Uploads%2FWeb_Banner_Desktop_2_fukrjc.png&w=1920&q=75",
];

interface Property {
  _id: string;
  property_name: string;
  rate: number;
  bed: number;
  bathroom: number;
  city: string;
  state: string;
  images: string[];
  latitude: string;
  longitude: string;
  category: "rent" | "sale" | "pg";
  totalCapacity: string;
}

const HeroCarousel: React.FC = () => {
  return (
    <div className="w-full mt-4">
      <div className="w-full sm:px-6 lg:px-0 max-w-[1300px] mx-auto">
        <div className="relative w-full overflow-hidden bg-gray-50 rounded-lg h-[213px] sm:h-[319px] lg:h-[533px] aspect-[768/213] sm:aspect-[1152/319] lg:aspect-[1920/533]">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true, dynamicBullets: true, dynamicMainBullets: 3 }}
            navigation={{ nextEl: ".hero-next", prevEl: ".hero-prev" }}
            loop={true}
            spaceBetween={0}
            slidesPerView={1}
            speed={800}
            className="w-full h-full hero-carousel"
          >
            {images.map((src, index) => (
              <SwiperSlide key={index} className="w-full h-full">
                <div className="w-full h-full">
                  <img
                    src={src}
                    alt={`Property showcase ${index + 1}`}
                    className="w-full h-full object-contain"
                    draggable={false}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="hero-prev hidden sm:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 lg:w-12 lg:h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all duration-200 hover:scale-110">
            <svg className="w-4 h-4 lg:w-6 lg:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="hero-next hidden sm:flex absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 lg:w-12 lg:h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all duration-200 hover:scale-110">
            <svg className="w-4 h-4 lg:w-6 lg:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};



const ListPage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cityParam = params.get("city");

  const [data, setData] = useState<Property[]>([]);
  const [filteredData, setFilteredData] = useState<Property[]>([]);
  const [displayedData, setDisplayedData] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterState>({
    city: cityParam === "all" ? "" : cityParam || "",
    type: "",
    price: "",
    bedrooms: "",
    sort: "relevance",
  });

  const observer = useRef<IntersectionObserver>(null);

  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await instance.get<{ results: Property[] }>("/property", {
        params: {
          page,
          limit: 10,
        },
      });
      
      if (page === 1) {
        setData(res.data.results);
      } else {
        setData((prevData) => [...prevData, ...res.data.results]);
      }
      
      setHasMore(res.data.results.length > 0);
    } catch (error) {
      console.error("Error fetching property data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback((properties: Property[], filterState: FilterState) => {
    let filtered = [...properties];

    if (filterState.city && filterState.city.toLowerCase() !== "all") {
      filtered = filtered.filter(
        (property) =>
          property.city.toLowerCase().includes(filterState.city.toLowerCase()) ||
          property.state.toLowerCase().includes(filterState.city.toLowerCase())
      );
    }

    if (filterState.bedrooms) {
      const bedroomCount = parseInt(filterState.bedrooms);
      if (filterState.bedrooms === "4") {
        filtered = filtered.filter((property) => property.bed >= 4);
      } else {
        filtered = filtered.filter((property) => property.bed === bedroomCount);
      }
    }

    if (filterState.price) {
      if (filterState.price === "10000000+") {
        filtered = filtered.filter((property) => property.rate >= 10000000);
      } else {
        const [min, max] = filterState.price.split("-").map(Number);
        filtered = filtered.filter(
          (property) => property.rate >= min && property.rate <= max
        );
      }
    }

    switch (filterState.sort) {
      case "price-asc":
        filtered.sort((a, b) => a.rate - b.rate);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.rate - a.rate);
        break;
      default:
        break;
    }

    setFilteredData(filtered);
  }, []);

  const handleFilter = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      setPage(1);
      setHasMore(true);
      applyFilters(data, newFilters);
    },
    [data, applyFilters]
  );

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    if (data.length > 0) {
      applyFilters(data, filters);
    }
  }, [data, filters, applyFilters]);

  useEffect(() => {
    if (cityParam) {
      const cityValue = cityParam === "all" ? "" : cityParam;
      if (cityValue !== filters.city) {
        const newFilters = { ...filters, city: cityValue };
        setFilters(newFilters);
        setPage(1);
        setHasMore(true);
      }
    }
  }, [cityParam, filters]);

  useEffect(() => {
    if (filteredData.length > 0) {
      const itemsPerPage = 10;
      const endIndex = page * itemsPerPage;
      const newDisplayedData = filteredData.slice(0, endIndex);
      setDisplayedData(newDisplayedData);
      setHasMore(endIndex < filteredData.length);
    } else {
      setDisplayedData([]);
    }
  }, [filteredData, page]);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return (
    <>
      <Navbar />
      <HeroCarousel />
      <div>
        <div className="min-h-screen bg-gray-100 px-2 sm:px-4 py-8 sm:py-10 lg:py-12">
          <div className="max-w-[1300px] mx-auto">
            {cityParam && cityParam !== "all" && (
              <h1 className="font-light text-2xl mb-4">
                Search results for <b className="font-semibold capitalize">{cityParam}</b>
              </h1>
            )}
            {cityParam === "all" && (
              <h1 className="font-light text-2xl mb-4">All Properties</h1>
            )}
            <Filter
              count={filteredData.length}
              onFilter={handleFilter}
              initialFilters={filters}
            />
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-1 gap-4">
                  {displayedData.length > 0 ? (
                    displayedData.map((item, index) => {
                      const isLastItem = index === displayedData.length - 1;
                      return (
                        <div key={item._id} ref={isLastItem ? lastCardRef : null}>
                          <Card
                            index={index}
                            item={{
                              id: item._id,
                              img: item.images?.[0] || "",
                              title: item.property_name,
                              address: `${item.city}, ${item.state}`,
                              bedroom: item.category === "pg" ? parseInt(item.totalCapacity) || 0 : item.bed,
                              bathroom: item.bathroom,
                              price: item.rate,
                              category:item.category
                            }}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {loading ? "Loading properties..." : "No properties found matching your criteria."}
                      </p>
                    </div>
                  )}
                  {loading && displayedData.length > 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading more properties...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="w-full h-[300px] sm:h-[400px] lg:h-[calc(100vh-6rem)] sticky top-24">
                  <Map items={
                    displayedData
                    .filter((item:any) => item.latitude && item.longitude)
                    .map((item:any) => ({
                      id: item._id,
                      latitude: parseFloat(item.latitude),
                      longitude: parseFloat(item.longitude),
                      img: item.images?.[0] || "",
                      title: item.property_name,
                      bedroom: item.bed,
                      price: item.rate,
                    }))
                  } />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListPage;