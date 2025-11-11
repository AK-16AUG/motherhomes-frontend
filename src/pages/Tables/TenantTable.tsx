import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  X,
  Eye,
  Trash,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instance from "../../utils/Axios/Axios";
import { Link } from "react-router";

interface Property {
  _id: string;
  property_name: string;
  description: string;
  rate: string;
  category: string;
  amenties: {
    _id: string;
    name: string;
    __v: number;
  }[];
  services: {
    _id: string;
    name: string;
    __v: number;
  }[];
  images: string[];
  videos: string[];
  furnishing_type: string;
  city: string;
  state: string;
}

interface Tenant {
  _id: string;
  name?: string; // For Normal properties
  tenantDetails?: { name: string; email: string; user_id?: string }[]; // For PG properties
  users: {
    _id: string;
    User_Name: string;
    email: string;
  }[];
  property_id: {
    _id: string;
    property_name: string;
    city: string;
    state: string;
  };
  flatNo: string;
  society: string;
  members: number;
  startDate: string;
  rent: string;
  property_type: "Pg" | "Normal";
  Payments: {
    user_id: string;
    dateOfPayment: string;
    modeOfPayment: "cash" | "online";
  }[];
  createdAt: string;
}

interface TenantFormData {
  name: string; // For Normal properties
  tenantDetails: { name: string; email: string }[]; // For PG properties
  users: string[]; // Legacy support
  property_id: string;
  flatNo: string;
  society: string;
  members: number;
  startDate: string;
  rent: string;
  property_type: "Pg" | "Normal";
}

const API_BASE_URL = "/tenant";
const PROPERTY_API_URL = "/property";

