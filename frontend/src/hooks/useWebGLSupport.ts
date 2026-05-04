import { useState, useEffect } from 'react';

interface WebGLSupport {
  isSupported: boolean;
  isLoading: boolean;
  error?: string;
}

export const useWebGLSupport = (): WebGLSupport => {
  const [support, setSupport] = useState<WebGLSupport>({
    isSupported: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        // Tạo canvas tạm để test WebGL
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
          // Kiểm tra thêm các extension cần thiết
          const extensions = [
            'OES_texture_float',
            'OES_element_index_uint',
            'WEBGL_lose_context'
          ];
          
          const supportedExtensions = extensions.filter(ext => 
            gl.getExtension(ext) !== null
          );
          
          if (supportedExtensions.length >= 1) {
            setSupport({ isSupported: true, isLoading: false });
          } else {
            setSupport({ 
              isSupported: false, 
              isLoading: false, 
              error: 'WebGL extensions không được hỗ trợ đầy đủ' 
            });
          }
        } else {
          setSupport({ 
            isSupported: false, 
            isLoading: false, 
            error: 'WebGL không được hỗ trợ' 
          });
        }
      } catch (error) {
        setSupport({ 
          isSupported: false, 
          isLoading: false, 
          error: `Lỗi kiểm tra WebGL: ${error}` 
        });
      }
    };

    // Kiểm tra ngay lập tức
    checkWebGLSupport();
    
    // Kiểm tra lại sau một khoảng thời gian ngắn
    const timeout = setTimeout(checkWebGLSupport, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  return support;
};
