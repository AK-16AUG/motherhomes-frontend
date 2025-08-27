import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import ListingTable from "../../components/tables/BasicTables/ListingTable";

export default function AllListing() {
  return (
    <>
      <PageBreadcrumb pageTitle="Dashboard/All Listing" />
      <div className="space-y-6">
        <ComponentCard title="All Listing">
          <ListingTable />
        </ComponentCard>
      </div>
    </>
  );
}