export default function DataTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<TenantFormData>({
    name: "",
    tenantDetails: [],
    users: [],
    property_id: "",
    flatNo: "",
    society: "",
    members: 1,
    startDate: "",
    rent: "",
    property_type: "Normal",
  });
  const [data, setData] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantsResponse, propertiesResponse] = await Promise.all([
          instance.get(API_BASE_URL),
          instance.get(PROPERTY_API_URL),
        ]);

        console.log("Properties API Response:", propertiesResponse.data);

        setData(tenantsResponse.data?.data || []);

        // Extract properties correctly from the response structure
        const propertiesArray = propertiesResponse.data?.results || [];
        console.log("Properties array:", propertiesArray);
        console.log("Properties count:", propertiesArray.length);
        console.log(
          "Properties categories:",
          propertiesArray.map((p:any) => p.category)
        );
        setProperties(propertiesArray);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
        console.error("Error fetching data:", err);
        toast.error("Failed to fetch tenant data");
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((tenant) => {
    if (!tenant) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (tenant?.name?.toLowerCase() || "").includes(searchLower) ||
      (tenant.flatNo?.toLowerCase() || "").includes(searchLower) ||
      (tenant.society?.toLowerCase() || "").includes(searchLower) ||
      tenant.users.some((user) =>
        user.email.toLowerCase().includes(searchLower)
      ) ||
      (tenant.tenantDetails?.some((detail) => 
        detail.name.toLowerCase().includes(searchLower) ||
        detail.email.toLowerCase().includes(searchLower)
      ) || false)
    );
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const memberCount = name === "members" ? parseInt(value) || 0 : formData.members;
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === "members" ? memberCount : value,
      users: name === "members" && prev.property_type === "Normal" 
        ? Array(memberCount).fill("") 
        : prev.users,
      tenantDetails: name === "members" && prev.property_type === "Pg"
        ? Array(memberCount).fill({ name: "", email: "" })
        : name === "property_type" && value === "Pg"
        ? Array(prev.members).fill({ name: "", email: "" })
        : name === "property_type" && value === "Normal"
        ? []
        : prev.tenantDetails,
    }));
  };

  const handleUserEmailChange = (index: number, value: string) => {
    const updatedUsers = [...formData.users];
    updatedUsers[index] = value;
    setFormData((prev) => ({
      ...prev,
      users: updatedUsers,
    }));
  };

  const handleTenantDetailChange = (index: number, field: 'name' | 'email', value: string) => {
    const updatedDetails = [...formData.tenantDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      tenantDetails: updatedDetails,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantData: any = {
        property_id: formData.property_id,
        flatNo: formData.flatNo,
        society: formData.society,
        members: formData.members,
        startDate: formData.startDate,
        rent: formData.rent,
        property_type: formData.property_type,
        Payments: [],
      };

      if (formData.property_type === "Normal") {
        tenantData.name = formData.name;
        tenantData.users = formData.users;
      } else if (formData.property_type === "Pg") {
        tenantData.tenantDetails = formData.tenantDetails;
      }

      const response = await instance.post(API_BASE_URL, tenantData);
      setData([...data, response.data]);
      setFormData({
        name: "",
        tenantDetails: [],
        users: [],
        property_id: "",
        flatNo: "",
        society: "",
        members: 1,
        startDate: "",
        rent: "",
        property_type: "Normal",
      });
      setShowModal(false);
      toast.success("Tenant created successfully!");
    } catch (err) {
      console.error("Error creating tenant:", err);
      toast.error(
        "Failed to create tenant. Please check your input and try again."
      );
    }
  };

  // ---- DELETE TENANT FUNCTION ----
  const handleDelete = async (tenantId: string) => {
    if (!window.confirm("Are you sure you want to delete this tenant?")) return;
    try {
      await instance.delete(`${API_BASE_URL}/${tenantId}`);
      setData((prev) => prev.filter((item) => item._id !== tenantId));
      toast.success("Tenant deleted successfully!");
    } catch {
      toast.error("Failed to delete tenant. Please try again.");
    }
  };
  // --------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10 flex items-center justify-center">
        <div className="text-lg text-gray-800 dark:text-gray-100">
          Loading tenants...
        </div>
        <ToastContainer position="top-center" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
        <ToastContainer position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-10  bg-gray-50 dark:bg-gray-900">
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <span className="text-gray-500 dark:text-gray-400">Home</span> /{" "}
        <span className="font-medium text-gray-800 dark:text-gray-200">
          Tenant Management
        </span>
      </div>
      <ToastContainer position="bottom-center" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 overflow-hidden border border-gray-200 dark:border-gray-700 ">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4  gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Occupied Flat Details
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors w-full sm:w-auto justify-center shadow-md"
          >
            <Plus size={16} />
            Add Tenant
          </button>
        </div>

        {/* Add Tenant Modal */}
        {showModal && (
          <div className="fixed inset-0  bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm mt-16">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-700 animate-fadeIn">
              <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                    <Plus
                      size={18}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  Add New Tenant
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start">
                      <span className="mr-2 mt-0.5">ℹ️</span>
                      {formData.property_type === "Pg" 
                        ? "For PG properties, provide individual name and email for each tenant."
                        : "For Normal properties, provide a universal tenant name and member emails."
                      } All fields marked with{" "}
                      <span className="text-red-500">*</span> are required.
                    </p>
                  </div>

                  {/* Form sections with improved styling */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Tenant Name - Only for Normal properties */}
                    {formData.property_type === "Normal" && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tenant Name (Agreement signee){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                          placeholder="Enter tenant name"
                        />
                      </div>
                    )}

                    {/* Property Type - IMPROVED */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Property Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="property_type"
                          value={formData.property_type}
                          onChange={handleInputChange}
                          className="appearance-none w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-8"
                          required
                        >
                          <option value="Normal">Normal</option>
                          <option value="Pg">PG</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg
                            className="h-4 w-4 text-gray-500 dark:text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Property - IMPROVED */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Property <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="property_id"
                          value={formData.property_id}
                          onChange={handleInputChange}
                          className="appearance-none w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-8"
                          required
                        >
                          <option value="">Select Property</option>
                          {Array.isArray(properties) &&
                          properties.length > 0 ? (
                            properties
                              .filter((property) => property && property._id) // Basic validation
                              .map((property) => (
                                <option key={property._id} value={property._id}>
                                  {property.property_name} - {property.city}
                                  {property.category === "rent"
                                    ? ` (₹${property.rate}/month)`
                                    : property.category === "sale"
                                    ? ` (₹${property.rate})`
                                    : ` (${property.category})`}
                                </option>
                              ))
                          ) : (
                            <option value="">No properties available</option>
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg
                            className="h-4 w-4 text-gray-500 dark:text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Flat No. */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Flat No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="flatNo"
                        value={formData.flatNo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                        placeholder="Enter flat number"
                      />
                    </div>

                    {/* Society */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Society <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="society"
                        value={formData.society}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                        placeholder="Enter society name"
                      />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>

                    {/* Rent Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rent Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rent"
                        value={formData.rent}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                        placeholder="Enter rent amount"
                      />
                    </div>
                  </div>

                  {/* No. of Members with Members Email section */}
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        No. of Members <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="members"
                        value={formData.members}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                        min="1"
                      />
                    </div>

                    {/* Members Details - Different for PG vs Normal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {formData.property_type === "Pg" ? "Tenant Details" : "Members Email"} <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto bg-gray-50 dark:bg-gray-750 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        {formData.property_type === "Pg" ? (
                          // PG: Name and Email for each tenant
                          Array.from({ length: formData.members }).map((_, index) => (
                            <div key={index} className="space-y-2 p-3 bg-white dark:bg-gray-700 rounded-lg border">
                              <div className="flex items-center mb-2">
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-xs font-medium">
                                  Tenant {index + 1}
                                </span>
                              </div>
                              <input
                                type="text"
                                value={formData.tenantDetails[index]?.name || ""}
                                onChange={(e) => handleTenantDetailChange(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                required
                                placeholder={`Name for tenant ${index + 1}`}
                              />
                              <input
                                type="email"
                                value={formData.tenantDetails[index]?.email || ""}
                                onChange={(e) => handleTenantDetailChange(index, 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                required
                                placeholder={`Email for tenant ${index + 1}`}
                              />
                            </div>
                          ))
                        ) : (
                          // Normal: Just emails
                          Array.from({ length: formData.members }).map((_, index) => (
                            <div key={index} className="flex items-center">
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-xs font-medium mr-2">
                                {index + 1}
                              </span>
                              <input
                                type="email"
                                value={formData.users[index] || ""}
                                onChange={(e) => handleUserEmailChange(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                required
                                placeholder={`Email for member ${index + 1}`}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md font-medium flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Save Tenant
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label
              htmlFor="entries"
              className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
            >
              Show
            </label>
            <select
              id="entries"
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              entries
            </span>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute top-2 left-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, flat or society..."
              className="pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="py-2 px-4 whitespace-nowrap">Tenant</th>
                <th className="py-2 px-4 whitespace-nowrap">Property Type</th>
                <th className="py-2 px-4 whitespace-nowrap">Property</th>
                <th className="py-2 px-4 whitespace-nowrap">Flat No.</th>
                <th className="py-2 px-4 whitespace-nowrap">Society</th>
                <th className="py-2 px-4 whitespace-nowrap">Members</th>
                <th className="py-2 px-4 whitespace-nowrap">Start Date</th>
                <th className="py-2 px-4 whitespace-nowrap">Rent</th>
                <th className="py-2 px-4 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((tenant) => (
                  <tr
                    key={tenant._id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-2 px-4 flex items-center gap-2 whitespace-nowrap">
                      <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                        {tenant.property_type === "Normal" 
                          ? tenant?.name 
                          : tenant.tenantDetails?.map(t => t.name).join(", ") || "Multiple Tenants"
                        }
                      </span>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {tenant?.property_type}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap truncate max-w-[150px] text-gray-700 dark:text-gray-300">
                      {tenant.property_id?.property_name || "N/A"}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {tenant?.flatNo}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap truncate max-w-[120px] text-gray-700 dark:text-gray-300">
                      {tenant?.society}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {tenant?.members}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {new Date(tenant.startDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {tenant.rent}
                    </td>
                    <td className="py-2 px-4 flex gap-2 flex-wrap">
                      <Link
                        to={`/tenant/${tenant?._id}`}
                        className="flex items-center gap-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 whitespace-nowrap"
                        title="View Details"
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">View</span>
                      </Link>
                      {/* --- Delete Button --- */}
                      <button
                        onClick={() => handleDelete(tenant._id)}
                        className="flex items-center gap-1 text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 whitespace-nowrap"
                        title="Delete Tenant"
                      >
                        <Trash size={14} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-4 text-center text-gray-800 dark:text-gray-200"
                  >
                    No tenants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400 gap-4">
          <p className="whitespace-nowrap">
            Showing{" "}
            {filteredData.length === 0
              ? 0
              : (currentPage - 1) * entriesPerPage + 1}{" "}
            to {Math.min(currentPage * entriesPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft
                size={16}
                className="text-gray-800 dark:text-gray-200"
              />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${
                  currentPage === i + 1 ? "bg-gray-100 dark:bg-gray-700" : ""
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight
                size={16}
                className="text-gray-800 dark:text-gray-200"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
