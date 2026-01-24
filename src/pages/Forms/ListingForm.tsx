import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import instance from "../../utils/Axios/Axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingButton } from "../../components/ui/loading";
import { useParams, useNavigate } from "react-router-dom";

interface Amenity {
  _id: string;
  name: string;
  __v?: number;
}

interface Service {
  _id: string;
  name: string;
  __v?: number;
}

interface PropertyFormData {
  property_name: string;
  description: string;
  rate: string;
  category: "rent" | "sale" | "pg";
  amenities: string[];
  services: string[];
  images: File[];
  existingImages: string[];
  videos: string[];
  furnishing_type: "Raw" | "Semi-furnished" | "Fully furnished";
  city: string;
  state: string;
  address: string;
  flat_no: string;
  bed: number;
  bathroom: number;
  area: string;
  availability: boolean;
  latitude: string;
  longitude: string;
  perPersonPrice?: string;
  totalCapacity?: string;
}

const MultiSelect = ({
  options,
  selected,
  onChange,
  label,
}: {
  options: Array<Amenity | Service>;
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id]
    );
  };

  const removeOption = (id: string) => {
    onChange(selected.filter((item) => item !== id));
  };

  const getOptionName = (id: string) => {
    return options.find((opt) => opt._id === id)?.name || id;
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div
          className={`w-full rounded border border-gray-300 bg-white p-2 text-sm focus:border-blue-500 focus:outline-none min-h-[42px] flex flex-wrap gap-2 cursor-pointer text-gray-900 ${
            isOpen ? "ring-2 ring-blue-300 border-blue-500" : ""
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selected.length === 0 ? (
            <span className="text-gray-400 px-2 py-1">Select {label}</span>
          ) : (
            selected.map((id) => (
              <span
                key={id}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1"
              >
                {getOptionName(id)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(id);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option._id}
                className={`px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-900 ${
                  selected.includes(option._id) ? "bg-blue-100" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(option._id);
                }}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(option._id)}
                    readOnly
                    className="mr-2 accent-blue-500"
                  />
                  {option.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<PropertyFormData>({
    property_name: "",
    description: "",
    rate: "",
    category: "rent",
    amenities: [],
    services: [],
    images: [],
    existingImages: [],
    videos: [""],
    furnishing_type: "Raw",
    city: "",
    state: "",
    address: "",
    flat_no: "",
    bed: 1,
    bathroom: 1,
    area: "",
    availability: true,
    latitude: "",
    longitude: "",
    perPersonPrice: "",
    totalCapacity: "",
  });

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageTooLarge, setImageTooLarge] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await instance.get("/amentiesservice/all");
        setAmenities(response.data.data.amenities);
        setServices(response.data.data.services);
        setOptionsLoading(false);
      } catch (error) {
        setError("Failed to load amenities and services");
        setOptionsLoading(false);
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchProperty = async () => {
        try {
          const response = await instance.get(`/property/${id}`);
          const data = response.data;
          setFormData({
            property_name: data.property_name,
            description: data.description,
            rate: data.rate,
            category: data.category,
            amenities: data.amenities.map((a: any) => a._id || a),
            services: data.services.map((s: any) => s._id || s),
            images: [],
            existingImages: data.images || [],
            videos: data.videos && data.videos.length > 0 ? data.videos : [""],
            furnishing_type: data.furnishing_type,
            city: data.city,
            state: data.state,
            address: data.address,
            flat_no: data.flat_no || "",
            bed: data.bed,
            bathroom: data.bathroom,
            area: data.area,
            availability: data.availability,
            latitude: data.latitude || "",
            longitude: data.longitude || "",
            perPersonPrice: data.perPersonPrice || "",
            totalCapacity: data.totalCapacity || "",
          });
        } catch (error) {
          console.error("Error fetching property details:", error);
          toast.error("Failed to fetch property details");
        }
      };
      fetchProperty();
    }
  }, [isEditMode, id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "bed" || name === "bathroom") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else if (name === "availability") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files!);
      const totalImages =
        formData.images.length + formData.existingImages.length + newFiles.length;
      if (totalImages > 10) {
        toast.error("Image limit exceeded (max 10), please remove some images.");
        return;
      }
      const tooLarge = newFiles.some((file) => file.size > 10 * 1024 * 1024);
      if (tooLarge) {
        setImageTooLarge(true);
        toast.error("One or more images exceed the 10MB size limit.");
      } else {
        setImageTooLarge(false);
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      const tooLarge = newImages.some((file) => file.size > 10 * 1024 * 1024);
      setImageTooLarge(tooLarge);
      return { ...prev, images: newImages };
    });
  };

  const removeExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  const handleVideoChange = (idx: number, value: string) => {
    setFormData((prev) => {
      const newVideos = [...prev.videos];
      newVideos[idx] = value;
      return { ...prev, videos: newVideos };
    });
  };

  const addVideoField = () => {
    setFormData((prev) => ({ ...prev, videos: [...prev.videos, ""] }));
  };

  const removeVideoField = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("property_name", formData.property_name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("rate", formData.rate);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("area", formData.area);

      formData.amenities.forEach((amenityId) => {
        formDataToSend.append("amenities[]", amenityId);
      });

      formData.services.forEach((serviceId) => {
        formDataToSend.append("services[]", serviceId);
      });

      formDataToSend.append("furnishing_type", formData.furnishing_type);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("bed", String(formData.bed));
      formDataToSend.append("bathroom", String(formData.bathroom));
      formDataToSend.append("availability", String(formData.availability));
      formDataToSend.append("latitude", formData.latitude);
      formDataToSend.append("longitude", formData.longitude);
      if (formData.flat_no) {
        formDataToSend.append("flat_no", formData.flat_no);
      }
      if (formData.category === "pg") {
        formDataToSend.append("perPersonPrice", formData.perPersonPrice || "");
        formDataToSend.append("totalCapacity", formData.totalCapacity || "");
      }

      formData.videos.forEach((video) => {
        if (video.trim() !== "") {
          formDataToSend.append("videos[]", video);
        }
      });

      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      // Handle existing images for update
      if (isEditMode) {
         // The backend expects existingImages to be passed.
         // Since FormData supports strings, we can append them. 
         // Most backends (like your propertyRouter) check req.body.existingImages
         // If using FormData, we might need to append them individually or as JSON string depending on backend parsing.
         // Based on your backend code: 
         // if (typeof req.body.existingImages === 'string') JSON.parse...
         // else if (Array.isArray(req.body.existingImages))...
         // So appending multiple "existingImages" keys works if multer handles it, OR we can JSON stringify it.
         // To be safe and matching the backend logic:
         formData.existingImages.forEach((imgUrl) => {
             formDataToSend.append("existingImages", imgUrl);
         });
      }

      if (isEditMode && id) {
        await instance.put(`/property/${id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Property updated successfully!");
        navigate("/alllisting"); // Redirect to listing table after update
      } else {
        await instance.post("/property", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Property created successfully!");
        // Optional: clear form or redirect
         setFormData({
            property_name: "",
            description: "",
            rate: "",
            category: "rent",
            amenities: [],
            services: [],
            images: [],
            existingImages: [],
            videos: [""],
            furnishing_type: "Raw",
            city: "",
            state: "",
            address: "",
            flat_no: "",
            bed: 1,
            bathroom: 1,
            area: "",
            availability: true,
            latitude: "",
            longitude: "",
            perPersonPrice: "",
            totalCapacity: "",
          });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save property");
      setError(err.response?.data?.error || "Failed to save property");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded border border-gray-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      <ToastContainer position="bottom-center" />
      <PageBreadcrumb pageTitle={isEditMode ? "Edit Property" : "Add Property"} />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg max-w-5xl mx-auto border border-gray-200"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold mb-8 text-gray-800">
          {isEditMode ? "Edit Property Listing" : "Add New Property Listing"}
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-700">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Information Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
            <h3 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Property Name*
                </label>
                <input
                  type="text"
                  name="property_name"
                  value={formData.property_name}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="Enter property name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Category*
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                  <option value="pg">Pg</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputClass} min-h-[120px]`}
                  required
                  placeholder="Describe the property in detail"
                />
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
            <h3 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300">
              Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Address*
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="Full property address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  City*
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  State*
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Area (sq ft)*
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="Property area in square feet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Latitude
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Latitude (e.g., 28.6139)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Longitude
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Longitude (e.g., 77.2090)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Flat No (Admin Only)
                </label>
                <input
                  type="text"
                  name="flat_no"
                  value={formData.flat_no}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g., A-101, B-205"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This information is for admin tracking only and will not be visible to users
                </p>
              </div>
            </div>
          </div>

          {/* Property Details Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
            <h3 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300">
              Property Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Rate*
                </label>
                <input
                  type="text"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="Price per month/year"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Furnishing Type*
                </label>
                <select
                  name="furnishing_type"
                  value={formData.furnishing_type}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="Raw">Raw</option>
                  <option value="Semi-furnished">Semi-furnished</option>
                  <option value="Fully furnished">Fully furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Bedrooms*
                </label>
                <input
                  type="number"
                  name="bed"
                  value={formData.bed}
                  onChange={handleChange}
                  className={inputClass}
                  min={0}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Bathrooms*
                </label>
                <input
                  type="number"
                  name="bathroom"
                  value={formData.bathroom}
                  onChange={handleChange}
                  className={inputClass}
                  min={0}
                  required
                />
              </div>
              {formData.category === "pg" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Per Person Price*
                    </label>
                    <input
                      type="text"
                      name="perPersonPrice"
                      value={formData.perPersonPrice || ""}
                      onChange={handleChange}
                      className={inputClass}
                      required
                      placeholder="Enter per person price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Total Capacity*
                    </label>
                    <input
                      type="text"
                      name="totalCapacity"
                      value={formData.totalCapacity || ""}
                      onChange={handleChange}
                      className={inputClass}
                      required
                      placeholder="Enter total capacity"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleChange}
                  className="w-5 h-5 accent-blue-500 dark:accent-blue-400"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Currently Available
                </label>
              </div>
            </div>
          </div>

          {/* Amenities and Services Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
            <h3 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300">
              Amenities & Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {optionsLoading ? (
                <div className="col-span-2 flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading amenities...
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading services...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <MultiSelect
                    options={amenities}
                    selected={formData.amenities}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        amenities: selected,
                      }))
                    }
                    label="Amenities"
                  />
                  <MultiSelect
                    options={services}
                    selected={formData.services}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        services: selected,
                      }))
                    }
                    label="Services"
                  />
                </>
              )}
            </div>
          </div>

          {/* Media Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300">
              Media
            </h3>

            {/* Images Upload */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Upload Images (Max 10)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 dark:file:border-gray-600 file:rounded file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
                disabled={
                  formData.images.length + formData.existingImages.length >= 10
                }
              />
              
              {/* Existing Images */}
               {formData.existingImages.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Existing Images:
                  </h4>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.existingImages.map((imgUrl, idx) => (
                      <li
                        key={`existing-${idx}`}
                        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded p-2 flex flex-col"
                      >
                        <div className="w-full h-32 mb-2 overflow-hidden rounded">
                          <img
                            src={imgUrl}
                            alt={`Existing ${idx}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm self-end"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* New Images */}
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    New Images:
                  </h4>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.images.map((img, idx) => (
                      <li
                        key={`new-${idx}`}
                        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded p-2 flex flex-col"
                      >
                        <div className="w-full h-32 mb-2 overflow-hidden rounded">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview ${idx}`}
                            className="w-full h-full object-cover"
                            onLoad={(e) =>
                              URL.revokeObjectURL(
                                (e.target as HTMLImageElement).src
                              )
                            }
                          />
                        </div>
                        <span className="text-sm truncate mb-1 text-gray-700 dark:text-gray-300">
                          {img.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm self-end"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
             
              {formData.images.length + formData.existingImages.length >= 10 && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Maximum 10 images reached
                </p>
              )}
            </div>

            {/* Videos */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Video URLs
              </label>
              {formData.videos.map((video, idx) => (
                <div key={idx} className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    value={video}
                    onChange={(e) => handleVideoChange(idx, e.target.value)}
                    className={inputClass}
                    placeholder="https://youtube.com/..."
                  />
                  {formData.videos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVideoField(idx)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 whitespace-nowrap"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addVideoField}
                className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm mt-2 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add another video URL
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-10 flex justify-end">
          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Processing..."
            variant="primary"
            size="lg"
            disabled={optionsLoading || imageTooLarge}
          >
            Submit Property Listing
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
