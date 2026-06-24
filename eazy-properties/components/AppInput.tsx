type AppInputProps = {
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function AppInput({
  label,
  type = "text",
  value,
  placeholder,
  onChange,
}: AppInputProps) {
  // Ovo je zajedničko input polje za sve forme.
  return (
    <label className="input-group">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}