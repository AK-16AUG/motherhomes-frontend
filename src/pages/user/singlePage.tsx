import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { BedDouble, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import instance from "../../utils/Axios/Axios";
import { toast, ToastContainer } from "react-toastify";
import { LoadingButton, SkeletonLoader } from "../../components/ui/loading";

// Define proper types
interface MediaItem {
  type: "image" | "video";
  src: string;
}

interface ImageSliderProps {
  images?: string[];
  videos?: string[];
  propertyName?: string;
  autoPlay?: boolean;
  interval?: number;
}

interface Amenity {
  name: string;
  _id?: string;
}

interface Service {
  name: string;
  _id?: string;
}

interface PropertyData {
  _id: string;
  property_name: string;
  city: string;
  category: "sale" | "rent"|"pg";
  rate: number;
  area: number;
  bed: number;
  furnishing_type: string;
  description: string;
  images: string[];
  videos: string[];
  amenties: Amenity[];
  services: Service[];
  perPersonPrice?: string;
  totalCapacity?:string
}

interface FormData {
  schedule_Time: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images = [],
  videos = [],
  propertyName = "Property",
  autoPlay = true,
  interval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Combine all media - images first, then videos
  const media = useMemo<MediaItem[]>(
    () => [
      ...images.map((img: string) => ({ type: "image" as const, src: img })),
      ...videos.map((video: string) => ({
        type: "video" as const,
        src: video.includes("youtube.com")
          ? video.split("v=")[1].split("&")[0] // Extract video ID from URL
          : video, // Assume it's already just the video ID
      })),
    ],
    [images, videos]
  );

  const goToNext = useCallback(() => {
    const isLastSlide = currentIndex === media.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, media.length]);

  // Auto-play functionality - pause when video is playing
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isPlaying && media.length > 1 && media[currentIndex].type !== "video") {
      intervalId = setInterval(() => {
        goToNext();
      }, interval);
    }
    return () => clearInterval(intervalId);
  }, [currentIndex, isPlaying, media, interval, goToNext]);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? media.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (media.length === 0) {
    return (
      <div className="w-full h-80 md:h-96 lg:h-[32rem] bg-gray-100 flex items-center justify-center rounded-xl">
        <p className="text-gray-500">No images or videos available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 md:h-96 lg:h-[32rem] group rounded-xl overflow-hidden shadow-lg ">
      {/* Media Display */}
      {media[currentIndex].type === "image" ? (
        <img
          src={media[currentIndex].src}
          alt={`${propertyName} ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
      ) : (
        <div className="relative w-full h-full">
          <iframe
            src={`https://www.youtube.com/embed/${media[currentIndex].src}?autoplay=1&mute=1&loop=1&playlist=${media[currentIndex].src}&controls=0&modestbranding=1&rel=0&showinfo=0`}
            className="w-full h-full"
            title={`${propertyName} video ${currentIndex + 1}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Navigation Arrows */}
      <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-3 md:left-5 text-2xl rounded-full p-2 bg-black/30 text-white cursor-pointer hover:bg-black/40 transition backdrop-blur-sm">
        <ChevronLeft
          size={24}
          className="md:w-[30px] md:h-[30px]"
          onClick={goToPrevious}
        />
      </div>
      <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-3 md:right-5 text-2xl rounded-full p-2 bg-black/30 text-white cursor-pointer hover:bg-black/40 transition backdrop-blur-sm">
        <ChevronRight
          size={24}
          className="md:w-[30px] md:h-[30px]"
          onClick={goToNext}
        />
      </div>

      {/* Play/Pause Button - only show for image slides */}
      {media.length > 1 && media[currentIndex].type === "image" && (
        <button
          onClick={togglePlay}
          className="absolute top-3 right-3 bg-black/30 text-white p-2 rounded-full hover:bg-black/40 transition backdrop-blur-sm"
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      )}

      {/* Dots Indicator */}
      <div className="flex justify-center absolute bottom-4 w-full px-4">
        <div className="bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 inline-flex">
          {media.map((_, slideIndex) => (
            <button
              key={slideIndex}
              className={`mx-1 w-2 h-2 rounded-full cursor-pointer transition-all ${
                currentIndex === slideIndex ? "bg-white w-4" : "bg-white/50"
              }`}
              onClick={() => goToSlide(slideIndex)}
              aria-label={`Go to slide ${slideIndex + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col space-y-2">
        {media[currentIndex].type === "video" && (
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Video Tour
          </span>
        )}
      </div>
    </div>
  );
};

interface Tag {
  name: string;
}

interface Property {
  title: string;
  price: string;
  image: string;
  tags: (string | Tag)[];
  viewing: string;
  _id: string;
}

interface PropertyCardProps extends Property {
  onClick: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  title,
  price,
  image,
  tags = [],
  viewing,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 w-full max-w-sm cursor-pointer bg-white"
  >
    <div className="relative aspect-[4/3]">
      <img
        src={image || "https://via.placeholder.com/300x225?text=No+Image"}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      {viewing && (
        <span className="absolute top-3 left-3 bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">
          {viewing}
        </span>
      )}
      <span className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-md">
        Popular Choice
      </span>
    </div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 line-clamp-1 text-sm">
          {title || "Untitled Property"}
        </h3>
        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
          New
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Knowledge Park, Greater Noida
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags?.slice(0, 3).map((t, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200"
          >
            {typeof t === "object" && t !== null && "name" in t
              ? t.name
              : typeof t === "string"
              ? t
              : "Unknown"}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Starting from</p>
          <p className="text-sm font-semibold text-yellow-600">
            {price || "Price not available"}
          </p>
        </div>
        <button className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg transition">
          View
        </button>
      </div>
    </div>
  </div>
);

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  minDate?: Date;
  disabled?: boolean;
}

const CustomCalendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  disabled = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return null;
    const [year, month, day] = selectedDate.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }, [selectedDate]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    return date < minDate || disabled;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDateObj) return false;
    // Fix: Compare dates without time components
    return (
      date.getDate() === selectedDateObj.getDate() &&
      date.getMonth() === selectedDateObj.getMonth() &&
      date.getFullYear() === selectedDateObj.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    if (disabled) return;

    const clickedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (!isDateDisabled(clickedDate)) {
      // Fix: Create date string in local timezone to avoid timezone issues
      const year = clickedDate.getFullYear();
      const month = String(clickedDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const dateString = `${year}-${month}-${dayStr}`;

      onDateSelect(dateString);
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isDisabled = isDateDisabled(date);
      const isSelected = isDateSelected(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          disabled={isDisabled}
          className={`
            w-8 h-8 text-sm rounded-md transition-colors
            ${
              isSelected
                ? "bg-yellow-600 text-white font-semibold"
                : isToday
                ? "bg-yellow-100 text-yellow-800 font-medium"
                : "hover:bg-gray-100"
            }
            ${
              isDisabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 cursor-pointer"
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return "Select date";
    // Fix: Parse the date correctly to avoid timezone shifts
    const [year, month, day] = selectedDate.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="relative">
      {/* Calendar Input Field */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg text-left
          focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
          transition flex items-center justify-between
          ${
            disabled
              ? "bg-gray-50 cursor-not-allowed"
              : "bg-white hover:border-gray-400"
          }
        `}
      >
        <span className={selectedDate ? "text-gray-900" : "text-gray-500"}>
          {formatDisplayDate()}
        </span>
        <Calendar className="w-5 h-5 text-gray-400" />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth("prev")}
              className="p-1 hover:bg-gray-100 rounded-md transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <h3 className="font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>

            <button
              type="button"
              onClick={() => navigateMonth("next")}
              className="p-1 hover:bg-gray-100 rounded-md transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
            {selectedDate && (
              <button
                type="button"
                onClick={() => {
                  onDateSelect("");
                  setIsOpen(false);
                }}
                className="text-sm text-red-600 hover:text-red-800 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SingleListing: React.FC = () => {
  const navigate = useNavigate();
  const amenitiesRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState<FormData>({
    schedule_Time: "",
  });
  const [check, setCheck] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);

  // Add the missing handleDateSelect function
  const handleDateSelect = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      schedule_Time: date,
    }));
  };

  // Remove the unused handleChange function or keep it if needed for other inputs
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value, type, checked } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: type === "checkbox" ? checked : value,
  //   }));
  // };

  // Add function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem("userid");
      if (!userId) {
        console.log("No user ID found in localStorage");
        return;
      }

      const response = await instance.get(`/user/${userId}`);

      if (response.data && response.data.user) {
        // User data is available but we're not storing it since it's not used
        console.log("User profile loaded successfully");
      } else {
        console.log("Invalid user data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Add proper interface for appointment data
  interface AppointmentData {
    _id: string;
    user_id: {
      _id: string;
      email: string;
      User_Name: string;
      phone_no: number;
    };
    property_id: {
      _id: string;
      property_name: string;
      city: string;
      rate: string;
      category: string;
    };
    status: string;
    schedule_Time: string;
    createdAt: string;
    updatedAt: string;
  }

  // Update the checkExistingAppointment function with proper typing and useCallback
  const checkExistingAppointment = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userid");
      if (!userId || !id) return;

      // Update the endpoint to match your backend route
      const response = await instance.get(`/appointments/user/${userId}`);

      if (
        response.data?.appointment &&
        Array.isArray(response.data.appointment)
      ) {
        // Check if there's an appointment for this specific property
        const existingAppointment = response.data.appointment.find(
          (appointment: AppointmentData) => appointment.property_id._id === id
        );

        if (existingAppointment) {
          // If appointment exists, set the state accordingly
          setCheck(true);
          setScheduledDate(existingAppointment.schedule_Time);
          // Also update the form data to show the selected date
          setFormData((prev) => ({
            ...prev,
            schedule_Time: existingAppointment.schedule_Time.split("T")[0], // Convert to YYYY-MM-DD format
          }));
        }
      }
    } catch (error) {
      // If no appointment found or error, keep default state
      console.log("No existing appointment found or error:", error);
    }
  }, [id]); // Add id as dependency

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await instance.get(`/property/${id}`);
        setProperty(response.data || {});

        // Check for existing appointment after property is loaded
        await checkExistingAppointment();

        // Fetch similar properties with proper error handling
        const city = response.data?.city || "Greater Noida";
        try {
          const similarResponse = await instance.get(
            `/property?city=${city}&limit=5`
          );
          console.log(similarResponse.data);

          // Handle different response structures
          let similarData: PropertyData[] = [];
          if (Array.isArray(similarResponse.data)) {
            similarData = similarResponse.data;
          } else if (similarResponse.data?.results) {
            similarData = similarResponse.data.results;
          } else if (similarResponse.data?.data) {
            similarData = similarResponse.data.data;
          }

          // Filter out the current property by ID
          const filteredProperties = similarData.filter(
            (prop: PropertyData) => prop?._id !== id
          );

          // Take only the first 4 properties after filtering
          setSimilarProperties(
            filteredProperties.slice(0, 4).map((prop: PropertyData) => ({
              title: prop?.property_name || "Untitled Property",
              price: prop?.rate
                ? `₹${prop.rate}${prop?.category !== "sale" ? "/mo*" : ""}`
                : "Price not available",
              image:
                prop?.images?.[0] ||
                "https://via.placeholder.com/300x225?text=No+Image",
              tags: [
                prop?.furnishing_type || "Furnishing not specified",
                ...(Array.isArray(prop?.amenties)
                  ? prop.amenties
                      .slice(0, 2)
                      .map((amenity: Amenity) =>
                        typeof amenity === "string"
                          ? amenity
                          : amenity?.name || "Unknown"
                      )
                  : []),
              ],
              viewing: `${Math.floor(Math.random() * 5) + 1} Person${
                Math.floor(Math.random() * 5) + 1 > 1 ? "s" : ""
              } Viewing Today`,
              _id: prop?._id || Math.random().toString(),
            }))
          );
        } catch (similarError) {
          console.error("Error fetching similar properties:", similarError);
          setSimilarProperties([]);
        }
      } catch (err) {
        setError("Failed to fetch property details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id, checkExistingAppointment]); // Add checkExistingAppointment as dependency

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  // Update handleScheduleVisit function - fix the redirect issue
  const handleScheduleVisit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if user is logged in first
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Login first, then book appointment.");
      return;
    }
    const userId = localStorage.getItem("userid");
    if (!userId) {
      toast.error("Please log in to schedule a visit");
      return;
    }

    // Check if user already has an appointment for this property
    if (check) {
      toast.warning("You already have a scheduled visit for this property!");
      return;
    }

    setLoading(true);

    try {
      // Validate the form data
      if (!formData.schedule_Time) {
        toast.error("Please select a preferred visit date");
        setLoading(false);
        return;
      }

      const response = await instance.post("/appointments", {
        user_id: userId,
        property_id: id,
        schedule_Time: formData.schedule_Time,
      });

      console.log("Success:", response.data);
      toast.success("Visit scheduled successfully!");

      // Set the scheduled date and mark as checked
      setScheduledDate(formData.schedule_Time);
      setCheck(true);
    } catch (error: unknown) {
      console.error("Error:", error);

      // Handle specific error for duplicate appointments with better typing
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        if (
          errorResponse.response?.status === 400 &&
          errorResponse.response?.data?.message?.includes("already")
        ) {
          toast.error("You already have an appointment for this property!");
          // Refresh the appointment status
          checkExistingAppointment();
          return;
        }
      }

      // Better error message extraction
      let errorMessage = "Failed to schedule visit. Please try again.";
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = errorResponse.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle login redirect
  const handleLoginRedirect = () => {
    navigate("/signin");
  };

  // Add function to handle signup redirect
  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Also add a separate useEffect to check appointments when user logs in
  useEffect(() => {
    if (isLoggedIn && id) {
      checkExistingAppointment();
    }
  }, [isLoggedIn, id, checkExistingAppointment]); // Add checkExistingAppointment as dependency

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <SkeletonLoader variant="card" count={1} className="h-96" />
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SkeletonLoader variant="text" count={5} className="mb-4" />
                <SkeletonLoader variant="text" count={5} className="mb-4" />
                <SkeletonLoader variant="text" count={5} className="mb-4" />
              </div>
              <div>
                <SkeletonLoader variant="card" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p>Property not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ToastContainer position="top-center" />

          {/* Breadcrumb */}
          <div className="mb-6 space-y-2">
            <p className="text-sm text-gray-500">
              Mother Home / {property?.city || "City not specified"}/{" "}
              <span className="text-gray-800 font-medium">
                {property?.property_name || "Untitled Property"}
              </span>
            </p>
            <Link
              to="/viewlisting"
              className="inline-flex items-center text-lg text-yellow-600 hover:underline"
            >
              ← Back
            </Link>
          </div>

          {/* Header Section */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm mt-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex flex-wrap items-center gap-3 mb-2">
                  {property?.property_name || "Untitled Property"}
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      property?.category === "sale"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                 {property?.category === "sale"
  ? "sale"
  : property?.category === "pg"
  ? "pg"
  : "rent"}

                  </span>
                </h1>
                <p className="text-gray-600 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    <span className="font-medium">Location:</span>{" "}
                    {property?.city || "Not specified"}
                  </span>
                </p>
              </div>

              {/* Price section moved to header on mobile */}
              <div className="lg:text-right">
                <div className="text-sm text-gray-500">
                  {property?.category === "sale" ? "Sale Price" : "Starts from"}
                </div>
                <div className="text-2xl md:text-3xl text-yellow-600 font-bold">
                  {property?.rate
                    ? `₹${property.rate}${
                        property?.category !== "sale" ? "/mo*" : ""
                      }`
                    : "Price not available"}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Area: {property?.area ? `${property.area} sq ft` : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Main Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Slider */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <ImageSlider
                  images={property?.images || []}
                  videos={property?.videos || []}
                  propertyName={property?.property_name || "Property"}
                  autoPlay={true}
                  interval={5000}
                />
              </div>

              {/* Property Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Occupancy Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Available Occupancy
                  </h3>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <BedDouble className="w-6 h-6 text-yellow-600" />
                        <span className="text-lg font-medium text-gray-800">
                          {property?.category === "pg" 
                            ? `${property?.totalCapacity || "N/A"} Capacity`
                            : `${property?.bed || "N/A"} BHK`
                          }
                        </span>
                      </div>
                      <span className="text-xl font-bold text-yellow-600">
                        {property?.rate
                          ? `₹${property.rate}${
                              property?.category !== "sale" ? "/mo*" : ""
                            }`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Info Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Quick Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">
                        {property?.category || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Furnishing:</span>
                      <span className="font-medium">
                        {property?.furnishing_type || "N/A"}
                      </span>
                    </div>
                    {property?.category === "pg" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Per Person Price:</span>
                          <span className="font-medium">
                            {property?.perPersonPrice ? `₹${property.perPersonPrice}` : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Capacity:</span>
                          <span className="font-medium">
                            {property?.totalCapacity || "N/A"}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">
                        {property?.area ? `${property.area} sq ft` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              <div
                className="bg-white rounded-xl p-6 shadow-sm"
                ref={amenitiesRef}
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {property?.amenties?.map((data: Amenity, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <span>{data.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Services
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {property?.services?.map((data: Service, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
                    >
                      <span>{data.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Updated Description Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  About {property?.property_name || "this property"}
                </h3>

                <div className="text-gray-700 leading-relaxed mb-4">
                  {property?.description ? (
                    showFullDescription ? (
                      <div>
                        <p>{property.description}</p>
                        <button
                          onClick={() => setShowFullDescription(false)}
                          className="text-yellow-600 font-medium cursor-pointer hover:underline mt-2"
                        >
                          Read less
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p>{property.description.slice(0, 200)}...</p>
                        <button
                          onClick={() => setShowFullDescription(true)}
                          className="text-yellow-600 font-medium cursor-pointer hover:underline"
                        >
                          Read more
                        </button>
                      </div>
                    )
                  ) : (
                    "No description available."
                  )}
                </div>

                <button
                  onClick={() => setShowPolicies(!showPolicies)}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  {showPolicies ? "Hide" : "Show"} Policies & House Rules
                </button>

                {/* Policies Modal/Expandable Content */}
                {showPolicies && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Policies & House Rules
                    </h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      {/* <div>
                        <h5 className="font-medium text-gray-800">
                          Check-in/Check-out:
                        </h5>
                        <p>• Check-in: 2:00 PM onwards</p>
                        <p>• Check-out: 11:00 AM</p>
                      </div> */}
                      <div>
                        <h5 className="font-medium text-gray-800">
                          House Rules:
                        </h5>
                        <p>• No smoking inside the property</p>
                        {/* <p>• No pets allowed</p> */}
                        <p>• Visitors allowed with prior notice</p>
                        <p>• Maintain cleanliness and hygiene</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">
                          Cancellation Policy:
                        </h5>
                        <p>
                          • Free cancellation up to 24 hours before check-in
                        </p>
                        <p>• 50% refund for cancellations within 24 hours</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price disclaimer */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {property?.category === "sale"
                      ? "*This is the sale price. Taxes and fees may apply."
                      : "*Denotes starting price inclusive of taxes. Final prices may vary based on room occupancy, customized services, and additional attributes."}
                  </p>
                </div>
              </div>

              {/* Similar Properties Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Similar Properties
                </h3>

                {similarProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {similarProperties.map((prop) => (
                      <PropertyCard
                        key={prop._id}
                        {...prop}
                        onClick={() => navigate(`/viewlisting/${prop._id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No similar properties found
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Updated Booking Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-center mb-6">
                    Schedule a Visit
                  </h3>

                  {/* Show scheduled date message if visit is already scheduled */}
                  {check && scheduledDate && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center text-green-800">
                        <Calendar className="w-5 h-5 mr-2" />
                        <div>
                          <p className="font-medium">Visit Scheduled!</p>
                          <p className="text-sm">
                            Your site visit is scheduled for{" "}
                            {new Date(scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/appointments")}
                        className="mt-3 text-sm text-green-700 hover:underline"
                      >
                        View all appointments →
                      </button>
                    </div>
                  )}

                  {!check && (
                    <form onSubmit={handleScheduleVisit} className="space-y-4">
                      {/* Enhanced Date Picker Field with Custom Calendar */}
                      <div>
                        <label
                          htmlFor="schedule_Time"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Preferred Visit Date
                        </label>

                        <CustomCalendar
                          selectedDate={formData.schedule_Time}
                          onDateSelect={handleDateSelect}
                          minDate={new Date()}
                          disabled={!isLoggedIn}
                        />

                        <p className="text-xs text-gray-500 mt-1">
                          Select your preferred date for property visit
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          📋 We accept bookings with a minimum stay of 3 months.
                        </p>
                      </div>

                      {/* Submit button and auth options */}
                      <div className="space-y-3">
                        {!isLoggedIn && (
                          <div className="space-y-3">
                            <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-sm text-orange-800 font-medium mb-3">
                                Please login or sign up to book an appointment
                              </p>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={handleLoginRedirect}
                                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition"
                                >
                                  Login
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSignupRedirect}
                                  className="flex-1 border border-yellow-600 text-yellow-600 hover:bg-yellow-50 font-medium py-2 px-4 rounded-lg transition"
                                >
                                  Sign Up
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {isLoggedIn && (
                          <LoadingButton
                            type="submit"
                            loading={loading}
                            loadingText="Scheduling..."
                            variant="primary"
                            size="lg"
                            className="w-full"
                          >
                            Schedule Visit
                          </LoadingButton>
                        )}
                      </div>
                    </form>
                  )}

                  {/* Additional Info */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="text-center text-sm text-gray-600">
                      <p className="mb-2">Need help? Contact us</p>
                      <div className="flex justify-center space-x-4">
                        <span>📞 +91-6202653172</span>
                        <span>✉️ info@motherhomes.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleListing;
