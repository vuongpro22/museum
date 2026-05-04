import { ImageMetadata } from '../types/museum';

interface FallbackGalleryProps {
  images: ImageMetadata[];
}

const FallbackGallery = ({ images }: FallbackGalleryProps) => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <h1 className="text-white text-3xl font-bold text-center">
          Bảo tàng Nghệ thuật
        </h1>
        <p className="text-gray-300 text-center mt-2">
          Chế độ xem đơn giản (WebGL không khả dụng)
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="pt-32 pb-16 px-6 h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div key={index} className="group">
                <div className="relative overflow-hidden rounded-lg shadow-lg bg-white">
                  <img
                    src={image.url}
                    alt={image.title || `Tác phẩm ${index + 1}`}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMTI1IDEwMEgxNzVMMTAwIDEyNUwyNSAxMDBINzVMMTAwIDc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                </div>
                
                {(image.title || image.description) && (
                  <div className="mt-3">
                    {image.title && (
                      <h3 className="text-white font-semibold text-lg">
                        {image.title}
                      </h3>
                    )}
                    {image.description && (
                      <p className="text-gray-300 text-sm mt-1">
                        {image.description}
                      </p>
                    )}
                    {image.artist && (
                      <p className="text-gray-400 text-xs mt-1">
                        Tác giả: {image.artist}
                      </p>
                    )}
                    {image.date && (
                      <p className="text-gray-400 text-xs">
                        Năm: {image.date}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-white text-sm">
            {images.length} tác phẩm • Sử dụng phím mũi tên để điều hướng
          </p>
        </div>
      </div>

      {/* Keyboard Navigation Info */}
      <div className="absolute top-6 right-6">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3">
          <p className="text-white text-xs">
            <span className="block">← → Điều hướng</span>
            <span className="block">ESC Thoát</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FallbackGallery;
