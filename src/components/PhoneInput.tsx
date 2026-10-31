import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatPhoneInput, isPhoneComplete, PHONE_PLACEHOLDER } from "@/utils/phone";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

const PhoneInput = ({ value, onChange, className, placeholder, required, disabled, id }: PhoneInputProps) => {
  const [touched, setTouched] = useState(false);
  const invalid = touched && value.length > 0 && !isPhoneComplete(value);

  return (
    <div>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        value={value}
        onChange={(e) => onChange(formatPhoneInput(e.target.value))}
        onBlur={() => setTouched(true)}
        placeholder={placeholder || PHONE_PLACEHOLDER}
        maxLength={16}
        required={required}
        disabled={disabled}
        className={`${className || ""} ${invalid ? "border-red-500" : ""}`}
      />
      {invalid && <p className="text-xs text-red-500 mt-1">Формат: +7000-000-00-00</p>}
    </div>
  );
};

export default PhoneInput;
