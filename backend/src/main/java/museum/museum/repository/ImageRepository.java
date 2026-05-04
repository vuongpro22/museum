package museum.museum.repository;

import museum.museum.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    
    List<Image> findAllByOrderByPositionAsc();
    
    Optional<Image> findByPosition(Integer position);
    
    @Query("SELECT MAX(i.position) FROM Image i")
    Optional<Integer> findMaxPosition();
    
    List<Image> findByTitleContainingIgnoreCase(String title);
}
