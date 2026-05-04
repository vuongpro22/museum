package museum.museum.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {
    
    private final String uploadUrl;
    private final String apiKey;
    private final String apiSecret;
    private final String cloudName;
    private final RestTemplate restTemplate;
    
    public CloudinaryService(@Value("${cloudinary.cloud-name}") String cloudName,
                           @Value("${cloudinary.api-key}") String apiKey,
                           @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.uploadUrl = "https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload";
        this.restTemplate = new RestTemplate();
    }
    
    @SuppressWarnings("rawtypes")
    public String uploadImage(MultipartFile file) throws IOException {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));
            body.add("upload_preset", "museum_preset"); // You'll need to create this preset in Cloudinary
            body.add("folder", "museum-images");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(uploadUrl, requestEntity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> result = (Map<String, Object>) response.getBody();
                return (String) result.get("secure_url");
            } else {
                throw new IOException("Failed to upload image to Cloudinary");
            }
        } catch (Exception e) {
            throw new IOException("Error uploading image: " + e.getMessage(), e);
        }
    }
    
    @SuppressWarnings("rawtypes")
    public void deleteImage(String publicId) throws IOException {
        try {
            String deleteUrl = "https://api.cloudinary.com/v1_1/" + cloudName + "/image/destroy";
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("public_id", publicId);
            body.add("api_key", apiKey);
            body.add("api_secret", apiSecret);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(deleteUrl, requestEntity, Map.class);
            
            if (response.getStatusCode() != HttpStatus.OK) {
                throw new IOException("Failed to delete image from Cloudinary");
            }
        } catch (Exception e) {
            throw new IOException("Error deleting image: " + e.getMessage(), e);
        }
    }
    
    public String extractPublicId(String url) {
        // Extract public ID from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
        if (url.contains("cloudinary.com")) {
            String[] parts = url.split("/");
            String publicIdWithExtension = parts[parts.length - 1];
            return publicIdWithExtension.split("\\.")[0];
        }
        return null;
    }
    
    // Helper class for file resource
    private static class MultipartInputStreamFileResource extends org.springframework.core.io.InputStreamResource {
        private final String filename;
        
        public MultipartInputStreamFileResource(java.io.InputStream inputStream, String filename) {
            super(inputStream);
            this.filename = filename;
        }
        
        @Override
        public String getFilename() {
            return this.filename;
        }
        
        @Override
        public long contentLength() throws java.io.IOException {
            return -1; // We don't know the length
        }
    }
}
