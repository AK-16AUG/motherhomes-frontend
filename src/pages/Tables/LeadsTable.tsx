import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  X,
  Mail,
  Phone,
  Archive,
  CheckCircle,
  User,
  Edit,
  Download,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instance from "../../utils/Axios/Axios";
import { saveAs } from "file-saver";

interface Property {
  _id: string;
  property_name: string;
  description: string;
  rate: string;
  category: string;
}

interface LeadFormData {
  contactInfo: {
    name?: string;
    phone?: string;
    email?: string;
  };
  status: "new" | "inquiry" | "contacted" | "converted" | "archived";
  notes?: string;
  source?: string;
  priority?: "low" | "medium" | "high";
  matchedProperties: string[];
  location?: string;
}

const API_BASE_URL = "/leads";
const PROPERTY_API_URL = "/property";

export default function LeadsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentLead, setCurrentLead] = useState<any>(null);
  const [formData, setFormData] = useState<LeadFormData>({
    contactInfo: {
      name: "",
      phone: "",
      email: "",
    },
    status: "new",
    notes: "",
    source: "website",
    priority: "medium",
    matchedProperties: [],
    location: "",
  });
  const [data, setData] = useState<any[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertySearch, setPropertySearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leadsResponse, propertiesResponse] = await Promise.all([
          instance.get(
            `${API_BASE_URL}?page=${currentPage}&limit=${entriesPerPage}`
          ),
          instance.get(PROPERTY_API_URL),
        ]);

        console.log("API Response:", leadsResponse.data); // For debugging
        console.log("Properties Response:", propertiesResponse.data); // For debugging

        // Update data extraction to match your API response format
        setData(leadsResponse.data.results || []);
        setTotalEntries(leadsResponse.data.total || 0);
        setTotalPages(
          Math.ceil(leadsResponse.data.total / entriesPerPage) || 0
        );

        // Extract the results array from the properties response
        setProperties(propertiesResponse.data.results || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
        console.error("Error fetching data:", err);
        toast.error("Failed to fetch leads data");
      }
    };

    fetchData();
  }, [currentPage, entriesPerPage]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("contactInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePropertySelect = (propertyId: string) => {
    setFormData((prev) => {
      const isSelected = prev.matchedProperties.includes(propertyId);
      return {
        ...prev,
        matchedProperties: isSelected
          ? prev.matchedProperties.filter((id) => id !== propertyId)
          : [...prev.matchedProperties, propertyId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const leadData = {
        ...formData,
        user_id: "current_user_id", // This should be replaced with actual user ID from auth context
      };

      await instance.post(API_BASE_URL, leadData);

      // Reset form
      setFormData({
        contactInfo: {
          name: "",
          phone: "",
          email: "",
        },
        status: "new",
        notes: "",
        source: "website",
        priority: "medium",
        matchedProperties: [],
      });

      // Close modal
      setShowModal(false);

      // Fetch fresh data
      const [leadsResponse] = await Promise.all([
        instance.get(
          `${API_BASE_URL}?page=${currentPage}&limit=${entriesPerPage}`
        ),
        instance.get(PROPERTY_API_URL),
      ]);

      setData(leadsResponse.data.results || []);
      setTotalEntries(leadsResponse.data.total || 0);
      setTotalPages(Math.ceil(leadsResponse.data.total / entriesPerPage) || 0);

      setLoading(false);
      toast.success("Lead created successfully!");
    } catch (err) {
      setLoading(false);
      console.error("Error creating lead:", err);
      toast.error(
        "Failed to create lead. Please check your input and try again."
      );
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLead) return;

    try {
      setLoading(true);
      await instance.put(`${API_BASE_URL}/${currentLead._id}`, formData);

      // Close modal
      setShowEditModal(false);

      // Fetch fresh data
      const response = await instance.get(
        `${API_BASE_URL}?page=${currentPage}&limit=${entriesPerPage}`
      );
      setData(response.data.results || []);
      setTotalEntries(response.data.total || 0);
      setTotalPages(Math.ceil(response.data.total / entriesPerPage) || 0);

      setLoading(false);
      toast.success("Lead updated successfully!");
    } catch (err) {
      setLoading(false);
      console.error("Error updating lead:", err);
      toast.error("Failed to update lead. Please try again.");
    }
  };

  const openEditModal = (lead: any) => {
    setCurrentLead(lead);
    setFormData({
      contactInfo: {
        name: lead.contactInfo?.name || "",
        phone: lead.contactInfo?.phone || "",
        email: lead.contactInfo?.email || "",
      },
      status: lead.status || "new",
      notes: lead.notes || "",
      source: lead.source || "website",
      priority: lead.priority || "medium",
      matchedProperties: lead.matchedProperties?.map((p: any) => p._id) || [],
    });
    setShowEditModal(true);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await instance.put(`${API_BASE_URL}/${leadId}`, { status: newStatus });
      setData(
        data.map((lead: any) =>
          lead._id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
      toast.success(`Lead status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating lead status:", err);
      toast.error("Failed to update lead status");
    }
  };

  const downloadCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Status",
      "Source",
      "Priority",
      "Properties",
      "Notes",
    ];

    const csvData = data.map((lead: any) => {
      return [
        `"${lead.contactInfo?.name || ""}"`,
        `"${lead.contactInfo?.email || ""}"`,
        `"${lead.contactInfo?.phone || ""}"`,
        `"${lead.status || ""}"`,
        `"${lead.source || ""}"`,
        `"${lead.priority || ""}"`,
        `"${lead.matchedProperties?.map((p: any) => p.property_name).join(", ") ||
        ""
        }"`,
        `"${lead.notes || ""}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvData].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "leads_export.csv");
  };

  // Replace the current search effect with this improved implementation
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        setIsFiltering(true);

        // Client-side filtering (more responsive)
        const filtered = data.filter((lead: any) => {
          const name = lead.contactInfo?.name?.toLowerCase() || "";
          const email = lead.contactInfo?.email?.toLowerCase() || "";
          const phone = lead.contactInfo?.phone?.toLowerCase() || "";
          const status = lead.status?.toLowerCase() || "";
          const source = lead.source?.toLowerCase() || "";
          const searchLower = searchTerm.toLowerCase();

          return (
            name.includes(searchLower) ||
            email.includes(searchLower) ||
            phone.includes(searchLower) ||
            status.includes(searchLower) ||
            source.includes(searchLower)
          );
        });

        setFilteredData(filtered);

        // You can also perform server-side filtering for more complex searches
        // by uncommenting this block
        /*
        const fetchFilteredData = async () => {
          try {
            setLoading(true);
            const response = await instance.get(
              `${API_BASE_URL}?page=${currentPage}&limit=${entriesPerPage}&search=${encodeURIComponent(
                searchTerm
              )}`
            );
            setFilteredData(response.data.results || []);
            setTotalEntries(response.data.total || 0);
            setTotalPages(Math.ceil(response.data.total / entriesPerPage) || 0);
            setLoading(false);
          } catch (err) {
            console.error("Error searching leads:", err);
            toast.error("Failed to search leads");
            setLoading(false);
          }
        };
        fetchFilteredData();
        */
      } else {
        setIsFiltering(false);
        setFilteredData([]);
      }
    }, 300); // Reduced debounce time for better responsiveness

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-gray-100">
          Loading leads...
        </div>
        <ToastContainer position="top-center" theme="colored" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
        <ToastContainer position="top-center" theme="colored" />
      </div>
    );
  }

  // Update the table rendering to use filtered data when searching
  // Modify the table body section inside your component:

  // When rendering the table data, use this logic:
  const displayData = isFiltering ? filteredData : data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-10">
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <span className="text-gray-400 dark:text-gray-500">Home</span> /{" "}
        <span>Leads Management</span>
      </div>
      <ToastContainer
        position="bottom-center"
        theme="colored"
        style={{ zIndex: 9999999 }}
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/20 p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Real Estate Leads
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors w-full sm:w-auto justify-center"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={16} />
              Add Lead
            </button>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0  bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Add New Lead
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        name="contactInfo.name"
                        value={formData.contactInfo.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactInfo.email"
                        value={formData.contactInfo.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="contactInfo.phone"
                        value={formData.contactInfo.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="new">New</option>
                        <option value="inquiry">Inquiry</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Source
                      </label>
                      <select
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="website">Website</option>
                        <option value="app">App</option>
                        <option value="referral">Referral</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g. New Delhi"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Matched Properties
                    </label>

                    {/* Selected Properties Chips */}
                    {formData.matchedProperties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {properties
                          .filter((p) => formData.matchedProperties.includes(p._id))
                          .map((p) => (
                            <span
                              key={p._id}
                              className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm"
                            >
                              <span className="truncate max-w-[150px]">{p.property_name}</span>
                              <button
                                type="button"
                                onClick={() => handlePropertySelect(p._id)}
                                className="hover:text-blue-600 dark:hover:text-blue-300"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Search and Selection List */}
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-700">
                      <div className="relative border-b border-gray-200 dark:border-gray-600">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search properties to add..."
                          className="w-full pl-9 pr-3 py-2 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none"
                          value={propertySearch}
                          onChange={(e) => setPropertySearch(e.target.value)}
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto p-1">
                        {properties
                          .filter(
                            (p) =>
                              !formData.matchedProperties.includes(p._id) &&
                              p.property_name.toLowerCase().includes(propertySearch.toLowerCase())
                          )
                          .slice(0, 6)
                          .map((property) => (
                            <div
                              key={property._id}
                              onClick={() => handlePropertySelect(property._id)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer flex justify-between items-center group transition-colors"
                            >
                              <span className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {property.property_name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ₹{property.rate}
                              </span>
                            </div>
                          ))}
                        {properties.filter(
                          (p) =>
                            !formData.matchedProperties.includes(p._id) &&
                            p.property_name.toLowerCase().includes(propertySearch.toLowerCase())
                        ).length === 0 && (
                            <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                              No matching properties found
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </form>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md"
                >
                  Save Lead
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && currentLead && (
          <div className="fixed inset-0  bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 mt-10">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Edit Lead
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        name="contactInfo.name"
                        value={formData.contactInfo.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactInfo.email"
                        value={formData.contactInfo.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="contactInfo.phone"
                        value={formData.contactInfo.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="new">New</option>
                        <option value="inquiry">Inquiry</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Source
                      </label>
                      <select
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="website">Website</option>
                        <option value="app">App</option>
                        <option value="referral">Referral</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Matched Properties
                    </label>

                    {/* Selected Properties Chips */}
                    {formData.matchedProperties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {properties
                          .filter((p) => formData.matchedProperties.includes(p._id))
                          .map((p) => (
                            <span
                              key={p._id}
                              className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm"
                            >
                              <span className="truncate max-w-[150px]">{p.property_name}</span>
                              <button
                                type="button"
                                onClick={() => handlePropertySelect(p._id)}
                                className="hover:text-blue-600 dark:hover:text-blue-300"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Search and Selection List */}
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-700">
                      <div className="relative border-b border-gray-200 dark:border-gray-600">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search properties to add..."
                          className="w-full pl-9 pr-3 py-2 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none"
                          value={propertySearch}
                          onChange={(e) => setPropertySearch(e.target.value)}
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto p-1">
                        {properties
                          .filter(
                            (p) =>
                              !formData.matchedProperties.includes(p._id) &&
                              p.property_name.toLowerCase().includes(propertySearch.toLowerCase())
                          )
                          .slice(0, 6)
                          .map((property) => (
                            <div
                              key={property._id}
                              onClick={() => handlePropertySelect(property._id)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer flex justify-between items-center group transition-colors"
                            >
                              <span className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {property.property_name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ₹{property.rate}
                              </span>
                            </div>
                          ))}
                        {properties.filter(
                          (p) =>
                            !formData.matchedProperties.includes(p._id) &&
                            p.property_name.toLowerCase().includes(propertySearch.toLowerCase())
                        ).length === 0 && (
                            <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                              No matching properties found
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </form>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleEditSubmit}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md"
                >
                  Update Lead
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label
              htmlFor="entries"
              className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
              Show
            </label>
            <select
              id="entries"
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
              entries
            </span>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute top-2 left-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, query or status..."
              className="pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-2 px-4 whitespace-nowrap">Contact Info</th>
                <th className="py-2 px-4 whitespace-nowrap">Interest</th>
                <th className="py-2 px-4 whitespace-nowrap">Location</th>
                <th className="py-2 px-4 whitespace-nowrap">Status</th>
                <th className="py-2 px-4 whitespace-nowrap">Source</th>
                <th className="py-2 px-4 whitespace-nowrap">Priority</th>
                <th className="py-2 px-4 whitespace-nowrap">Date</th>
                <th className="py-2 px-4 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayData.length > 0 ? (
                displayData.map((lead: any) => (
                  <tr
                    key={lead._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-2 px-4">
                      <div className="flex flex-col gap-1">
                        {lead.contactInfo?.name && (
                          <div className="flex items-center gap-1">
                            <User
                              size={14}
                              className="text-gray-500 dark:text-gray-400"
                            />
                            <span className="text-gray-900 dark:text-gray-100">
                              {lead.contactInfo.name}
                            </span>
                          </div>
                        )}
                        {lead.contactInfo?.email && (
                          <div className="flex items-center gap-1">
                            <Mail
                              size={14}
                              className="text-gray-500 dark:text-gray-400"
                            />
                            <span className="text-gray-900 dark:text-gray-100">
                              {lead.contactInfo.email}
                            </span>
                          </div>
                        )}
                        {lead.contactInfo?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone
                              size={14}
                              className="text-gray-500 dark:text-gray-400"
                            />
                            <span className="text-gray-900 dark:text-gray-100">
                              {lead.contactInfo.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="text-sm">
                        {lead.matchedProperties &&
                          lead.matchedProperties.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {lead.matchedProperties.map((prop: any) => (
                              <div
                                key={prop._id || prop}
                                className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded p-1.5"
                              >
                                <div className="font-medium text-blue-800 dark:text-blue-200 text-xs">
                                  {prop.property_name || "Property"}
                                </div>
                                {(prop.address || prop.flat_no) && (
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                                    {prop.flat_no ? `Flat ${prop.flat_no}, ` : ""}
                                    {prop.address}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : lead.searchQuery ? (
                          <span className="text-gray-600 dark:text-gray-400 italic text-xs">
                            "{lead.searchQuery}"
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">No specific interest</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm">
                      {lead.location || "-"}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${lead.status === "new"
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                          : lead.status === "inquiry"
                            ? "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200"
                            : lead.status === "contacted"
                              ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200"
                              : lead.status === "converted"
                                ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap capitalize text-gray-900 dark:text-gray-100">
                      {lead.source}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${lead.priority === "high"
                          ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200"
                          : lead.priority === "medium"
                            ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200"
                            : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                          }`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {lead.timestamp ? new Date(lead.timestamp).toLocaleDateString() : lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-2 px-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => openEditModal(lead)}
                        className="flex items-center gap-1 text-sm px-2 py-1 rounded whitespace-nowrap bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition-colors"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => updateLeadStatus(lead._id, "contacted")}
                        className={`flex items-center gap-1 text-sm px-2 py-1 rounded whitespace-nowrap transition-colors ${lead.status === "contacted"
                          ? "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                          }`}
                        disabled={lead.status === "contacted"}
                      >
                        <Phone size={14} />
                        <span>Contact</span>
                      </button>
                      <button
                        onClick={() => updateLeadStatus(lead._id, "converted")}
                        className={`flex items-center gap-1 text-sm px-2 py-1 rounded whitespace-nowrap transition-colors ${lead.status === "converted"
                          ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                          }`}
                        disabled={lead.status === "converted"}
                      >
                        <CheckCircle size={14} />
                        <span>Convert</span>
                      </button>
                      <button
                        onClick={() => updateLeadStatus(lead._id, "archived")}
                        className={`flex items-center gap-1 text-sm px-2 py-1 rounded whitespace-nowrap transition-colors ${lead.status === "archived"
                          ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                          }`}
                        disabled={lead.status === "archived"}
                      >
                        <Archive size={14} />
                        <span>Archive</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    {isFiltering ? "No matching leads found" : "No leads found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Update pagination info to show filtered count when filtering */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400 gap-4">
          <p className="whitespace-nowrap">
            {isFiltering
              ? `Found ${filteredData.length} matching results`
              : `Showing ${totalEntries === 0
                ? 0
                : (currentPage - 1) * entriesPerPage + 1
              } to ${Math.min(
                currentPage * entriesPerPage,
                totalEntries
              )} of ${totalEntries} entries`}
          </p>

          {/* Hide pagination when filtering */}
          {!isFiltering && (
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft size={16} />
              </button>

              {/* First page */}
              {currentPage > 2 && (
                <>
                  <button
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setCurrentPage(1)}
                    disabled={loading}
                  >
                    1
                  </button>
                  {currentPage > 3 && (
                    <span className="text-gray-500 dark:text-gray-400">
                      ...
                    </span>
                  )}
                </>
              )}

              {/* Current page and adjacent pages */}
              {(() => {
                const startPage = Math.max(1, currentPage - 1);
                const endPage = Math.min(totalPages, currentPage + 1);
                const pages = [];

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      className={`px-3 py-1 rounded border border-gray-300 dark:border-gray-600 transition-colors ${currentPage === i
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
                        }`}
                      onClick={() => setCurrentPage(i)}
                      disabled={loading}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}

              {/* Last page */}
              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <span className="text-gray-500 dark:text-gray-400">
                      ...
                    </span>
                  )}
                  <button
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={loading}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                className="p-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages || loading}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
