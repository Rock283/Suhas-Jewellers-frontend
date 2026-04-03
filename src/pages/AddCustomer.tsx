import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import PhotoUpload from "@/components/PhotoUpload";
import { useAppStore } from "@/lib/store";

// ✅ IMPORTS
import { createCustomer, getCustomers } from "@/services/customerService";

const AddCustomer = () => {
  const navigate = useNavigate();
  const setCustomers = useAppStore((s) => s.setCustomers);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  // ✅ UPDATED FUNCTION - ADDS TO STORE AFTER BACKEND SAVE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }

    try {
      setLoading(true);

      const response = await createCustomer({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        photo,
      });

      // ✅ Reload current user's customers from backend (strongest multi-user consistency)
      const customersRes = await getCustomers();
      setCustomers(customersRes.data || []);

      toast.success("Customer added successfully ✅");

      navigate("/customers");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="px-5 pt-12 pb-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">
            Add Customer
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Photo */}
          <div className="flex justify-center">
            <PhotoUpload
              photo={photo}
              onPhotoChange={setPhoto}
              label="Customer Photo"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter customer name"
              className="h-11"
              autoFocus
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="h-11"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              className="h-11"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            loading={loading}
            loadingText="Creating Customer..."
            className="w-full h-12 gradient-gold font-semibold gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Customer
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
