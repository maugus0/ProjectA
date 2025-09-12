# User Entity Field Organization Proposal

## Why Field Order Matters in MyBatis
- **Constructor mapping dependency**: MyBatis requires fields in exact order as constructor parameters
- **Maintenance**: Logical grouping makes code easier to understand and modify
- **Database consistency**: Aligns with typical database column organization patterns

## Proposed Field Order (Logical Grouping)

### 1. Primary Key & Core Identity
```java
private String uuid;           // PRIMARY KEY - should be first!
```

### 2. Authentication & Authorization
```java
private String email;          // Unique identifier for login
private String username;       // Display name/handle
private String hashPassword;   // Encrypted password
private Boolean emailVerified; // Email verification status
```

### 3. Profile Information
```java
private String avatarUrl;      // Profile image
private String profileDetail;  // Bio/description
private Date birthday;         // User's birthday
private Integer gender;        // Gender identifier
```

### 4. System Status & Permissions
```java
private Integer status;        // Account status (active/inactive/banned)
private Boolean isAuthor;      // Author privileges
private Boolean authorVerified; // Author verification status
```

### 5. Gamification & Stats
```java
private Integer level;         // User level
private Float yuan;            // Points/currency (renamed from point)
private Integer exp;           // Experience points
private Float readTime;        // Total reading time
private Integer readBookNum;   // Books read count
```

### 6. Audit Fields (Always Last)
```java
private Date createDate;       // Record creation timestamp
private Date updateDate;       // Last modification timestamp
```

## Constructor Order
```java
public User(
    // 1. Primary Key
    String uuid,
    
    // 2. Authentication
    String email,
    String username, 
    String hashPassword,
    Boolean emailVerified,
    
    // 3. Profile
    String avatarUrl,
    String profileDetail,
    Date birthday,
    Integer gender,
    
    // 4. System Status
    Integer status,
    Boolean isAuthor,
    Boolean authorVerified,
    
    // 5. Gamification
    Integer level,
    Float point,
    Integer exp,
    Float readTime,
    Integer readBookNum,
    
    // 6. Audit
    Date createDate,
    Date updateDate
) { ... }
```

## MyBatis XML ResultMap Order
```xml
<resultMap id="BaseResultMap" type="com.yushan.backend.entity.User">
  <constructor>
    <!-- 1. Primary Key -->
    <arg column="uuid" javaType="java.lang.String" jdbcType="VARCHAR" />
    
    <!-- 2. Authentication -->
    <arg column="email" javaType="java.lang.String" jdbcType="VARCHAR" />
    <arg column="username" javaType="java.lang.String" jdbcType="VARCHAR" />
    <arg column="hash_password" javaType="java.lang.String" jdbcType="VARCHAR" />
    <arg column="email_verified" javaType="java.lang.Boolean" jdbcType="BIT" />
    
    <!-- 3. Profile -->
    <arg column="avatar_url" javaType="java.lang.String" jdbcType="VARCHAR" />
    <arg column="profile_detail" javaType="java.lang.String" jdbcType="VARCHAR" />
    <arg column="birthday" javaType="java.util.Date" jdbcType="DATE" />
    <arg column="gender" javaType="java.lang.Integer" jdbcType="INTEGER" />
    
    <!-- 4. System Status -->
    <arg column="status" javaType="java.lang.Integer" jdbcType="INTEGER" />
    <arg column="is_author" javaType="java.lang.Boolean" jdbcType="BIT" />
    <arg column="author_verified" javaType="java.lang.Boolean" jdbcType="BIT" />
    
    <!-- 5. Gamification -->
    <arg column="level" javaType="java.lang.Integer" jdbcType="INTEGER" />
    <arg column="point" javaType="java.lang.Float" jdbcType="REAL" />
    <arg column="exp" javaType="java.lang.Integer" jdbcType="INTEGER" />
    <arg column="read_time" javaType="java.lang.Float" jdbcType="REAL" />
    <arg column="read_book_num" javaType="java.lang.Integer" jdbcType="INTEGER" />
    
    <!-- 6. Audit -->
    <arg column="create_date" javaType="java.util.Date" jdbcType="TIMESTAMP" />
    <arg column="update_date" javaType="java.util.Date" jdbcType="TIMESTAMP" />
    <arg column="last_login" javaType="java.util.Date" jdbcType="TIMESTAMP" />
    <arg column="last_active" javaType="java.util.Date" jdbcType="TIMESTAMP" />
  </constructor>
</resultMap>
```

## Benefits of This Organization

1. **UUID as Primary Key**: Better for distributed systems, no auto-increment dependencies
2. **Logical Grouping**: Related fields are together, easier to understand
3. **Standard Pattern**: Authentication → Profile → System → Features → Audit
4. **Maintainability**: When adding new fields, clear where they belong
5. **Database Alignment**: Matches typical database design patterns

## Migration Considerations

- This requires updating both the Java entity and XML mapper simultaneously
- All constructor calls in code will need to be updated
- Consider creating a builder pattern to avoid order dependency in the future
- Test thoroughly as field order changes can cause subtle bugs

## Alternative: Builder Pattern (Future Enhancement)
Consider implementing a Builder pattern to reduce constructor order dependency:
```java
User user = User.builder()
    .uuid(uuid)
    .email(email)
    .username(username)
    .build();
```
