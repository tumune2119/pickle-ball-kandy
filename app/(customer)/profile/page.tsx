import CustomerProfile from "@/components/CustomerProfile";

export const metadata = {
  title: "My Profile - Pickle Rush",
};

export default function ProfilePage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl md:text-3xl font-display uppercase mb-8 text-text-primary skew-display">My Profile</h2>
      <CustomerProfile />
    </div>
  );
}
