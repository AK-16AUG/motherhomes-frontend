import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import instance from "../../utils/Axios/Axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageLoader } from "../../components/ui/loading";

interface User {
  _id: string;
  User_Name: string;
  phone_no: number;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Appointment {
  _id: string;
  user_id: User;
  property_id: string;
  phone: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  schedule_Time?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ScheduledVisit {
  _id: string;
  visitorName: string;
  visitorEmail: string;
  visitorImage?: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled";
  __v?: number;
}

interface Property {
  _id: string;
  property_name: string;
  description: string;
  rate: string;
  category: string;
  amenities: any[];
  services: any[];
  images: string[];
  videos: string[];
  furnishing_type: string;
  city: string;
  state: string;
  scheduledVisit: ScheduledVisit[];
  total_views: number;
  bed: number;
  bathroom: number;
  leads: any[];
  availability: boolean;
  currentTenant: null | any;
  createdAt: string;
  updatedAt: string;
  __v: number;
  area?: string;
  perPersonPrice?: string;
  totalCapacity?: string;
}

interface MediaItem {
  type: "image" | "video";
  url: string;
}

// MultiSelect reusable component
const MultiSelect = ({
  options,
  selected,
  onChange,
  label,
}: {
  options: Array<{ _id: string; name: string }>;
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

  const removeOption = (id: string) =>
    onChange(selected.filter((item) => item !== id));

  const getOptionName = (id: string) =>
    options.find((opt) => opt._id === id)?.name || id;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <div
          className={`w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm focus:border-blue-500 dark:focus:border-blue-400 min-h-[42px] flex flex-wrap gap-2 cursor-pointer text-gray-900 dark:text-gray-100 ${
            isOpen ? "ring-2 ring-blue-300" : ""
          }`}
          onClick={() => setIsOpen((v) => !v)}
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

// Edit Property Modal Component
export const EditPropertyModal = ({
  property,
  isOpen,
  onClose,
  onSave,
}: {
  property: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    updated: Partial<any>,
    images?: File[],
    imagesToDelete?: string[]
  ) => Promise<void>;
}) => {
  const [formData, setFormData] = useState({
    property_name: "",
    description: "",
    rate: "",
    category: "rent",
    furnishing_type: "Raw",
    city: "",
    state: "",
    area: "",
    bed: 1,
    bathroom: 1,
    availability: true,
    amenities: [] as string[], // use correct spelling in state/UI
    services: [] as string[],
    images: [] as File[],
    perPersonPrice: "",
    totalCapacity: "",
  });

  const [amenities, setAmenities] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [services, setServices] = useState<{ _id: string; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (!property || !amenities.length) return;

    setFormData({
      property_name: property.property_name,
      description: property.description,
      rate: property.rate,
      category: property.category,
      furnishing_type: property.furnishing_type,
      city: property.city,
      state: property.state,
      area: property.area || "",
      bed: property.bed,
      bathroom: property.bathroom,
      availability: property.availability,
      amenities: Array.isArray(property.amenities)
        ? property.amenities
            .map((item: any) =>
              typeof item === "string"
                ? amenities.find((a) => a._id === item || a.name === item)
                    ?._id || item
                : item && item._id
                ? item._id
                : ""
            )
            .filter(Boolean)
        : [],
      services: Array.isArray(property.services)
        ? property.services
            .map((item: any) =>
              typeof item === "string"
                ? services.find((s) => s._id === item || s.name === item)
                    ?._id || item
                : item && item._id
                ? item._id
                : ""
            )
            .filter(Boolean)
        : [],
      images: [],
      perPersonPrice: property.perPersonPrice || "",
      totalCapacity: property.totalCapacity || "",
    });
    setExistingImages(property.images || []);
    setImagesToDelete([]);
  }, [property, isOpen, amenities, services]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const response = await instance.get("/amentiesservice/all");
        setAmenities(response.data.data.amenities || []);
        setServices(response.data.data.services || []);
      } catch (error) {
        toast.error("Failed to load amenities/services");
      } finally {
        setLoadingOptions(false);
      }
    };
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const newFiles = Array.from(e.target.files!);
  //     const totalImages = formData.images.length + existingImages.length + newFiles.length;
  //     if (totalImages > 10) {
  //       toast.error("Image limit exceeded, please remove some images.");
  //       return;
  //     }
  //     const tooLarge = newFiles.some((file) => file.size > 10 * 1024 * 1024);
  //     if (tooLarge) {
  //       setImageTooLarge(true);
  //       toast.error("One or more images exceed the 10MB size limit.");
  //       return;
  //     } else {
  //       setImageTooLarge(false);
  //     }
  //     setFormData((prev) => ({
  //       ...prev,
  //       images: [...prev.images, ...newFiles],
  //     }));
  //     setNewImagePreviews((prev) => [
  //       ...prev,
  //       ...newFiles.map((file) => URL.createObjectURL(file)),
  //     ]);
  //   }
  // };

  const removeExistingImage = (index: number) => {
    setImagesToDelete((prev) => [...prev, existingImages[index]]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Always flatten and filter existingImages to a flat array of URLs
      const flatExistingImages = existingImages
        .flat(Infinity)
        .filter((img) => typeof img === "string" && img.startsWith("http"));

      // Map amenities to amenties for backend
      const updateData: any = {
        ...formData,
        bed: Number(formData.bed),
        bathroom: Number(formData.bathroom),
        images: flatExistingImages, // always a flat array of strings
        amenities: formData.amenities,
      };

      if (formData.images.length > 0) {
        const formDataToSend = new FormData();
        Object.entries(updateData).forEach(([key, value]) => {
          if (key === "existingImages") return;
          if (Array.isArray(value)) {
            value.forEach((v) => formDataToSend.append(`${key}[]`, v));
          } else {
            formDataToSend.append(key, value as any);
          }
        });
        // Correct way: send existingImages as a JSON string
        formDataToSend.append(
          "existingImages",
          JSON.stringify(flatExistingImages)
        );
        formData.images.forEach((img) => formDataToSend.append("images", img));
        await onSave(formDataToSend as any, undefined, imagesToDelete);
      } else {
        await onSave(updateData, undefined, imagesToDelete);
      }
      onClose();
      window.location.reload();
    } catch (err) {
      toast.error("Failed to update property");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-40 flex items-center justify-center z-50 p-4 mt-14">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Edit Property Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSaving}
              aria-label="close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Name
              </label>
              <input
                type="text"
                name="property_name"
                value={formData.property_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate (₹/month)
                </label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                  <option value="pg">PG</option>
                </select>
              </div>
            </div>

            {formData.category === "pg" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Per Person Price
                  </label>
                  <input
                    type="text"
                    name="perPersonPrice"
                    value={formData.perPersonPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter per person price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Capacity
                  </label>
                  <input
                    type="text"
                    name="totalCapacity"
                    value={formData.totalCapacity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter total capacity"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bed"
                    value={formData.bed}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathroom"
                    value={formData.bathroom}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Furnishing Type
              </label>
              <select
                name="furnishing_type"
                value={formData.furnishing_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Raw">Raw</option>
                <option value="Semi-furnished">Semi-furnished</option>
                <option value="Fully furnished">Fully furnished</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area (sq ft)
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g. 1368"
                />
              </div>
            </div>

            {loadingOptions ? (
              <div className="text-gray-500">Loading amenities/services...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MultiSelect
                  options={amenities}
                  selected={formData.amenities}
                  onChange={(selected) =>
                    setFormData((prev) => ({ ...prev, amenities: selected }))
                  }
                  label="Amenities"
                />
                <MultiSelect
                  options={services}
                  selected={formData.services}
                  onChange={(selected) =>
                    setFormData((prev) => ({ ...prev, services: selected }))
                  }
                  label="Services"
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Available for rent
              </label>
            </div>

            {/* Image Upload */}
            {/*
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Upload Images (Max 10)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                disabled={existingImages.length + newImagePreviews.length >= 10}
              />
              {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 text-gray-700">
                    Selected Images:
                  </h4>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {existingImages.map((img, idx) => (
                      <li
                        key={"existing-" + idx}
                        className="border border-gray-300 bg-white rounded p-2 flex flex-col"
                      >
                        <div className="w-full h-32 mb-2 overflow-hidden rounded">
                          <img
                            src={img}
                            alt={`Existing Preview ${idx}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="text-red-500 hover:text-red-700 text-sm self-end"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                    {newImagePreviews.map((img, idx) => (
                      <li
                        key={"new-" + idx}
                        className="border border-gray-300 bg-white rounded p-2 flex flex-col"
                      >
                        <div className="w-full h-32 mb-2 overflow-hidden rounded">
                          <img
                            src={img}
                            alt={`Preview ${idx}`}
                            className="w-full h-full object-cover"
                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="text-red-500 hover:text-red-700 text-sm self-end"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {existingImages.length + newImagePreviews.length >= 10 && (
                <p className="mt-2 text-xs text-gray-500">
                  Maximum 10 images reached
                </p>
              )}
            </div>
            */}
            {/* Show only existing images with delete option */}
            {existingImages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 text-gray-700">
                  Existing Images:
                </h4>
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {existingImages.map((img, idx) => (
                    <li
                      key={"existing-" + idx}
                      className="border border-gray-300 bg-white rounded p-2 flex flex-col"
                    >
                      <div className="w-full h-32 mb-2 overflow-hidden rounded">
                        <img
                          src={img}
                          alt={`Existing Preview ${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="text-red-500 hover:text-red-700 text-sm self-end"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Appointment Row Component
const AppointmentRow: React.FC<{
  appointment: Appointment;
  onUpdate: (id: string, time: string, status: string) => Promise<void>;
}> = ({ appointment, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const initialDateTime = appointment.schedule_Time
    ? new Date(appointment.schedule_Time).toISOString().slice(0, 16)
    : "";
  const [editedTime, setEditedTime] = useState(initialDateTime);
  const [editedStatus, setEditedStatus] = useState<Appointment["status"]>(
    appointment.status
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(appointment?._id, editedTime, editedStatus);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr key={appointment._id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <p className="h-10 w-10 rounded-full">
              {`${appointment?.user_id?.User_Name.charAt(
                0
              )} ${appointment?.user_id?.User_Name.charAt(1)}`}
            </p>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {appointment?.user_id?.User_Name}
            </div>
            <div className="text-sm text-gray-500">
              {appointment?.user_id?.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {appointment?.user_id?.phone_no}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(appointment.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="datetime-local"
            value={editedTime}
            onChange={(e) => setEditedTime(e.target.value)}
            className="border rounded p-1"
          />
        ) : (
          <span className="text-sm text-gray-500">
            {appointment.schedule_Time
              ? new Date(appointment?.schedule_Time).toLocaleString()
              : "Not specified"}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <select
            value={editedStatus}
            onChange={(e) =>
              setEditedStatus(e.target.value as Appointment["status"])
            }
            className="border rounded p-1"
            disabled={isSaving}
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        ) : (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              appointment.status === "Confirmed"
                ? "bg-green-100 text-green-800"
                : appointment.status === "Cancelled"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {appointment.status}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-900 mr-2"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-600 hover:text-gray-900"
              disabled={isSaving}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-900"
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
};

// Main SingleProperty Component
const SingleProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAppointments, setShowAppointments] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await instance.get(`/property/${id}`);
        console.log("Property data:", response.data);
        console.log("Amenities:", response.data.amenities);
        console.log("Services:", response.data.services);
        setProperty(response.data);
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAppointment = async () => {
      try {
        if (role === "user") return;
        const response = await instance.get(`/appointments/property/${id}`);
        setAppointments(response.data?.appointment || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchProperty();
    fetchAppointment();
  }, [id, role]);

  useEffect(() => {
    if (property) {
      const items: MediaItem[] = [];

      property.images?.forEach((image) => {
        items.push({ type: "image", url: image });
      });

      property.videos?.forEach((video) => {
        const youtubeRegex =
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = video.match(youtubeRegex);
        const videoId = match ? match[1] : video;

        items.push({
          type: "video",
          url: videoId.includes("youtube")
            ? videoId
            : `https://www.youtube.com/embed/${videoId}`,
        });
      });

      setMediaItems(items);
    }
  }, [property]);

  const nextMedia = () => {
    setCurrentMediaIndex((prevIndex) =>
      prevIndex === mediaItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prevIndex) =>
      prevIndex === 0 ? mediaItems.length - 1 : prevIndex - 1
    );
  };

  const goToMedia = (index: number) => {
    setCurrentMediaIndex(index);
  };

  const handleUpdateAppointment = async (
    appointmentId: string,
    time: string,
    status: string
  ) => {
    try {
      await instance.put(`/appointments/${appointmentId}`, {
        schedule_Time: time,
        status: status,
      });

      toast.success(
        `Appointment ${
          status === "Confirmed" ? "confirmed" : "updated"
        } successfully`
      );

      const response = await instance.get(`/appointments/property/${id}`);
      setAppointments(response.data?.appointment || []);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment. Please try again.");
      throw error;
    }
  };

  const handleSaveProperty = async (
    updatedData: Partial<Property>,
    _images?: File[],
    _imagesToDelete?: string[]
  ) => {
    try {
      const response = await instance.put(`/property/${id}`, updatedData);
      setProperty(response.data);
      toast.success("Property updated successfully!");
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Error updating property. Please try again.");
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <PageLoader message="Loading property details..." />;
  }

  if (!property) {
    return <div className="text-center py-10">Property not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Link
        to="/alllisting"
        className="inline-flex items-center text-lg text-yellow-600 hover:underline"
      >
        ← Back
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {property.property_name}
            {role === "superadmin" && (
              <span className="ml-3 px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-semibold align-middle">
                Super Admin
              </span>
            )}
          </h1>
          <div className="flex items-center mt-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                property.availability
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {property.availability ? "Available" : "Occupied"}
            </span>
            <span className="ml-2 text-gray-600">
              {property.city}, {property.state}
            </span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          {(role === "admin" || role === "superadmin") && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Edit Details
              </button>
              <button
                onClick={() => setShowAppointments(!showAppointments)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {showAppointments ? "Hide Appointments" : "View Appointments"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-64 md:h-96 w-full overflow-hidden">
              {mediaItems.length > 0 && (
                <>
                  {mediaItems[currentMediaIndex].type === "image" ? (
                    <img
                      src={mediaItems[currentMediaIndex].url}
                      alt={property.property_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="aspect-w-16 aspect-h-9 w-full h-full">
                      <iframe
                        className="w-full h-full"
                        src={mediaItems[currentMediaIndex].url}
                        title="Property video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  {mediaItems.length > 1 && (
                    <>
                      <button
                        onClick={prevMedia}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2  bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                        aria-label="Previous media"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={nextMedia}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2  bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                        aria-label="Next media"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {mediaItems.length > 1 && (
              <div className="p-4 grid grid-cols-4 gap-2">
                {mediaItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => goToMedia(index)}
                    className={`h-20 overflow-hidden rounded relative ${
                      currentMediaIndex === index ? "ring-2 ring-blue-500" : ""
                    }`}
                    aria-label={`Go to media ${index + 1}`}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`absolute inset-0 ${
                        currentMediaIndex === index
                          ? " bg-opacity-30"
                          : " hover:bg-opacity-20"
                      }`}
                    ></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Property Details</h2>
              <span className="text-2xl font-bold text-blue-600">
                ₹{parseInt(property.rate).toLocaleString()}
                {property.category !== "sale" && (
                  <span className="text-sm font-normal text-gray-500">
                    / month
                  </span>
                )}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  {property.category === "sale" ? "Sale Price" : "Rent"}
                </h3>
                <p className="mt-1 text-gray-800">
                  ₹{parseInt(property.rate).toLocaleString()}
                  {property.category !== "sale" && (
                    <span className="text-sm text-gray-500"> /month</span>
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Area</h3>
                <p className="mt-1 text-gray-800">
                  {property.area ? `${property.area} sq ft` : "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <p className="mt-1 text-gray-800">{property.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {property.category === "pg" ? (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Per Person Price
                      </h3>
                      <p className="mt-1 text-gray-800">
                        {property.perPersonPrice ? `₹${property.perPersonPrice}` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Total Capacity
                      </h3>
                      <p className="mt-1 text-gray-800">{property.totalCapacity || "N/A"}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Bedrooms
                      </h3>
                      <p className="mt-1 text-gray-800">{property.bed}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Bathrooms</h3>
                      <p className="mt-1 text-gray-800">{property.bathroom}</p>
                    </div>
                  </>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Furnishing</h3>
                  <p className="mt-1 text-gray-800">{property.furnishing_type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1 text-gray-800 capitalize">{property.category}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1 text-gray-800">{property.city}, {property.state}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Listed On</h3>
                <p className="mt-1 text-gray-800">{formatDate(property.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          {property.amenities?.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-2">
                {property.amenities.map((amenity: any, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-gray-800 capitalize">
                      {typeof amenity === "string" ? amenity : amenity?.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Section */}
          {property.services?.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Services</h2>
              <div className="grid grid-cols-2 gap-2">
                {property.services.map((service: any, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-gray-800 capitalize">
                      {typeof service === "string" ? service : service?.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {property && (
        <EditPropertyModal
          property={property}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProperty}
        />
      )}

      {showAppointments && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Scheduled Appointments</h2>
          {appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <AppointmentRow
                      key={appointment._id}
                      appointment={appointment}
                      onUpdate={handleUpdateAppointment}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No appointments scheduled yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SingleProperty;
