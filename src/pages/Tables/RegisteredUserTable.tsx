import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  User,
} from "lucide-react";
import instance from "../../utils/Axios/Axios";

interface UserData {
  _id: string;
  User_Name: string;
  email: string;
  phone_no: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = "/user";

export default function RegisteredUserTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [data, setData] = useState<UserData[]>([]);
  const [filteredData, setFilteredData] = useState<UserData[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await instance.get(
          `${API_BASE_URL}?page=${currentPage}&limit=${entriesPerPage}`
        );

        setData(response.data.users || []);
        setTotalEntries(response.data.total || response.data.users.length || 0);
        setTotalPages(Math.ceil(response.data.total / entriesPerPage) || 1);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [currentPage, entriesPerPage]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        const filtered = data.filter((user) => {
          const email = user.email?.toLowerCase() || "";
          const searchLower = searchTerm.toLowerCase();
          return email.includes(searchLower);
        });
        setFilteredData(filtered);
      } else {
        setFilteredData([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, data]);

  const isFiltering = searchTerm.trim() !== "";
  const displayData = isFiltering ? filteredData : data;

  const paginatedData = isFiltering 
    ? displayData.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
      )
    : displayData;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-gray-100">
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-10">
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <span className="text-gray-400 dark:text-gray-500">Home</span> /{" "}
        <span>Users Management</span>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/20 p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Registered Users
          </h2>
        </div>

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
            <Mail className="absolute top-2 left-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="email"
              placeholder="Search by email..."
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
                <th className="py-2 px-4 whitespace-nowrap">User Info</th>
                <th className="py-2 px-4 whitespace-nowrap">Email</th>
                <th className="py-2 px-4 whitespace-nowrap">Phone</th>
                <th className="py-2 px-4 whitespace-nowrap">Registered At</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <User
                            size={16}
                            className="text-gray-600 dark:text-gray-300"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {user.User_Name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1">
                        <Mail
                          size={14}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        <span className="text-gray-900 dark:text-gray-100">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1">
                        <Phone
                          size={14}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        <span className="text-gray-900 dark:text-gray-100">
                          {user.phone_no}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    {isFiltering ? "No users found with this email" : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400 gap-4">
          <p className="whitespace-nowrap">
            {isFiltering
              ? `Found ${filteredData.length} matching results`
              : `Showing ${
                  totalEntries === 0
                    ? 0
                    : (currentPage - 1) * entriesPerPage + 1
                } to ${Math.min(
                  currentPage * entriesPerPage,
                  totalEntries
                )} of ${totalEntries} entries`}
          </p>

          {!isFiltering ? (
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft size={16} />
              </button>

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

              {(() => {
                const startPage = Math.max(1, currentPage - 1);
                const endPage = Math.min(totalPages, currentPage + 1);
                const pages = [];

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      className={`px-3 py-1 rounded border border-gray-300 dark:border-gray-600 transition-colors ${
                        currentPage === i
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
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Filtered results - pagination disabled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}