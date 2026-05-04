import { useState, useEffect } from "react";
import { ImageMetadata } from "./types/museum";
import { drawingImages } from "./config/imagesConfig";
import SwipeableContainer from "./components/ui/SwipeableContainer";
import { TourProvider } from "./contexts/TourContext";
import { AnimationProvider } from "./contexts/AnimationContext";
import { ImageProvider, useImages } from "./contexts/ImageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { imageService } from "./services/imageService";
import Scene from "./components/Scene";
import UIElements from "./components/ui/UIElements";
import ImageManager from "./components/admin/ImageManager";
import LoginForm from "./components/admin/LoginForm";
import AdminButton from "./components/admin/AdminButton";

function AppContent() {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { images: apiImages, loading } = useImages();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Fallback to static images if API fails or no images available
    if (apiImages.length > 0) {
      const convertedImages = apiImages.map(imageService.convertToImageMetadata);
      setImages(convertedImages);
    } else if (!loading) {
      // Use static images as fallback
      setImages(drawingImages);
    }
  }, [apiImages, loading]);

  return (
    <div className="relative w-full h-screen">
      <AnimationProvider>
        <TourProvider totalFrames={images.length}>
          <SwipeableContainer>
            <Scene images={images} />
            <UIElements />
            <AdminButton 
              onShowImageManager={() => setShowImageManager(true)}
              onShowLoginForm={() => setShowLoginForm(true)}
            />
          </SwipeableContainer>
        </TourProvider>
      </AnimationProvider>
      
      
      {showLoginForm && (
        <LoginForm onClose={() => setShowLoginForm(false)} />
      )}
      
      {showImageManager && isAuthenticated && (
        <ImageManager onClose={() => setShowImageManager(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ImageProvider>
        <AppContent />
      </ImageProvider>
    </AuthProvider>
  );
}

export default App;
