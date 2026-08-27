// RoleSelector.tsx
type RegistrationRole = "TPO" | "DEPARTMENT" | "STUDENT";

interface Props {
  onSelect: (role: RegistrationRole) => void;
}

export default function RoleSelector({ onSelect }: Props) {
  const options: { role: RegistrationRole; title: string; description: string }[] = [
    {
      role: "TPO",
      title: "Training & Placement Office",
      description: "Register your college's T&P office.",
    },
    {
      role: "DEPARTMENT",
      title: "Department",
      description: "Register a department account.",
    },
    {
      role: "STUDENT",
      title: "Student",
      description: "Create your student account.",
    },
  ];

  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <button
          key={opt.role}
          type="button"
          onClick={() => onSelect(opt.role)}
          className="w-full text-left border border-[#d8cbb0] bg-white/60 hover:bg-[#efe6d2] hover:border-[#7a4a25] px-6 py-5 transition-colors"
        >
          <h2 className="text-base font-serif font-medium text-[#2b2318]">{opt.title}</h2>
          <p className="mt-1 text-sm text-[#8a7a5c]">{opt.description}</p>
        </button>
      ))}
    </div>
  );
}