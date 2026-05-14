interface ToastProps {
  message: string;
  type?: 'success' | 'error';
}

export const Toast = ({ message, type = 'success' }: ToastProps) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
        type === 'success'
          ? 'bg-base-100 border-success/30 text-success'
          : 'bg-base-100 border-error/30 text-error'
      }`}>
        {type === 'success'
          ? <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
          : <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
        }
        {message}
      </div>
    </div>
  );
};
