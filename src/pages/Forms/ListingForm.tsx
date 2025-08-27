import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import instance from "../../utils/Axios/Axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingButton } from "../../components/ui/loading";

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
  category: "rent" | "sale";
  amenties: string[];
  services: string[];
  images: File[];
  videos: string[];
  furnishing_type: "Raw" | "Semi-furnished" | "Fully furnished";
  city: string;
  state: string;
  address: string;
  bed: number;
  bathroom: number;
  area: string;
  availability: boolean;
  latitude: string;
  longitude: string;
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
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <div
          className={`w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none min-h-[42px] flex flex-wrap gap-2 cursor-pointer text-gray-900 dark:text-gray-100 ${
            isOpen
              ? "ring-2 ring-blue-300 dark:ring-blue-400 border-blue-500 dark:border-blue-400"
              : ""
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selected.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-500 px-2 py-1">
              Select {label}
            </span>
          ) : (
            selected.map((id) => (
              <span
                key={id}
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded flex items-center gap-1"
              >
                {getOptionName(id)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(id);
                  }}
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-500"
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
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option._id}
                className={`px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100 ${
                  selected.includes(option._id)
                    ? "bg-blue-100 dark:bg-gray-700"
                    : ""
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
                    className="mr-2 accent-blue-500 dark:accent-blue-400"
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

export default function AddListing() {
  const [formData, setFormData] = useState<PropertyFormData>({
    property_name: "",
    description: "",
    rate: "",
    category: "rent",
    amenties: [],
    services: [],
    images: [],
    videos: [""],
    furnishing_type: "Raw",
    city: "",
    state: "",
    address: "",
    bed: 1,
    bathroom: 1,
    area: "",
    availability: true,
    latitude: "",
    longitude: "",
  });

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
      const totalImages = formData.images.length + newFiles.length;
      // Check for image count limit
      if (totalImages > 10) {
        toast.error("Image limit exceeded, please remove some images.");
        return;
      }
      // Check for per-image size limit
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
      // Check if any remaining image is too large
      const tooLarge = newImages.some((file) => file.size > 10 * 1024 * 1024);
      setImageTooLarge(tooLarge);
      return {
        ...prev,
        images: newImages,
      };
    });
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

  const resetForm = () => {
    setFormData({
      property_name: "",
      description: "",
      rate: "",
      category: "rent",
      amenties: [],
      services: [],
      images: [],
      videos: [""],
      furnishing_type: "Raw",
      city: "",
      state: "",
      address: "",
      bed: 1,
      bathroom: 1,
      area: "",
      availability: true,
      latitude: "",
      longitude: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      // Append all text fields
      formDataToSend.append("property_name", formData.property_name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("rate", formData.rate);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("area", formData.area);

      // Append arrays
      formData.amenties.forEach((amenityId) => {
        formDataToSend.append("amenties[]", amenityId);
      });

      formData.services.forEach((serviceId) => {
        formDataToSend.append("services[]", serviceId);
      });

      // Append other fields
      formDataToSend.append("furnishing_type", formData.furnishing_type);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("bed", String(formData.bed));
      formDataToSend.append("bathroom", String(formData.bathroom));
      formDataToSend.append("availability", String(formData.availability));
      formDataToSend.append("latitude", formData.latitude);
      formDataToSend.append("longitude", formData.longitude);

      // Append videos
      formData.videos.forEach((video) => {
        if (video.trim() !== "") {
          formDataToSend.append("videos[]", video);
        }
      });

      // Append images
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      await instance.post("/property", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      resetForm();
      setSuccess("Property created successfully!");
      toast.success("Property created successfully!")
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create property")
      setError(err.response?.data?.error || "Failed to create property");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="bottom-center" />
      <PageBreadcrumb pageTitle="Add Property" />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg shadow-lg max-w-5xl mx-auto border border-gray-200 dark:border-gray-700"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">
          Add New Property Listing
        </h2>

        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-700">
            {success}
          </div>
        )}

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
                  Latitude*
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="Latitude (e.g., 28.6139)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Longitude*
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="Longitude (e.g., 77.2090)"
                />
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
                    selected={formData.amenties}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        amenties: selected,
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
                disabled={formData.images.length >= 10}
              />
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Selected Images:
                  </h4>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.images.map((img, idx) => (
                      <li
                        key={idx}
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
              {formData.images.length >= 10 && (
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
