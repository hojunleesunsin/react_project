type InputFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email";
  defaultValue?: string;
  error?: string;
  placeholder?: string;
};

export function InputField({
  id,
  name,
  label,
  type = "text",
  defaultValue,
  error,
  placeholder,
}: InputFieldProps) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor={id} style={{ fontWeight: 600 }}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        style={{
          padding: "10px 12px",
          border: `1px solid ${error ? "#d33" : "#ccc"}`,
          borderRadius: 8,
        }}
      />
      {error ? (
        <p id={`${id}-error`} style={{ color: "#d33", margin: 0, fontSize: 13 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}