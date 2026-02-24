import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useEffect, useState, useMemo } from "react";
import instance from "../../../utils/Axios/Axios";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2, Upload, Download, FileText, ChevronUp, ChevronDown, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

type LoadingState = "idle" | "loading" | "success" | "error";
type SortKey = "property_name" | "availability" | "flat_no" | "createdAt" | null;
type SortDirection = "asc" | "desc";

interface Property {
  _id: string;
  property_name: string;
  description: string;
  rate: string;
  category: "rent" | "sale" | "pg";
  city: string;
  state: string;
  images: string[];
  furnishing_type: "Semi-furnished" | "Fully furnished" | "Raw";
  bed: number;
  bathroom: number;
  availability: boolean;
  status?: "Available" | "Unavailable" | "Occupied";
  createdAt: string;
  totalCapacity?: string;
  flat_no?: string;
}

const FALLBACK_PROPERTY_IMAGE = "https://via.placeholder.com/120x80?text=No+Image";

const CATEGORY_BADGE_MAP = {
  rent: { color: "blue", label: "For Rent" },
  sale: { color: "yellow", label: "For Sale" },
  pg: { color: "green", label: "PG" },
} as const;

const FURNISHING_BADGE_MAP = {
  "Semi-furnished": { color: "purple", label: "Semi-furnished" },
  "Fully furnished": { color: "green", label: "Fully furnished" },
  Raw: { color: "gray", label: "Raw" },
} as const;

