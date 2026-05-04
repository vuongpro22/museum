import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Cập nhật state để hiển thị fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('WebGL Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                WebGL không được hỗ trợ
              </h2>
              <p className="text-gray-600 mb-6">
                Trình duyệt của bạn không hỗ trợ WebGL hoặc WebGL đã bị vô hiệu hóa. 
                Bảo tàng 3D cần WebGL để hoạt động.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-blue-800 mb-2">Cách khắc phục:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Cập nhật trình duyệt lên phiên bản mới nhất</li>
                  <li>• Bật WebGL trong cài đặt trình duyệt</li>
                  <li>• Cập nhật driver card đồ họa</li>
                  <li>• Thử trình duyệt khác (Chrome, Firefox, Edge)</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-yellow-800 mb-2">Kiểm tra WebGL:</h3>
                <p className="text-sm text-yellow-700">
                  Truy cập <a href="https://webglreport.com" target="_blank" rel="noopener noreferrer" className="underline">webglreport.com</a> để kiểm tra trạng thái WebGL của trình duyệt.
                </p>
              </div>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WebGLErrorBoundary;
