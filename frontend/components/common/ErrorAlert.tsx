interface ErrorAlertProps {
  error: string | null;
  onClose: () => void;
}

export default function ErrorAlert({ error, onClose }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between items-center">
      <span>{error}</span>
      <button onClick={onClose} className="text-red-400 hover:text-red-600">×</button>
    </div>
  );
}
