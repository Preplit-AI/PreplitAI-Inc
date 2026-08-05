export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5" aria-label="Assistant is typing">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </div>
  );
}
