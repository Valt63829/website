import { useAuth } from "../context/AuthContext";

const Account = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6 text-white">
        Please login to view account
      </div>
    );
  }

  return (
    <div className="p-6 text-white">

      <h1 className="text-2xl mb-6">Account Settings</h1>

      <div className="bg-white/5 p-4 rounded-xl border border-white/10">

        <p><strong>Name:</strong> {user.displayName}</p>
        <p><strong>Email:</strong> {user.email}</p>

      </div>

    </div>
  );
};

export default Account;