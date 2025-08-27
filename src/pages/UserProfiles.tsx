import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import instance from "../utils/Axios/Axios";

interface UserData {
  _id: string;
  User_Name: string;
  phone_no: number;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UserProfiles() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id,SetId]=useState(localStorage.getItem("userid"))

  useEffect(() => {
    SetId(localStorage.getItem("userid"))
    const fetchUserData = async () => {
      
      try {
        setLoading(true);
        const response = await instance.get(`/user/${id}`);
        setUserData(response.data);
      } catch (err) {
        setError("Failed to fetch user data");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  if (loading) {
    return <div className="p-4 text-center">Loading user data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div className="p-4 text-center">No user data found</div>;
  }

  
return (
  <>
    <PageBreadcrumb pageTitle="Profile" />
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Profile
      </h3>
      <div className="space-y-6">
        <UserMetaCard userData={userData} />
        <UserInfoCard userData={userData} />
        <UserAddressCard userData={userData} />
      </div>
    </div>
  </>
);
}