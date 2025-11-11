import { useState, useEffect } from "react";
import instance from "../../utils/Axios/Axios";
import { EyeIcon } from "lucide-react";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { toast } from "react-toastify";

type Tenant = {
  _id: string;
  name?: string; // For Normal properties
  tenantDetails?: { name: string; email: string; user_id?: string }[]; // For PG properties
  society: string;
  flatNo: string;
  property_type: "Pg" | "Normal";
  members: string;
  startDate: string;
  rent: string;
  Payments: Payment[];
};

type Payment = {
  user_id: string;
  dateOfPayment: string;
  amount: number;
  modeOfPayment: "cash" | "online";
};

export default function MyFlatsTable() {
  const [myFlats, setMyFlats] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<null | Payment[]>(null);

  useEffect(() => {
    // fetch user's flats
    const fetchFlats = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userid");
        if (!userId) throw new Error("User ID not found");
        const response = await instance.get(`/tenant/user/${userId}`);
        const flats = response.data?.data ?? [];
        setMyFlats(flats);
      } catch (err) {
        toast.error("Failed to fetch flats. Please try again later.");
        console.error("Error fetching flats:", err)
        // handle error (toast, etc.)
      } finally {
        setLoading(false);
      }
    };
    fetchFlats();
  }, []);

  const handleEyeClick = (payments: Payment[]) => {
    setPaymentModal(payments);
  };

  const closePaymentModal = () => setPaymentModal(null);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table aria-label="My Flats">
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="text-left px-5 py-3">
                Society
              </TableCell>
              <TableCell isHeader className="text-left px-5 py-3">
                Flat No
              </TableCell>
              <TableCell isHeader className="text-left px-5 py-3">
                Property Type
              </TableCell>
              <TableCell isHeader className="text-left px-5 py-3">
                {/* Dynamic header based on property type */}
                Tenants/Members
              </TableCell>
              <TableCell isHeader className="text-left px-5 py-3">
                Start Date
              </TableCell>
              <TableCell isHeader className="text-left px-5 py-3">
                Rent (₹)
              </TableCell>
              <TableCell isHeader className="text-left px-5 py-3">
                Payments
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myFlats.length === 0 && (
              <TableRow>
                <TableCell  className="text-center px-5 py-3">
                  {loading ? "Loading..." : "No records found."}
                </TableCell>
              </TableRow>
            )}
            {myFlats.map((flat) => (
              <TableRow key={flat._id}>
                <TableCell className="px-5 py-3">{flat.society}</TableCell>
                <TableCell className="px-5 py-3">{flat.flatNo}</TableCell>
                <TableCell className="px-5 py-3">
                  {flat.property_type}
                </TableCell>
                <TableCell className="px-5 py-3">
                  {flat.property_type === "Pg" && flat.tenantDetails ? (
                    <div className="space-y-1">
                      {flat.tenantDetails.map((tenant, idx) => (
                        <div key={idx} className="text-sm">
                          {tenant.name} ({tenant.email})
                        </div>
                      ))}
                    </div>
                  ) : (
                    flat.members
                  )}
                </TableCell>
                <TableCell className="px-5 py-3">
                  {new Date(flat.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="px-5 py-3">{flat.rent}</TableCell>
                <TableCell className="px-5 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEyeClick(flat.Payments)}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ===== Payment Modal ===== */}
      {paymentModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[99998]"
          onClick={closePaymentModal}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-6 relative z-[99999]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Payments</h2>
              <button
                onClick={closePaymentModal}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left text-sm">Date</th>
                  <th className="py-2 text-left text-sm">Amount</th>
                  <th className="py-2 text-left text-sm">Mode</th>
                  <th className="py-2 text-left text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentModal.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      No payments made yet.
                    </td>
                  </tr>
                )}
                {paymentModal.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2 text-sm">
                      {new Date(p.dateOfPayment).toLocaleDateString("en-US")}
                    </td>
                    <td className="py-2 text-sm">₹{p.amount}</td>
                    <td className="py-2 text-sm capitalize">
                      {p.modeOfPayment}
                    </td>
                    <td className="py-2 text-sm">
                      <Badge
                        size="sm"
                        color={p.dateOfPayment ? "success" : "error"}
                      >
                        {p.dateOfPayment ? "Paid" : "Not Paid"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="outline" onClick={closePaymentModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
