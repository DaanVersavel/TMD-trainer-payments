interface ProcessingStatusProps {
  message?: string;
}

export function ProcessingStatus({ message = 'Processing...' }: ProcessingStatusProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Spinner */}
        <svg
          className="w-16 h-16 text-blue-500 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <p className="mt-4 text-gray-300 font-medium">{message}</p>
      <p className="mt-1 text-sm text-gray-500">Please wait...</p>
    </div>
  );
}
