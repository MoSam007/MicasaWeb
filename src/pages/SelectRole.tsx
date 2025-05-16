import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const SelectRole = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleRoleSelect = async (role: string) => {
    if (!user) return;

    // Set role in Clerk metadata
    await user.update({ unsafeMetadata: { role } });

    // (Optional) Call your backend to persist it too
    // await fetch("/api/set-role", { method: "POST", body: JSON.stringify({ role, userId: user.id }) });

    // Redirect to dashboard
    navigate(`/${role}-dashboard`);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <h2 className="text-xl font-bold">Choose your role</h2>
      <button onClick={() => handleRoleSelect("hunter")}>House Hunter</button>
      <button onClick={() => handleRoleSelect("owner")}>Home Owner</button>
      <button onClick={() => handleRoleSelect("mover")}>Mover</button>
    </div>
  );
};

export default SelectRole;
