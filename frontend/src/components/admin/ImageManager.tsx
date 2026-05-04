import { useState } from 'react';
import { useImages } from '../../contexts/ImageContext';
import { useAuth } from '../../contexts/AuthContext';

interface ImageManagerProps {
  onClose: () => void;
}

const ImageManager = ({ onClose }: ImageManagerProps) => {
  const { images, loading, error, uploadImage, updateImage, deleteImage } = useImages();
  const { logout } = useAuth();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: '',
    description: '',
    position: 0
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    position: 0
  });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title) return;

    try {
      await uploadImage(uploadForm.file, uploadForm.title, uploadForm.description, uploadForm.position);
      setUploadForm({ file: null, title: '', description: '', position: 0 });
      setShowUploadForm(false);
      // Refresh images để hiển thị ảnh mới
      window.location.reload();
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    try {
      await updateImage(selectedImage, {
        title: editForm.title,
        description: editForm.description,
        position: editForm.position
      });
      setSelectedImage(null);
      // Refresh images để hiển thị thay đổi
      window.location.reload();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteImage(id);
      setShowDeleteConfirm(null);
      // Refresh images để hiển thị thay đổi
      window.location.reload();
    } catch (err) {
      console.error('Delete failed:', err);
      setShowDeleteConfirm(null);
    }
  };

  const startEdit = (image: any) => {
    setSelectedImage(image.id);
    setEditForm({
      title: image.title,
      description: image.description || '',
      position: image.position || 0
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold">Image Manager</h2>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Action Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded text-sm sm:text-base hover:bg-blue-600 transition-colors flex-1 sm:flex-none"
            >
              Upload New Image
            </button>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded text-sm sm:text-base hover:bg-red-600 transition-colors flex-1 sm:flex-none"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showUploadForm && (
          <div className="mb-6 p-4 border rounded">
            <h3 className="text-lg font-semibold mb-3">Upload New Image</h3>
            <form onSubmit={handleUpload}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <input
                    type="number"
                    value={uploadForm.position}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                <img
                  src={image.cloudinaryUrl}
                  alt={image.title}
                  className="w-full h-24 sm:h-32 object-cover rounded mb-3"
                />
                <h4 className="font-semibold text-sm sm:text-base mb-1">{image.title}</h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{image.description}</p>
                <p className="text-xs text-gray-500 mb-3">Position: {image.position}</p>
                
                {selectedImage === image.id ? (
                  <form onSubmit={handleUpdate}>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Title"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Description"
                        rows={2}
                      />
                      <input
                        type="number"
                        value={editForm.position}
                        onChange={(e) => setEditForm(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Position"
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex-1"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(image)}
                      className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(image.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors flex-1"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {images.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No images found. Upload your first image to get started.
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Image</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this image? The image will be removed from the gallery but will remain on Cloudinary.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManager;
