import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import instance from "../../utils/Axios/Axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, Save } from "react-feather";
import { PageLoader } from "../../components/ui/loading";

interface User {
  _id: string;
  User_Name: string;
  phone_no: number;
  email: string;
  role: string;
}

interface Payment {
  _id: string;
  user_id: User;
  dateOfPayment: string;
  modeOfPayment: "cash" | "online";
  amount?: number;
}

interface Property {
  _id: string;
  property_name: string;
  description: string;
  rate: string;
  category: string;
  amenities: string[];
  images: string[];
  furnishing_type: string;
  city: string;
  state: string;
  bed: number;
  bathroom: number;
  area?: string;
}

interface Tenant {
  _id: string;
  name: string;
  users: User[];
  property_id: Property;
  flatNo: string;
  society: string;
  members: string;
  startDate: string;
  rent: string;
  property_type: "Pg" | "Normal" | "sale";
  Payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const TenantProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "payments" | "users">(
    "details"
  );
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    user_id: "",
    dateOfPayment: new Date().toISOString().split("T")[0],
    modeOfPayment: "online" as "cash" | "online",
    amount: 0,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    property_type: "Normal" as "Pg" | "Normal",
    property_id: "",
    flatNo: "",
    society: "",
    members: "1",
    users: [""],
    startDate: new Date().toISOString().split("T")[0],
    rent: "",
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await instance.get(`/tenant/${id}`);
        const tenantData = response.data.data;
        setTenant(tenantData);

