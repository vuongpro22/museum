package museum.museum.service;

import museum.museum.entity.Image;
import museum.museum.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class ImageService {
    
    @Autowired
    private ImageRepository imageRepository;
    
    @Autowired
    private CloudinaryService cloudinaryService;
    
    public List<Image> getAllImages() {
        return imageRepository.findAllByOrderByPositionAsc();
    }
    
    public Optional<Image> getImageById(Long id) {
        return imageRepository.findById(id);
    }
    
    public Image uploadImage(MultipartFile file, String title, String description, Integer position) throws IOException {
        // Upload to Cloudinary
        String cloudinaryUrl = cloudinaryService.uploadImage(file);
        
        // Kiểm tra xem đã có ảnh với position này chưa
        Optional<Image> existingImageOpt = imageRepository.findByPosition(position);
        
        Image image;
        if (existingImageOpt.isPresent()) {
            // Thay thế ảnh cũ
            Image existingImage = existingImageOpt.get();
            existingImage.setTitle(title);
            existingImage.setCloudinaryUrl(cloudinaryUrl);
            existingImage.setDescription(description);
            image = existingImage;
        } else {
            // Tạo ảnh mới
            image = new Image(title, cloudinaryUrl, description, position);
        }
        
        // Save to database
        return imageRepository.save(image);
    }
    
    public Image updateImage(Long id, MultipartFile file, String title, String description, Integer position) throws IOException {
        Optional<Image> existingImageOpt = imageRepository.findById(id);
        if (existingImageOpt.isEmpty()) {
            throw new RuntimeException("Image not found");
        }
        
        Image existingImage = existingImageOpt.get();
        
        // If position is being changed, check if new position already exists
        if (position != null && !position.equals(existingImage.getPosition())) {
            Optional<Image> positionConflictOpt = imageRepository.findByPosition(position);
            if (positionConflictOpt.isPresent() && !positionConflictOpt.get().getId().equals(id)) {
                // Xóa ảnh cũ ở position mới
                imageRepository.deleteById(positionConflictOpt.get().getId());
            }
        }
        
        // If new file is provided, upload to Cloudinary and delete old one
        if (file != null && !file.isEmpty()) {
            String oldUrl = existingImage.getCloudinaryUrl();
            String publicId = cloudinaryService.extractPublicId(oldUrl);
            
            String newCloudinaryUrl = cloudinaryService.uploadImage(file);
            existingImage.setCloudinaryUrl(newCloudinaryUrl);
            
            // Delete old image from Cloudinary
            if (publicId != null) {
                cloudinaryService.deleteImage(publicId);
            }
        }
        
        // Update other fields
        if (title != null) {
            existingImage.setTitle(title);
        }
        if (description != null) {
            existingImage.setDescription(description);
        }
        if (position != null) {
            existingImage.setPosition(position);
        }
        
        return imageRepository.save(existingImage);
    }
    
    public void deleteImage(Long id) throws IOException {
        Optional<Image> imageOpt = imageRepository.findById(id);
        if (imageOpt.isEmpty()) {
            throw new RuntimeException("Image not found");
        }
        
        // Chỉ xóa trong database, giữ lại ảnh trên Cloudinary
        imageRepository.deleteById(id);
    }
    
    public List<Image> searchImages(String title) {
        return imageRepository.findByTitleContainingIgnoreCase(title);
    }
}
