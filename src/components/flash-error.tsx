type FlashErrorProps = {
  message?: string;
};

export function FlashError({ message }: FlashErrorProps) {
  if (!message) return null;
  return (
    <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" role="alert">
      {message}
    </div>
  );
}
