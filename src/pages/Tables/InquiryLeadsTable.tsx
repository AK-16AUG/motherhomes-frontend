import { useState, useEffect } from "react";
import { Trash, Filter } from "lucide-react";
import instance from "../../utils/Axios/Axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface InquiryLead {
  _id: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  location?: string;
  searchQuery: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  timestamp: Date;
  source?: string;
}

export default function InquiryLeadsTable() {
  const [leads, setLeads] = useState<InquiryLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await instance.get("/leads");
      // The API returns { results, total, page, limit }
      const leadsData = res.data.results || res.data.leads || res.data.data || res.data;
      // Ensure we have an array
      setLeads(Array.isArray(leadsData) ? leadsData : []);
    } catch (error) {
      toast.error("Failed to fetch inquiry leads");
      console.error(error);
      setLeads([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this inquiry lead?")) return;
    try {
      await instance.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((lead) => lead._id !== id));
      toast.success("Lead deleted!");
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await instance.put(`/leads/${id}`, { status: newStatus });
      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === id ? { ...lead, status: newStatus as any } : lead
        )
      );
      toast.success("Status updated!");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredLeads = statusFilter === "all" 
    ? leads 
    : leads.filter(lead => lead.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'converted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="bottom-center" theme="colored" />
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Inquiry Leads
        </h2>
        
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} className="text-gray-600 dark:text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="archived">Archived</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left hidden md:table-cell">Email</th>
              <th className="py-3 px-4 text-left hidden sm:table-cell">Phone</th>
              <th className="py-3 px-4 text-left">Location</th>
              <th className="py-3 px-4 text-left hidden lg:table-cell">Date</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 dark:text-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No inquiry leads found.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr
                  key={lead._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                >
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-medium">
                        {lead.contactInfo?.name || "N/A"}
                      </span>
                      <div className="block md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {lead.contactInfo?.email}
                      </div>
                      <div className="block sm:hidden text-xs text-gray-500 dark:text-gray-400">
                        {lead.contactInfo?.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {lead.contactInfo?.email || "N/A"}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    {lead.contactInfo?.phone || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {lead.location || "N/A"}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-xs">
                    {new Date(lead.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(lead.status)} border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        onClick={() => handleDelete(lead._id)}
                        aria-label="Delete lead"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
