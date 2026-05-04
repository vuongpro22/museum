import { useAnimation } from '../../contexts/AnimationContext';
import { useAuth } from '../../contexts/AuthContext';

interface AdminButtonProps {
  onShowImageManager: () => void;
  onShowLoginForm: () => void;
}

const AdminButton = ({ onShowImageManager, onShowLoginForm }: AdminButtonProps) => {
  const { currentScreen } = useAnimation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Chỉ hiển thị khi ở scene mode và không loading
  if (currentScreen !== "scene" || authLoading) {
    return null;
  }

  return (
    <button
      onClick={() => isAuthenticated ? onShowImageManager() : onShowLoginForm()}
      className="fixed top-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-colors z-40"
      title={isAuthenticated ? 'Manage Images' : 'Admin Login'}
      style={{
        animation: "fadeIn 1s ease-out forwards",
      }}
    >
      {isAuthenticated ? (
        // Icon ảnh khi đã đăng nhập
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ) : (
        // Icon admin khi chưa đăng nhập
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )}
    </button>
  );
};

export default AdminButton;