        // Initialize edit form data
        setEditFormData({
          name: tenantData.name || "",
          property_type: tenantData.property_type || "Normal",
          property_id: tenantData.property_id?._id || "",
          flatNo: tenantData.flatNo || "",
          society: tenantData.society || "",
          members: tenantData.members || "1",
          users: tenantData.users?.map((user: User) => user.email) || [""],
          startDate: tenantData.startDate
            ? new Date(tenantData.startDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          rent: tenantData.rent || "",
        });
      } catch (err: unknown) {
        const error = err as ApiError;
        setError(
          error.response?.data?.message || "Failed to fetch tenant details"
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchProperties = async () => {
      try {
        const response = await instance.get("/property");
        setProperties(response.data.results || []);
      } catch (err) {
        console.error("Failed to fetch properties", err);
      }
    };

    if (id) {
      fetchTenant();
      fetchProperties();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const sendReminderForPaymentAdd = async (userId: string) => {
    try {
      await instance.post("/notification", {
        user_id: userId,
        property_id: tenant?.property_id?._id,
        description: "Admin has updated the payment details",
      });
      toast.success(`Reminder sent successfully to user!`);
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  const handleAddPayment = async () => {
    try {
      if (!paymentData.user_id || paymentData.amount <= 0) {
        toast.error("Please fill all fields correctly");
        return;
      }

      const response = await instance.post(`/tenant/${id}/users/payments`, {
        ...paymentData,
        dateOfPayment: new Date(paymentData.dateOfPayment),
      });

      if (tenant) {
        setTenant({
          ...tenant,
          Payments: [...(tenant.Payments || []), response.data],
        });
      }
      setShowAddPayment(false);

      sendReminderForPaymentAdd(paymentData?.user_id);
      toast.success("Payment added successfully!");

      // Reset form
      setPaymentData({
        user_id: "",
        dateOfPayment: new Date().toISOString().split("T")[0],
        modeOfPayment: "online",
        amount: 0,
      });
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || "Failed to add payment");
      toast.error("Failed to add payment");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await instance.delete(`/tenant/${id}/users/${userId}`);
      if (tenant) {
        setTenant({
          ...tenant,
          users: tenant.users.filter((user) => user._id !== userId),
        });
      }
      toast.success("User removed successfully!");
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || "Failed to remove user");
      toast.error("Failed to remove user");
    }
  };

  const sendReminder = async (userId: string) => {
    try {
      await instance.post("/notification", {
        user_id: userId,
        property_id: tenant?.property_id?._id,
        description:
          "Rent payment is due. Please make the payment at your earliest convenience.",
      });
      toast.success(`Reminder sent successfully to user!`);
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleMemberEmailsChange = (index: number, value: string) => {
    const newUsers = [...editFormData.users];
    newUsers[index] = value;
    setEditFormData({
      ...editFormData,
      users: newUsers,
    });
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedTenant = {
        ...editFormData,
        startDate: new Date(editFormData.startDate),
        members: editFormData.users.length.toString(),
      };

      await instance.put(`/tenant/${id}`, updatedTenant);
      const response = await instance.get(`/tenant/${id}`);
      setTenant(response.data.data);
      setShowEditModal(false);
      toast.success("Tenant updated successfully!");
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || "Failed to update tenant");
      toast.error("Failed to update tenant");
    }
  };

  if (loading) {
    return <PageLoader message="Loading tenant profile..." />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/tenantinfo" className="text-blue-600 hover:underline">
          Back to tenants list
        </Link>
      </div>
    );
  }

  if (!tenant) {
    return <div className="text-center py-10">Tenant not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ToastContainer position="bottom-right" />

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col border-2 border-gray-300">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Tenant
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={handleUpdateTenant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    <span className="font-bold">Tenant Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Property Type
                  </label>
                  <select
                    name="property_type"
                    value={editFormData.property_type}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Normal">Normal</option>
                    <option value="Pg">PG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Property
                  </label>
                  <select
                    name="property_id"
                    value={editFormData.property_id}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Property</option>
                    {properties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.property_name} - {property.city} (₹
                        {property.rate}/month)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Flat No.
                  </label>
                  <input
                    type="text"
                    name="flatNo"
                    value={editFormData.flatNo}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Society
                  </label>
                  <input
                    type="text"
                    name="society"
                    value={editFormData.society}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    No. of Members
                  </label>
                  <input
                    type="number"
                    name="members"
                    value={editFormData.members}
                    onChange={(e) => {
                      const numMembers = parseInt(e.target.value) || 1;
                      const currentUsers = [...editFormData.users];
                      if (numMembers > currentUsers.length) {
                        while (currentUsers.length < numMembers) {
                          currentUsers.push("");
                        }
                      } else if (numMembers < currentUsers.length) {
                        currentUsers.length = numMembers;
                      }
                      setEditFormData({
                        ...editFormData,
                        members: numMembers.toString(),
                        users: currentUsers,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Members Email
                  </label>
                  {Array.from({ length: parseInt(editFormData.members) }).map(
                    (_, index) => (
                      <div key={index} className="mb-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Member {index + 1} Email
                        </label>
                        <input
                          type="email"
                          value={editFormData.users[index] || ""}
                          onChange={(e) =>
                            handleMemberEmailsChange(index, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    )
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={editFormData.startDate}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    <span className="font-bold">Rent Amount</span>
                  </label>
                  <input
                    type="text"
                    name="rent"
                    value={editFormData.rent}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleUpdateTenant}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {tenant.name || "Tenant Profile"}
          </h1>
          <div className="flex items-center mt-2">
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {tenant.property_type}
            </span>
            <span className="ml-2 text-gray-600">
              Since {formatDate(tenant.startDate)}
            </span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Edit Details
          </button>
          <Link
            to="/tenantinfo"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Back to Tenants
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tenant Details
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "payments"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Payment History
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "users"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Users ({tenant?.users?.length || 0})
          </button>
        </nav>
      </div>

      {/* Main Content */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tenant Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tenant Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Property
                  </h3>
                  <p className="mt-1 text-gray-800">
                    {tenant.property_id?.property_name || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Flat No.
                  </h3>
                  <p className="mt-1 text-gray-800">{tenant.flatNo || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Society</h3>
                  <p className="mt-1 text-gray-800">
                    {tenant.society || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Members</h3>
                  <p className="mt-1 text-gray-800">
                    {tenant.members || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rent</h3>
                  <p className="mt-1 text-gray-800">
                    ₹{parseInt(tenant.rent || "0").toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Start Date
                  </h3>
                  <p className="mt-1 text-gray-800">
                    {formatDate(tenant.startDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            {tenant.property_id ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-gray-800">
                    {tenant.property_id.property_name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Rent / Price
                  </h3>
                  <p className="mt-1 text-gray-800">
                    ₹{parseInt(tenant.property_id.rate).toLocaleString()}
                    {tenant.property_type !== "sale" && (
                      <span className="text-sm text-gray-500"> /month</span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Area</h3>
                  <p className="mt-1 text-gray-800">
                    {tenant.property_id.area
                      ? `${tenant.property_id.area} sq ft`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Location
                  </h3>
                  <p className="mt-1 text-gray-800">
                    {tenant.property_id.city}, {tenant.property_id.state}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Bed/Bath
                  </h3>
                  <p className="mt-1 text-gray-800">
                    {tenant.property_id.bed} Beds, {tenant.property_id.bathroom}{" "}
                    Baths
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Furnishing
                  </h3>
                  <p className="mt-1 text-gray-800">
                    {tenant.property_id.furnishing_type}
                  </p>
                </div>
                {tenant.property_id.amenities?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Amenities
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {tenant.property_id.amenities.map(
                        (amenity: string | { name: string }, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800"
                          >
                            {typeof amenity === "object" &&
                            amenity !== null &&
                            "name" in amenity
                              ? amenity.name
                              : amenity}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No property information available</p>
            )}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Payment History</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddPayment(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Add Payment
              </button>
            </div>
          </div>

          {showAddPayment && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Record New Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User
                  </label>
                  <select
                    value={paymentData.user_id}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        user_id: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="">Select User</option>
                    {tenant?.users?.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.email} ({user.User_Name})
                      </option>
                    ))}
                  </select>

                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                    Date
                  </label>
                  <input
                    type="date"
                    value={paymentData.dateOfPayment}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        dateOfPayment: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentData.modeOfPayment}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        modeOfPayment: e.target.value as "cash" | "online",
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="online">Online</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddPayment(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Save Payment
                </button>
              </div>
            </div>
          )}

          {tenant?.Payments?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recorded By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tenant.Payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.dateOfPayment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{payment?.amount || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            payment.modeOfPayment === "online"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {payment?.modeOfPayment?.charAt(0)?.toUpperCase() +
                            payment?.modeOfPayment?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600">
                                {payment?.user_id?.User_Name?.charAt(
                                  0
                                ).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payment?.user_id?.User_Name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment?.user_id?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => sendReminder(payment.user_id._id)}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payment records found
            </div>
          )}
        </div>
      )}

      {/* Users Tab with Modern Cards - Black & White Theme */}
      {activeTab === "users" && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Associated Users
            </h2>
            {/* Send Reminder to All button for admin/superadmin only */}
            {(userRole === "admin" || userRole === "superadmin") &&
              tenant?.users?.length > 0 && (
                <button
                  onClick={() =>
                    tenant.users.forEach((user) => sendReminder(user._id))
                  }
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Send Reminder to All
                </button>
              )}
          </div>

          {tenant?.users?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {tenant.users.map((user) => (
                <div
                  key={user._id}
                  className="group relative bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 hover:border-gray-900 hover:-translate-y-1"
                >
                  {/* Background gradient overlay - Black & White */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* User Avatar & Info */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                      <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shadow-lg ring-2 ring-gray-200 group-hover:ring-gray-900 transition-all duration-300">
                          <span className="text-white font-bold text-lg sm:text-xl">
                            {user?.User_Name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        {/* Status indicator */}
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-gray-400 border-2 border-white rounded-full group-hover:bg-gray-800 transition-colors duration-300"></div>
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate mb-1 group-hover:text-black transition-colors duration-300">
                          {user.User_Name}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-600 mb-1 space-y-1 sm:space-y-0">
                          <div className="flex items-center justify-center sm:justify-start w-full">
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-500 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="truncate text-xs sm:text-sm min-w-0 flex-1">
                              {user.email}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-gray-500">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span className="text-xs sm:text-sm">
                            {user.phone_no}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="mb-4 flex justify-center sm:justify-start">
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                        <svg
                          className="w-2 h-2 sm:w-3 sm:h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {user.role}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 sm:space-y-3">
                      <button
                        onClick={() => sendReminder(user._id)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 text-white rounded-lg hover:bg-black transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-sm"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Send Reminder</span>
                      </button>

                      <button
                        onClick={() => handleRemoveUser(user._id)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-gray-800 text-gray-800 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-sm"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <span>Remove User</span>
                      </button>
                    </div>
                  </div>

                  {/* Decorative corner accent - Black & White */}
                  <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-gray-200/30 to-transparent rounded-xl group-hover:from-gray-800/20 transition-all duration-300"></div>
                  </div>

                  {/* Border accent on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-900 via-transparent to-gray-900 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-200">
                <svg
                  className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No Users Found
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                No users are associated with this tenant
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TenantProfile;