export default function ListingTable() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [state, setState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<string | null>(null);
  const [availabilityEditValue, setAvailabilityEditValue] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterPropertyName, setFilterPropertyName] = useState("");
  const [filterFlatNo, setFilterFlatNo] = useState("");
  const [filterAvailability, setFilterAvailability] = useState<"all" | "available" | "occupied">("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const navigate = useNavigate();

  const hasActiveFilters =
    filterSearch !== "" ||
    filterPropertyName !== "" ||
    filterFlatNo !== "" ||
    filterAvailability !== "all" ||
    filterDateFrom !== "" ||
    filterDateTo !== "";

  const clearFilters = () => {
    setFilterSearch("");
    setFilterPropertyName("");
    setFilterFlatNo("");
    setFilterAvailability("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSortConfig(null);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Text search: match property_name or flat_no
      if (filterSearch) {
        const q = filterSearch.toLowerCase();
        const nameMatch = p.property_name?.toLowerCase().includes(q);
        const flatMatch = p.flat_no?.toLowerCase().includes(q);
        if (!nameMatch && !flatMatch) return false;
      }
      if (filterPropertyName) {
        const q = filterPropertyName.toLowerCase();
        if (!p.property_name?.toLowerCase().includes(q)) return false;
      }
      if (filterFlatNo) {
        const q = filterFlatNo.toLowerCase();
        if (!p.flat_no?.toLowerCase().includes(q)) return false;
      }
      // Availability filter
      if (filterAvailability === "available" && !p.availability) return false;
      if (filterAvailability === "occupied" && p.availability) return false;
      // Date range filter
      if (filterDateFrom) {
        const from = new Date(filterDateFrom);
        const created = new Date(p.createdAt);
        if (created < from) return false;
      }
      if (filterDateTo) {
        const to = new Date(filterDateTo);
        to.setHours(23, 59, 59, 999);
        const created = new Date(p.createdAt);
        if (created > to) return false;
      }
      return true;
    });
  }, [
    properties,
    filterSearch,
    filterPropertyName,
    filterFlatNo,
    filterAvailability,
    filterDateFrom,
    filterDateTo,
  ]);

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProperties = useMemo(() => {
    let sortableItems = [...filteredProperties];
    if (sortConfig !== null && sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key as keyof Property;

        if (key === "createdAt") {
          const dateA = new Date(a[key] as string).getTime();
          const dateB = new Date(b[key] as string).getTime();
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        if (key === "availability") {
          return sortConfig.direction === "asc"
            ? (a.availability === b.availability ? 0 : a.availability ? -1 : 1)
            : (a.availability === b.availability ? 0 : a.availability ? 1 : -1);
        }

        if (key === "flat_no") {
          const aVal = a.flat_no || "";
          const bVal = b.flat_no || "";
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' })
            : bVal.localeCompare(aVal, undefined, { numeric: true, sensitivity: 'base' });
        }

        const valA = String(a[key] || "").toLowerCase();
        const valB = String(b[key] || "").toLowerCase();

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProperties, sortConfig]);

  const renderSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronDown className="w-4 h-4 text-gray-400 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  const handleSortSelectChange = (value: string) => {
    switch (value) {
      case "date_desc":
        setSortConfig({ key: "createdAt", direction: "desc" });
        break;
      case "date_asc":
        setSortConfig({ key: "createdAt", direction: "asc" });
        break;
      case "name_asc":
        setSortConfig({ key: "property_name", direction: "asc" });
        break;
      case "name_desc":
        setSortConfig({ key: "property_name", direction: "desc" });
        break;
      case "flat_asc":
        setSortConfig({ key: "flat_no", direction: "asc" });
        break;
      case "flat_desc":
        setSortConfig({ key: "flat_no", direction: "desc" });
        break;
      case "availability_asc":
        setSortConfig({ key: "availability", direction: "asc" });
        break;
      case "availability_desc":
        setSortConfig({ key: "availability", direction: "desc" });
        break;
      default:
        setSortConfig(null);
        break;
    }
  };

  const fetchProperties = async () => {
    try {
      setState("loading");
      const response = await instance.get(`/property?limit=1000`);

      if (Array.isArray(response.data)) {
        setProperties(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setProperties(response.data.results);
      } else {
        setProperties([]);
      }

      setState("success");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load properties. Please try again later."
      );
      setState("error");
    }
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setState("loading");
        setError(null);
        const response = await instance.get(`/property?limit=1000`);

        console.log("API Response:", response.data);

        if (Array.isArray(response.data)) {
          setProperties(response.data);
        } else if (response.data && Array.isArray(response.data.results)) {
          setProperties(response.data.results);
        } else {
          console.error("Expected array from API but got:", response.data);
          setProperties([]);
        }

        setState("success");
      } catch (err: any) {
        console.error("Error fetching properties:", err);

        let errorMessage = "Failed to load properties. Please try again later.";
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data?.message || err.message;
          console.error(`Backend returned status ${status}:`, message);

          if (status === 401) {
            errorMessage = "Session expired. Redirecting to login...";
            toast.error(errorMessage);
            setTimeout(() => navigate("/signin"), 2000);
          } else if (status === 403) {
            errorMessage = "Access denied. You do not have permission to view properties.";
          } else {
            errorMessage = `Server error (${status}): ${message}`;
          }
        } else if (err.request) {
          errorMessage = "No response from server. Please check your connection.";
        }

        setError(errorMessage);
        setState("error");
      }
    };

    fetchProperties();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: string) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const getCategoryBadge = (category: Property["category"]) => {
    const badgeConfig = CATEGORY_BADGE_MAP[category] || {
      color: "gray",
      label: "Unknown",
    };
    return <Badge size="sm">{badgeConfig.label}</Badge>;
  };

  const getFurnishingBadge = (type: Property["furnishing_type"]) => {
    const badgeConfig = FURNISHING_BADGE_MAP[type] || {
      color: "gray",
      label: "Unknown",
    };
    return <Badge size="sm">{badgeConfig.label}</Badge>;
  };

  const getAvailabilityBadge = (available: boolean) => {
    return available ? (
      <Badge size="sm">Available</Badge>
    ) : (
      <Badge size="sm">Occupied</Badge>
    );
  };

  const handleStatusUpdate = async (propertyId: string, newAvailability: boolean) => {
    try {
      await instance.put(`/property/${propertyId}`, { availability: newAvailability });
      setProperties((prev) =>
        prev.map((property) =>
          property._id === propertyId
            ? { ...property, availability: newAvailability }
            : property
        )
      );
      toast.success("Availability updated");
    } catch (err: any) {
      console.error("Error updating availability:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        toast.error(err.response?.data?.message || "Failed to update availability");
      }
    }
  };

  const downloadExcel = () => {
    const exportData = properties.map((p) => ({
      Name: p.property_name,
      Description: p.description,
      Category: p.category,
      Rate: p.rate,
      City: p.city,
      State: p.state,
      Furnishing: p.furnishing_type,
      Beds: p.bed,
      Bathrooms: p.bathroom,
      Availability: p.availability ? "Available" : "Occupied",
      "Flat No": p.flat_no || "",
      "Added On": new Date(p.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Properties");
    XLSX.writeFile(wb, "properties_export.xlsx");
  };

  const downloadSampleTemplate = () => {
    const sampleData = [{
      property_name: "Sunrise Apartment",
      description: "2BHK apartment with parking",
      category: "rent",
      rate: "15000",
      city: "Mumbai",
      state: "Maharashtra",
      furnishing_type: "Semi-furnished",
      bed: 2,
      bathroom: 2,
      flat_no: "A-101",
      totalCapacity: "",
    }];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Properties Template");
    XLSX.writeFile(wb, "properties_sample_template.xlsx");
    toast.info("Sample template downloaded!");
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    try {
      setIsUploading(true);
      const loadingToast = toast.info(
        `Uploading ${files.length} file${files.length > 1 ? "s" : ""}...`,
        { autoClose: false }
      );

      const response = await instance.post("/property/bulk-upload", formData);

      toast.dismiss(loadingToast);

      const { summary } = response.data;
      toast.success(
        `Upload completed! ${summary.success} properties added, ${summary.skipped} duplicates skipped, ${summary.failed} failed.`
      );
      const errorItems: any[] = response.data?.errors || [];
      if (errorItems.length > 0) {
        const preview = errorItems
          .slice(0, 3)
          .map((item) => `Row ${item.rowNumber}: ${item.reason || item.error}. Fix: ${item.fix || "Review row values."}`)
          .join(" | ");
        toast.warning(
          `Some rows failed. ${preview}${errorItems.length > 3 ? ` | +${errorItems.length - 3} more` : ""}`,
          { autoClose: 9000 }
        );
      }

      // Refresh the list
      fetchProperties();
    } catch (err: any) {
      console.error("Bulk upload failed:", err);
      toast.dismiss(); // Dismiss the loading toast

      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        const reason = err.response?.data?.message || "Bulk upload failed";
        const firstError = err.response?.data?.errors?.[0];
        const fix = firstError?.fix || "Use the sample template format and keep numeric/date fields valid.";
        toast.error(`${reason}. Fix: ${fix}`);
      }
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this property? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await instance.delete(`/property/${propertyId}`);
      setProperties((prev) =>
        prev.map((property) =>
          property._id === propertyId ? { ...property, status: "Available" as "Available" | "Unavailable" | "Occupied" } : property
        ).filter((property) => property._id !== propertyId)
      );
      toast.success("Property deleted successfully");
    } catch (err: any) {
      console.error("Error deleting property:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        toast.error(err.response?.data?.message || "Failed to delete property");
      }
    }
  };

  if (state === "loading") {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(11)].map((_, i) => (
                  <TableCell isHeader key={i}>
                    <div className="h-6 w-24 bg-gray-100 rounded" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {[...Array(11)].map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-6 w-full bg-gray-100 rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>{error || "An unknown error occurred"}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-2">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>No Properties Found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-2 flex-wrap">
        <button
          onClick={downloadSampleTemplate}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
          title="Download sample Excel template"
        >
          <FileText size={16} />
          Sample Template
        </button>
        <Link
          to="/add-multi-listing"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 mx-2 shadow-sm"
          title="Add Multiple Listings at Once"
        >
          Add Multiple Listings
        </Link>
        <label className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
          ${isUploading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}
        `}>
          <Upload size={18} />
          {isUploading ? "Uploading..." : "Bulk Upload (Excel)"}
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            multiple
            className="hidden"
            onChange={handleBulkUpload}
            disabled={isUploading}
          />
        </label>
        <button
          onClick={downloadExcel}
          disabled={properties.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 disabled:opacity-50"
        >
          <Download size={16} />
          Export Excel
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Search by Property Name / Flat No */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Property name or flat no..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Availability Filter */}
        <div className="min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Availability</label>
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value as "all" | "available" | "occupied")}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 cursor-pointer"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>

        {/* Property Name Filter */}
        <div className="min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Property Name</label>
          <input
            type="text"
            placeholder="Filter by property name"
            value={filterPropertyName}
            onChange={(e) => setFilterPropertyName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
        </div>

        {/* Flat No Filter */}
        <div className="min-w-[170px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Flat No</label>
          <input
            type="text"
            placeholder="Filter by flat number"
            value={filterFlatNo}
            onChange={(e) => setFilterFlatNo(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
        </div>

        {/* Date From */}
        <div className="min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
        </div>

        {/* Sort Select */}
        <div className="min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
          <select
            value={
              !sortConfig
                ? "default"
                : sortConfig.key === "createdAt" && sortConfig.direction === "desc"
                  ? "date_desc"
                  : sortConfig.key === "createdAt" && sortConfig.direction === "asc"
                    ? "date_asc"
                    : sortConfig.key === "property_name" && sortConfig.direction === "asc"
                      ? "name_asc"
                      : sortConfig.key === "property_name" && sortConfig.direction === "desc"
                        ? "name_desc"
                        : sortConfig.key === "flat_no" && sortConfig.direction === "asc"
                          ? "flat_asc"
                          : sortConfig.key === "flat_no" && sortConfig.direction === "desc"
                            ? "flat_desc"
                            : sortConfig.key === "availability" && sortConfig.direction === "asc"
                              ? "availability_asc"
                              : "availability_desc"
            }
            onChange={(e) => handleSortSelectChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 cursor-pointer"
          >
            <option value="default">Default</option>
            <option value="date_desc">Date: Newest first</option>
            <option value="date_asc">Date: Oldest first</option>
            <option value="name_asc">Property Name: A-Z</option>
            <option value="name_desc">Property Name: Z-A</option>
            <option value="flat_asc">Flat No: Ascending</option>
            <option value="flat_desc">Flat No: Descending</option>
            <option value="availability_asc">Availability: Available first</option>
            <option value="availability_desc">Availability: Occupied first</option>
          </select>
        </div>

        {/* Date To */}
        <div className="min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}

        {/* Result count */}
        <div className="text-xs text-gray-400 self-end pb-1">
          {filteredProperties.length} of {properties.length} results
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table
            aria-label="Properties list"
            className="text-gray-900 min-w-[900px]"
          >
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="text-left px-5 py-3 text-gray-900 font-medium"
                >
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 select-none group w-fit pr-2"
                    onClick={() => handleSort("property_name")}
                  >
                    Property
                    {renderSortIcon("property_name")}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="text-left px-5 py-3 text-gray-900 font-medium"
                >
                  Image
                </TableCell>
                <TableCell
                  isHeader
                  className="text-left px-5 py-3 text-gray-900 font-medium"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="text-left px-5 py-3 text-gray-900 font-medium"
                >
                  Rate
                </TableCell>
                <TableCell
                  isHeader
                  className="text-left px-5 py-3 text-gray-900 font-medium"
                >
                  Location
                </TableCell>
                <TableCell
                  isHeader
                  className="text-left px-5 py-3 text-gray-900 font-medium"
                >
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 select-none group w-fit pr-2"
                    onClick={() => handleSort("flat_no")}
                  >
                    Flat No
                    {renderSortIcon("flat_no")}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="text-left px-5 py-3 text-gray-900 font-medium"
                >
                  Details
                </TableCell>
                <TableCell
                  isHeader
                  className="text-left px-5 py-3 text-gray-900 font-medium"
                >
                  Furnishing
                </TableCell>
                <TableCell
                  isHeader
                  className="text-left px-5 py-3 text-gray-900 font-medium"
                >
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 select-none group w-fit pr-2"
                    onClick={() => handleSort("availability")}
                  >
                    Availability
                    {renderSortIcon("availability")}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="text-left px-5 py-3 text-gray-900 font-medium"
                >
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 select-none group w-fit pr-2"
                    onClick={() => handleSort("createdAt")}
                  >
                    Added On
                    {renderSortIcon("createdAt")}
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="text-left px-5 py-3 text-gray-900 font-medium"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.isArray(sortedProperties) ? (
                sortedProperties.map((property) => (
                  <TableRow
                    key={property._id}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="text-left px-5 py-3 font-medium text-gray-900">
                      <Link
                        to={`/listing/${property._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {property.property_name}
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {property.description}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell className="text-left px-5 py-3 text-gray-900">
                      <img
                        src={property.images?.[0] || FALLBACK_PROPERTY_IMAGE}
                        alt={property.property_name}
                        className="w-20 h-14 rounded-md object-cover border border-gray-200"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== FALLBACK_PROPERTY_IMAGE) {
                            target.src = FALLBACK_PROPERTY_IMAGE;
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-left px-5 py-3 text-gray-900">
                      {getCategoryBadge(property.category)}
                    </TableCell>
                    <TableCell className="text-left px-5 py-3 font-medium text-gray-900">
                      {formatCurrency(property.rate)}
                    </TableCell>
                    <TableCell className="text-left px-5 py-3 text-gray-900">
                      <div>
                        <span className="text-gray-900">
                          {property.city}
                        </span>
                        <span className="block text-gray-500">
                          {property.state}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-left px-5 py-3 text-gray-900">
                      <span className="text-sm text-gray-900">
                        {property.flat_no || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-left px-5 py-3 text-gray-900">
                      <div className="flex gap-2">
                        {property.category === "pg" ? (
                          <span className="text-sm text-gray-900">
                            {property.totalCapacity || "N/A"} Capacity
                          </span>
                        ) : (
                          <>
                            <span className="text-sm text-gray-900">
                              {property.bed} Beds
                            </span>
                            <span className="text-sm text-gray-900">
                              |
                            </span>
                            <span className="text-sm text-gray-900">
                              {property.bathroom} Baths
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-left px-5 py-3 text-gray-900">
                      {getFurnishingBadge(property.furnishing_type)}
                    </TableCell>
                    <TableCell className="text-left px-3 py-2 text-gray-900">
                      {editingAvailabilityId === property._id ? (
                        <select
                          value={availabilityEditValue ? "Available" : "Occupied"}
                          onChange={e => setAvailabilityEditValue(e.target.value === "Available")}
                          onBlur={async () => {
                            await handleStatusUpdate(property._id, availabilityEditValue);
                            setEditingAvailabilityId(null);
                          }}
                          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getAvailabilityBadge(property.availability)}
                          <button
                            onClick={() => {
                              setEditingAvailabilityId(property._id);
                              setAvailabilityEditValue(property.availability);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded transition-colors"
                            title="Edit availability"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-left px-5 py-3 text-gray-900">
                      {formatDate(property.createdAt)}
                    </TableCell>
                    <TableCell className="text-left px-5 py-3 text-gray-900">
                      <div className="flex gap-2">
                        <Link
                          to={`/edit-listing/${property._id}`}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded transition-colors"
                          title="Edit property"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded transition-colors"
                          title="Delete property"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center py-4">
                    No properties data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
