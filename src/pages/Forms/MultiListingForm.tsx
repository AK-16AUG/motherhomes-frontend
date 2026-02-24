import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import instance from "../../utils/Axios/Axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

interface Amenity {
    _id: string;
    name: string;
}

interface Service {
    _id: string;
    name: string;
}

interface Entry {
    id: string; // local UI id
    property_name: string;
    description: string;
    rate: string;
    category: "rent" | "sale" | "pg";
    furnishing_type: "Raw" | "Semi-furnished" | "Fully furnished";
    city: string;
    state: string;
    address: string;
    flat_no: string;
    bed: number;
    bathroom: number;
    area: string;
    availability: boolean;
    latitude: string;
    longitude: string;
    perPersonPrice?: string;
    totalCapacity?: string;
}

export default function MultiListingForm() {
    const navigate = useNavigate();

    // Master Settings
    const [master, setMaster] = useState({
        description: "",
        rate: "",
        category: "rent" as "rent" | "sale" | "pg",
        furnishing_type: "Raw" as "Raw" | "Semi-furnished" | "Fully furnished",
        city: "",
        state: "",
        address: "",
        area: "",
        bed: 1,
        bathroom: 1,
        latitude: "",
        longitude: "",
        perPersonPrice: "",
        totalCapacity: "",
    });

    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const [images, setImages] = useState<File[]>([]);
    const [randomizeImages, setRandomizeImages] = useState(false);
    const [videos] = useState<string[]>([""]);

    // Entries
    const [entries, setEntries] = useState<Entry[]>([
        {
            id: Date.now().toString(),
            property_name: "",
            flat_no: "",
            description: "",
            rate: "",
            category: "rent",
            furnishing_type: "Raw",
            city: "",
            state: "",
            address: "",
            bed: 1,
            bathroom: 1,
            area: "",
            availability: true,
            latitude: "",
            longitude: "",
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await instance.get("/amentiesservice/all");
                setAmenities(response.data.data.amenities);
                setServices(response.data.data.services);
            } catch (error) {
                toast.error("Failed to load amenities and services");
            } finally {
                setOptionsLoading(false);
            }
        };
        fetchOptions();
    }, []);

    const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMaster((prev) => ({ ...prev, [name]: value }));
    };

    const applyMasterToAll = () => {
        if (!window.confirm("This will overwrite description, rate, location, etc. for ALL entries below. Continue?")) return;
        setEntries((prev) =>
            prev.map((entry) => ({
                ...entry,
                description: master.description || entry.description,
                rate: master.rate || entry.rate,
                category: master.category,
                furnishing_type: master.furnishing_type,
                city: master.city || entry.city,
                state: master.state || entry.state,
                address: master.address || entry.address,
                area: master.area || entry.area,
                bed: Number(master.bed) || entry.bed,
                bathroom: Number(master.bathroom) || entry.bathroom,
                latitude: master.latitude || entry.latitude,
                longitude: master.longitude || entry.longitude,
                perPersonPrice: master.perPersonPrice || entry.perPersonPrice,
                totalCapacity: master.totalCapacity || entry.totalCapacity,
            }))
        );
        toast.success("Master settings applied to all entries");
    };

    const handleEntryChange = (id: string, field: keyof Entry, value: any) => {
        setEntries((prev) =>
            prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
        );
    };

    const addEntry = () => {
        setEntries((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                property_name: "",
                flat_no: "",
                description: master.description,
                rate: master.rate,
                category: master.category,
                furnishing_type: master.furnishing_type,
                city: master.city,
                state: master.state,
                address: master.address,
                bed: Number(master.bed),
                bathroom: Number(master.bathroom),
                area: master.area,
                availability: true,
                latitude: master.latitude,
                longitude: master.longitude,
                perPersonPrice: master.perPersonPrice,
                totalCapacity: master.totalCapacity,
            },
        ]);
    };

    const removeEntry = (id: string) => {
        if (entries.length === 1) return toast.error("At least one entry is required");
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (images.length + newFiles.length > 10) {
                return toast.error("Max 10 images allowed.");
            }
            setImages((prev) => [...prev, ...newFiles]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        const emptyNames = entries.filter((e) => !e.property_name);
        if (emptyNames.length > 0) return toast.error("All entries must have a property name");

        const flatNumbers = entries.map((e) => e.flat_no).filter(Boolean);
        const uniqueFlatNumbers = new Set(flatNumbers);
        if (flatNumbers.length !== uniqueFlatNumbers.size) {
            return toast.error("Duplicate flat numbers found within the entries.");
        }

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("randomizeImages", String(randomizeImages));

            images.forEach((image) => {
                formDataToSend.append("images", image);
            });

            const processedEntries = entries.map((entry) => ({
                ...entry,
                amenities: selectedAmenities,
                services: selectedServices,
                videos: videos.filter((v) => v.trim() !== ""),
            }));

            formDataToSend.append("entries", JSON.stringify(processedEntries));

            await instance.post("/property/bulk-multi", formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Multiple properties created successfully!");
            setTimeout(() => navigate("/alllisting"), 2000);
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to create properties");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full rounded border border-gray-300 bg-white p-2 text-sm focus:border-blue-500 focus:outline-none text-gray-900";

    return (
        <div className="px-4 py-6 bg-gray-50 min-h-screen">
            <ToastContainer position="bottom-center" />
            <PageBreadcrumb pageTitle="Add Multiple Listings" />

            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
                {/* Master Configuration */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Master Settings</h2>
                        <button
                            type="button"
                            onClick={applyMasterToAll}
                            className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200"
                        >
                            Apply to All Entries Below
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Fill these out first, then click "Apply to All" to instantly fill the matching fields for every flat below.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select name="category" value={master.category} onChange={handleMasterChange} className={inputClass}>
                                <option value="rent">Rent</option>
                                <option value="sale">Sale</option>
                                <option value="pg">PG</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <input type="text" name="city" value={master.city} onChange={handleMasterChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">State</label>
                            <input type="text" name="state" value={master.state} onChange={handleMasterChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Rate / Price</label>
                            <input type="text" name="rate" value={master.rate} onChange={handleMasterChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Furnishing</label>
                            <select name="furnishing_type" value={master.furnishing_type} onChange={handleMasterChange} className={inputClass}>
                                <option value="Raw">Raw</option>
                                <option value="Semi-furnished">Semi-furnished</option>
                                <option value="Fully furnished">Fully furnished</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Area (sq ft)</label>
                            <input type="text" name="area" value={master.area} onChange={handleMasterChange} className={inputClass} />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <input type="text" name="address" value={master.address} onChange={handleMasterChange} className={inputClass} />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea name="description" value={master.description} onChange={handleMasterChange} className={inputClass} rows={3} />
                        </div>
                    </div>
                </div>

                {/* Global Options: Images, Amenities */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Global Features & Media</h2>
                    <p className="text-sm text-gray-500 mb-6">These applied to every entry.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Amenities</label>
                            {!optionsLoading && (
                                <div className="h-32 overflow-y-auto border p-2 rounded bg-gray-50">
                                    {amenities.map(a => (
                                        <label key={a._id} className="flex items-center gap-2 text-sm mb-1">
                                            <input type="checkbox" checked={selectedAmenities.includes(a._id)} onChange={(e) => {
                                                if (e.target.checked) setSelectedAmenities([...selectedAmenities, a._id]);
                                                else setSelectedAmenities(selectedAmenities.filter(id => id !== a._id));
                                            }} /> {a.name}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Services</label>
                            {!optionsLoading && (
                                <div className="h-32 overflow-y-auto border p-2 rounded bg-gray-50">
                                    {services.map(s => (
                                        <label key={s._id} className="flex items-center gap-2 text-sm mb-1">
                                            <input type="checkbox" checked={selectedServices.includes(s._id)} onChange={(e) => {
                                                if (e.target.checked) setSelectedServices([...selectedServices, s._id]);
                                                else setSelectedServices(selectedServices.filter(id => id !== s._id));
                                            }} /> {s.name}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Upload Master Images (Max 10)</label>
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="mb-2" />
                        <div className="flex flex-wrap gap-2 mb-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative w-20 h-20 border rounded">
                                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover rounded" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">-</button>
                                </div>
                            ))}
                        </div>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={randomizeImages} onChange={(e) => setRandomizeImages(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                            <span className="text-sm font-medium">Randomize image order for each flat</span>
                        </label>
                    </div>
                </div>

                {/* Entries List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Individual Entries ({entries.length})</h2>
                        <button type="button" onClick={addEntry} className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700">
                            + Add Another Flat
                        </button>
                    </div>

                    {entries.map((entry, index) => (
                        <div key={entry.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative">
                            <div className="absolute top-4 right-4 text-gray-400 font-bold">#{index + 1}</div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 pr-12">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Property Name*</label>
                                    <input type="text" value={entry.property_name} onChange={(e) => handleEntryChange(entry.id, "property_name", e.target.value)} required placeholder="e.g. Sunrise Flat 101" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Flat No*</label>
                                    <input type="text" value={entry.flat_no} onChange={(e) => handleEntryChange(entry.id, "flat_no", e.target.value)} required placeholder="e.g. 101" className={inputClass} />
                                </div>
                                <div className="flex items-end mb-1">
                                    {entries.length > 1 && (
                                        <button type="button" onClick={() => removeEntry(entry.id)} className="text-red-500 text-sm hover:underline">Remove</button>
                                    )}
                                </div>
                            </div>

                            {/* Collapsible Details (Optional View) */}
                            <details className="mt-2 text-sm text-gray-600 p-2 bg-gray-50 border rounded">
                                <summary className="cursor-pointer font-medium text-blue-600">View/Edit Full Details for this flat</summary>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                                    <div>
                                        <label className="block text-xs mb-1">Rate</label>
                                        <input type="text" value={entry.rate} onChange={(e) => handleEntryChange(entry.id, "rate", e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs mb-1">Bed</label>
                                        <input type="number" value={entry.bed} onChange={(e) => handleEntryChange(entry.id, "bed", Number(e.target.value))} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs mb-1">Bath</label>
                                        <input type="number" value={entry.bathroom} onChange={(e) => handleEntryChange(entry.id, "bathroom", Number(e.target.value))} className={inputClass} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs mb-1">Area</label>
                                        <input type="text" value={entry.area} onChange={(e) => handleEntryChange(entry.id, "area", e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="col-span-5">
                                        <label className="block text-xs mb-1">Description</label>
                                        <textarea value={entry.description} onChange={(e) => handleEntryChange(entry.id, "description", e.target.value)} className={inputClass} rows={2} />
                                    </div>
                                </div>
                            </details>
                        </div>
                    ))}
                </div>

                {/* Submit */}
                <div className="sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 flex justify-end">
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 disabled:opacity-50">
                        {loading ? "Creating..." : `Create ${entries.length} Properties`}
                    </button>
                </div>

            </form>
        </div>
    );
}
