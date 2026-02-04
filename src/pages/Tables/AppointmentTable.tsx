import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

import Appointment from "../../components/tables/BasicTables/AppointmentTable";


export default function AppointmentTables() {
  return (
    <>

      <PageBreadcrumb pageTitle="Appointment Tables" />
      <div className="space-y-6">
        <ComponentCard title="Appointment Tables ">
          <Appointment />
        </ComponentCard>
      </div>
    </>
  );
}
