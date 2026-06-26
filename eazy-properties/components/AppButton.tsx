type AppButtonProps = {
  text: string;
  type?: "button" | "submit";
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  fullWidth?: boolean;
};

export default function AppButton({
  text,
  type = "button",
  onClick,
  variant = "primary",
  fullWidth = false,
}: AppButtonProps) {
  // Ovo je zajedničko dugme koje koristimo kroz celu aplikaciju.
  return (
    <button
      type={type}
      onClick={onClick}
      className={`app-button ${variant} ${fullWidth ? "full-width" : ""}`}
    >
      {text}
    </button>
  );
}