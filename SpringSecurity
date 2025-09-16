# Spring Boot + PostgreSQL Webnovel Platform Integration

## Database Schema Modifications for Spring Boot

### 1. Enhanced User Table (Required for Spring Boot)
```sql
CREATE TABLE users (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- BCrypt hash
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    level INTEGER NOT NULL DEFAULT 1,
    total_xp BIGINT NOT NULL DEFAULT 0,
    yuan_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_chapters_read INTEGER NOT NULL DEFAULT 0,
    total_novels_completed INTEGER NOT NULL DEFAULT 0,
    is_author BOOLEAN NOT NULL DEFAULT FALSE,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Spring Security Tables
```sql
-- Authority/Role table
CREATE TABLE authorities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE -- ROLE_USER, ROLE_AUTHOR, ROLE_ADMIN
);

-- User authorities junction
CREATE TABLE user_authorities (
    user_uuid UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
    authority_id BIGINT NOT NULL REFERENCES authorities(id) ON DELETE CASCADE,
    PRIMARY KEY (user_uuid, authority_id)
);

-- OAuth2 integration (if needed)
CREATE TABLE oauth2_authorized_client (
    client_registration_id VARCHAR(100) NOT NULL,
    principal_name VARCHAR(200) NOT NULL,
    access_token_type VARCHAR(100) NOT NULL,
    access_token_value BYTEA NOT NULL,
    access_token_issued_at TIMESTAMP NOT NULL,
    access_token_expires_at TIMESTAMP NOT NULL,
    access_token_scopes VARCHAR(1000),
    refresh_token_value BYTEA,
    refresh_token_issued_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (client_registration_id, principal_name)
);
```

## JPA Entity Classes

### Base Entity
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // getters and setters
}
```

### User Entity
```java
@Entity
@Table(name = "users")
public class User extends BaseEntity implements UserDetails {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "uuid", updatable = false, nullable = false)
    private UUID uuid;
    
    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(name = "email", unique = true, nullable = false)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "display_name", length = 100)
    private String displayName;
    
    @Column(name = "level")
    private Integer level = 1;
    
    @Column(name = "total_xp")
    private Long totalXp = 0L;
    
    @Column(name = "yuan_balance", precision = 10, scale = 2)
    private BigDecimal yuanBalance = BigDecimal.ZERO;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "email_verified")
    private Boolean emailVerified = false;
    
    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(
        name = "user_authorities",
        joinColumns = @JoinColumn(name = "user_uuid"),
        inverseJoinColumns = @JoinColumn(name = "authority_id")
    )
    private Set<Authority> authorities = new HashSet<>();
    
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    private Set<Novel> novels = new HashSet<>();
    
    // UserDetails implementation
    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities.stream()
            .map(authority -> new SimpleGrantedAuthority(authority.getName()))
            .collect(Collectors.toList());
    }
    
    @Override
    @JsonIgnore
    public String getPassword() {
        return passwordHash;
    }
    
    @Override
    public boolean isAccountNonExpired() { return true; }
    
    @Override
    public boolean isAccountNonLocked() { return true; }
    
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    
    @Override
    public boolean isEnabled() { return isActive && emailVerified; }
}
```

### Novel Entity
```java
@Entity
@Table(name = "novels")
public class Novel extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "uuid", unique = true, nullable = false)
    private UUID uuid = UUID.randomUUID();
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @Column(name = "synopsis", columnDefinition = "TEXT")
    private String synopsis;
    
    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;
    
    @Enumerated(EnumType.ORDINAL)
    @Column(name = "status", nullable = false)
    private NovelStatus status = NovelStatus.ONGOING;
    
    @Column(name = "total_chapters")
    private Integer totalChapters = 0;
    
    @Column(name = "total_words")
    private Long totalWords = 0L;
    
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;
    
    @Column(name = "total_reviews")
    private Integer totalReviews = 0;
    
    @Column(name = "total_views")
    private Long totalViews = 0L;
    
    @Column(name = "yuan_received", precision = 10, scale = 2)
    private BigDecimal yuanReceived = BigDecimal.ZERO;
    
    @Column(name = "is_premium")
    private Boolean isPremium = false;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Type(type = "string-array")
    @Column(name = "tags", columnDefinition = "text[]")
    private String[] tags;
    
    @Type(type = "string-array")
    @Column(name = "content_warning", columnDefinition = "text[]")
    private String[] contentWarnings;
    
    @OneToMany(mappedBy = "novel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("chapterNumber ASC")
    private List<Chapter> chapters = new ArrayList<>();
    
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "novel_genres",
        joinColumns = @JoinColumn(name = "novel_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new HashSet<>();
    
    @OneToMany(mappedBy = "novel", cascade = CascadeType.ALL)
    private Set<Review> reviews = new HashSet<>();
    
    @OneToMany(mappedBy = "novel", cascade = CascadeType.ALL)
    private Set<Vote> votes = new HashSet<>();
}

public enum NovelStatus {
    ONGOING(1), COMPLETED(2), HIATUS(3), DROPPED(4);
    
    private final int value;
    
    NovelStatus(int value) {
        this.value = value;
    }
    
    public int getValue() {
        return value;
    }
}
```

