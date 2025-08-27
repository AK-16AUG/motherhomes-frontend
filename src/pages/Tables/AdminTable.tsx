import { useState, useEffect } from "react";
import { Plus, Edit, Trash, X } from "lucide-react";
import instance from "../../utils/Axios/Axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Admin {
  _id: string;
  User_Name: string;
  email: string;
  phone_no: number;
  role: string;
  isVerified: boolean;
}

const defaultForm = {
  User_Name: "",
  email: "",
  phone_no: "",
  password: "",
  role: "admin",
  isVerified: true,
};

export default function AdminTable() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [editId, setEditId] = useState<string | null>(null);

  // Fetch all admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await instance.get("/user/admins");
        setAdmins(res.data);
      } catch {
        toast.error("Failed to fetch admins");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update admin
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        // Edit
        await instance.put(`/user/admin/${editId}`, form);
        setAdmins((prev) =>
          prev.map((a) =>
            a._id === editId
              ? { ...a, ...form, phone_no: Number(form.phone_no) }
              : a
          )
        );
        toast.success("Admin updated!");
        window.location.reload();
      } else {
        // Create
        const res = await instance.post("/user/admin", { ...form });
        const newAdmin = res.data;
        newAdmin.phone_no = Number(newAdmin.phone_no);
        setAdmins((prev) => [...prev, newAdmin]);
        toast.success("Admin created!");
        window.location.reload();
      }
      setShowModal(false);
      setForm({ ...defaultForm });
      setEditId(null);
    } catch {
      toast.error("Failed to save admin");
    }
  };

  // Edit admin
  const handleEdit = (admin: Admin) => {
    setForm({
      User_Name: admin.User_Name,
      email: admin.email,
      phone_no: String(admin.phone_no),
      password: "",
      role: admin.role,
      isVerified: admin.isVerified,
    });
    setEditId(admin._id);
    setShowModal(true);
  };

  // Delete admin
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this admin?")) return;
    try {
      await instance.delete(`/user/admin/${id}`);
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      toast.success("Admin deleted!");
    } catch {
      toast.error("Failed to delete admin");
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
      <ToastContainer
        position="bottom-center"
        theme="colored"
        toastClassName="dark:bg-gray-800 dark:text-white"
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Admin Management
        </h2>
        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded w-full sm:w-auto justify-center transition-colors"
          onClick={() => {
            setShowModal(true);
            setForm({ ...defaultForm });
            setEditId(null);
          }}
        >
          <Plus size={18} /> Add Admin
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-4 sm:p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              onClick={() => setShowModal(false)}
            >
              <X />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editId ? "Edit Admin" : "Add Admin"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="User_Name"
                  value={form.User_Name}
                  onChange={handleChange}
                  className="w-full border dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="number"
                  name="phone_no"
                  value={form.phone_no}
                  onChange={handleChange}
                  className="w-full border dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              {!editId && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 border rounded text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded transition-colors"
                >
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table - with responsive design */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
        <div className="block w-full overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left hidden sm:table-cell">
                  Email
                </th>
                <th className="py-3 px-4 text-left hidden md:table-cell">
                  Phone
                </th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6">
                    No admins found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr
                    key={admin._id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                  >
                    <td className="py-2 px-4">
                      <div>
                        <span className="font-medium">{admin.User_Name}</span>
                        <div className="block sm:hidden text-xs text-gray-500 dark:text-gray-400">
                          {admin.email}
                        </div>
                        <div className="block md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {admin.phone_no}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4 hidden sm:table-cell">
                      {admin.email}
                    </td>
                    <td className="py-2 px-4 hidden md:table-cell">
                      {admin.phone_no}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <button
                          className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                          onClick={() => handleEdit(admin)}
                          aria-label="Edit admin"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          onClick={() => handleDelete(admin._id)}
                          aria-label="Delete admin"
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
    </div>
  );
}