### Chapter Entity
```java
@Entity
@Table(name = "chapters", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"novel_id", "chapter_number"}))
public class Chapter extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "uuid", unique = true, nullable = false)
    private UUID uuid = UUID.randomUUID();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "novel_id", nullable = false)
    private Novel novel;
    
    @Column(name = "chapter_number", nullable = false)
    private Integer chapterNumber;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Lob
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "word_count")
    private Integer wordCount = 0;
    
    @Column(name = "is_premium")
    private Boolean isPremium = false;
    
    @Column(name = "yuan_cost", precision = 5, scale = 2)
    private BigDecimal yuanCost = BigDecimal.ZERO;
    
    @Column(name = "view_count")
    private Long viewCount = 0L;
    
    @Column(name = "is_published")
    private Boolean isPublished = false;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL)
    private Set<Comment> comments = new HashSet<>();
}
```

## Spring Boot Configuration

### Application Properties
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/webnovel_db
spring.datasource.username=${DB_USERNAME:webnovel_user}
spring.datasource.password=${DB_PASSWORD:your_password}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true

# Connection Pool (HikariCP)
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5

# Flyway Migration
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true

# JWT Configuration
jwt.secret=${JWT_SECRET:your-secret-key}
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Redis (for caching)
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.timeout=2000ms

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${EMAIL_USERNAME}
spring.mail.password=${EMAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Maven Dependencies
```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-cache</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Redis -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    
    <!-- Migration -->
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- JSON Processing -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
    
    <!-- Array Support for PostgreSQL -->
    <dependency>
        <groupId>com.vladmihalcea</groupId>
        <artifactId>hibernate-types-52</artifactId>
        <version>2.21.1</version>
    </dependency>
    
    <!-- File Upload -->
    <dependency>
        <groupId>commons-io</groupId>
        <artifactId>commons-io</artifactId>
        <version>2.11.0</version>
    </dependency>
</dependencies>
```

## Repository Interfaces

### Novel Repository
```java
@Repository
public interface NovelRepository extends JpaRepository<Novel, Long>, JpaSpecificationExecutor<Novel> {
    
    Optional<Novel> findByUuid(UUID uuid);
    
    List<Novel> findByAuthorUuidOrderByCreatedAtDesc(UUID authorUuid);
    
    @Query("SELECT n FROM Novel n WHERE n.isFeatured = true ORDER BY n.createdAt DESC")
    List<Novel> findFeaturedNovels(Pageable pageable);
    
    @Query("SELECT n FROM Novel n JOIN n.genres g WHERE g.id = :genreId ORDER BY n.averageRating DESC")
    List<Novel> findByGenreOrderByRating(@Param("genreId") Long genreId, Pageable pageable);
    
    @Query("SELECT n FROM Novel n WHERE " +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.synopsis) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.author.displayName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Novel> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Modifying
    @Query("UPDATE Novel n SET n.totalViews = n.totalViews + 1 WHERE n.id = :novelId")
    void incrementViewCount(@Param("novelId") Long novelId);
    
    @Query("SELECT COUNT(n) FROM Novel n WHERE n.author.uuid = :authorUuid")
    long countByAuthorUuid(@Param("authorUuid") UUID authorUuid);
}
```

### Custom Repository with Specifications
```java
@Service
public class NovelSpecifications {
    
    public static Specification<Novel> hasGenre(Long genreId) {
        return (root, query, criteriaBuilder) -> {
            if (genreId == null) return null;
            
            Join<Novel, Genre> genreJoin = root.join("genres", JoinType.INNER);
            return criteriaBuilder.equal(genreJoin.get("id"), genreId);
        };
    }
    
    public static Specification<Novel> hasStatus(NovelStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) return null;
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }
    
    public static Specification<Novel> isActive() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("author").get("isActive"), true);
    }
    
    public static Specification<Novel> searchByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) return null;
            
            String likePattern = "%" + keyword.toLowerCase() + "%";
            
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likePattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("synopsis")), likePattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("author").get("displayName")), likePattern)
            );
        };
    }
}
```

## Service Layer Example

```java
@Service
@Transactional
public class NovelService {
    
    private final NovelRepository novelRepository;
    private final ChapterRepository chapterRepository;
    private final NotificationService notificationService;
    private final RedisTemplate<String, Object> redisTemplate;
    
    public NovelService(NovelRepository novelRepository, 
                       ChapterRepository chapterRepository,
                       NotificationService notificationService,
                       RedisTemplate<String, Object> redisTemplate) {
        this.novelRepository = novelRepository;
        this.chapterRepository = chapterRepository;
        this.notificationService = notificationService;
        this.redisTemplate = redisTemplate;
    }
    
    @Cacheable(value = "novels", key = "#uuid")
    public NovelDTO getNovelByUuid(UUID uuid) {
        Novel novel = novelRepository.findByUuid(uuid)
            .orElseThrow(() -> new EntityNotFoundException("Novel not found"));
            
        // Increment view count asynchronously
        CompletableFuture.runAsync(() -> {
            novelRepository.incrementViewCount(novel.getId());
            redisTemplate.delete("novels::" + uuid); // Invalidate cache
        });
        
        return NovelMapper.toDTO(novel);
    }
    
    public Page<NovelDTO> searchNovels(NovelSearchCriteria criteria, Pageable pageable) {
        Specification<Novel> spec = Specification.where(NovelSpecifications.isActive())
            .and(NovelSpecifications.hasGenre(criteria.getGenreId()))
            .and(NovelSpecifications.hasStatus(criteria.getStatus()))
            .and(NovelSpecifications.searchByKeyword(criteria.getKeyword()));
            
        Page<Novel> novels = novelRepository.findAll(spec, pageable);
        return novels.map(NovelMapper::toDTO);
    }
    
    public NovelDTO createNovel(CreateNovelRequest request, UUID authorUuid) {
        User author = userService.findByUuid(authorUuid);
        
        Novel novel = Novel.builder()
            .title(request.getTitle())
            .synopsis(request.getSynopsis())
            .author(author)
            .category(categoryService.findById(request.getCategoryId()))
            .status(NovelStatus.ONGOING)
            .build();
            
        if (request.getGenreIds() != null) {
            Set<Genre> genres = genreService.findByIds(request.getGenreIds());
            novel.setGenres(genres);
        }
        
        Novel savedNovel = novelRepository.save(novel);
        
        // Send notification to followers
        notificationService.notifyFollowers(author, "New novel published: " + novel.getTitle());
        
        return NovelMapper.toDTO(savedNovel);
    }
}
```

## Key Changes for Spring Boot Integration:

1. **Entity Relationships**: Added proper JPA annotations and relationship mappings
2. **Security Integration**: Added Spring Security tables and UserDetails implementation
3. **Caching**: Added Redis caching for frequently accessed data
4. **Database Migration**: Using Flyway for schema versioning
5. **Connection Pooling**: HikariCP for efficient connection management
6. **Specifications**: Dynamic query building for complex search functionality
7. **DTOs and Mappers**: Separation of entity and API models
8. **Async Processing**: For non-critical operations like view counting
9. **Validation**: Bean validation annotations for request validation
10. **Exception Handling**: Proper error handling and custom exceptions

The PostgreSQL schema remains largely the same, but the Spring Boot integration adds proper ORM mapping, security, caching, and modern Java backend patterns.
