# Webnovel Platform Database Schema

## 1. Category Table
```sql
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2. Novel Table
```sql
CREATE TABLE novels (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author_id UUID NOT NULL REFERENCES users(uuid),
    category_id BIGINT NOT NULL REFERENCES categories(id),
    synopsis TEXT,
    cover_image_url VARCHAR(500),
    status INTEGER NOT NULL DEFAULT 1, -- 1: Ongoing, 2: Completed, 3: Hiatus, 4: Dropped
    total_chapters INTEGER NOT NULL DEFAULT 0,
    total_words BIGINT NOT NULL DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    total_views BIGINT NOT NULL DEFAULT 0,
    total_votes INTEGER NOT NULL DEFAULT 0,
    yuan_received DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT[], -- Array for tags like ["fantasy", "adventure", "romance"]
    content_warning TEXT[], -- Array for content warnings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);
```

## 3. Chapter Table
```sql
CREATE TABLE chapters (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    novel_id BIGINT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    yuan_cost DECIMAL(5,2) DEFAULT 0.00, -- Cost to unlock premium chapters
    view_count BIGINT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    UNIQUE(novel_id, chapter_number)
);
```

## 4. Library Table (User's Personal Library)
```sql
CREATE TABLE libraries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(uuid),
    novel_id BIGINT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    status INTEGER NOT NULL DEFAULT 1, -- 1: Reading, 2: Completed, 3: Plan to Read, 4: Dropped, 5: On Hold
    last_read_chapter_id BIGINT REFERENCES chapters(id),
    reading_progress DECIMAL(5,2) DEFAULT 0.00, -- Percentage of completion
    personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
    personal_notes TEXT,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    UNIQUE(user_id, novel_id)
);
```

## 5. Review Table
```sql
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(uuid),
    novel_id BIGINT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT NOT NULL,
    likes_count INTEGER NOT NULL DEFAULT 0,
    dislikes_count INTEGER NOT NULL DEFAULT 0,
    is_spoiler BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified_reader BOOLEAN NOT NULL DEFAULT FALSE, -- User has read significant portion
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, novel_id)
);
```

## 6. Comment Table
```sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(uuid),
    chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES comments(id), -- For nested comments/replies
    content TEXT NOT NULL,
    likes_count INTEGER NOT NULL DEFAULT 0,
    dislikes_count INTEGER NOT NULL DEFAULT 0,
    is_spoiler BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 7. Vote Table (Yuan Voting System)
```sql
CREATE TABLE votes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(uuid),
    novel_id BIGINT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    yuan_amount DECIMAL(10,2) NOT NULL CHECK (yuan_amount > 0),
    vote_type INTEGER NOT NULL DEFAULT 1, -- 1: Support, 2: Gift, 3: Tip
    message TEXT, -- Optional message with the vote
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(novel_id, created_at),
    INDEX(user_id, created_at)
);
```

## 8. User Reading History Table
```sql
CREATE TABLE reading_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(uuid),
    chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    novel_id BIGINT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    reading_time_seconds INTEGER NOT NULL DEFAULT 0,
    xp_gained INTEGER NOT NULL DEFAULT 0,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(user_id, read_at),
    INDEX(novel_id, read_at)
);
```

## 9. Genre Table
```sql
CREATE TABLE genres (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(50) NOT NULL UNIQUE,
    color_hex VARCHAR(7), -- For UI display like #FF5733
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 10. Novel Genres Junction Table (Many-to-Many)
```sql
CREATE TABLE novel_genres (
    id BIGSERIAL PRIMARY KEY,
    novel_id BIGINT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    genre_id BIGINT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(novel_id, genre_id)
);
```

## 11. Notification System Tables

### Notification Types Table
```sql
CREATE TABLE notification_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE, -- 'vote_received', 'new_review', 'new_comment', etc.
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(uuid),
    sender_id UUID REFERENCES users(uuid), -- NULL for system notifications
    notification_type_id INTEGER NOT NULL REFERENCES notification_types(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50), -- 'novel', 'chapter', 'comment', 'review', 'vote'
    related_entity_id BIGINT, -- ID of the related entity
    action_url VARCHAR(500), -- Deep link to the relevant page
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    priority INTEGER NOT NULL DEFAULT 1, -- 1: Low, 2: Medium, 3: High, 4: Critical
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    expires_at TIMESTAMP, -- For temporary notifications
    INDEX(recipient_id, is_read, created_at),
    INDEX(created_at, expires_at)
);
```

### User Notification Preferences Table
```sql
CREATE TABLE user_notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(uuid),
    notification_type_id INTEGER NOT NULL REFERENCES notification_types(id),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    delivery_method INTEGER NOT NULL DEFAULT 1, -- 1: In-app, 2: Email, 3: Both
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type_id)
);
```

## 12. Achievement System Tables

### Achievement Categories Table
```sql
CREATE TABLE achievement_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### Achievements Table
```sql
CREATE TABLE achievements (
    id BIGSERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES achievement_categories(id),
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    requirement_description TEXT NOT NULL, -- "Read 100 chapters"
    icon_url VARCHAR(500),
    badge_url VARCHAR(500), -- Special badge image
    rarity INTEGER NOT NULL DEFAULT 1, -- 1: Common, 2: Rare, 3: Epic, 4: Legendary, 5: Mythic
    xp_reward INTEGER NOT NULL DEFAULT 0,
    yuan_reward DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    requirement_type VARCHAR(50) NOT NULL, -- 'chapter_read', 'novel_completed', 'vote_given', etc.
    requirement_count INTEGER NOT NULL DEFAULT 1, -- How many times to trigger
    requirement_meta JSONB, -- Additional requirements {"novel_category": "fantasy"}
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE, -- Hidden until unlocked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Achievements Table
```sql
CREATE TABLE user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(uuid),
    achievement_id BIGINT NOT NULL REFERENCES achievements(id),
    progress INTEGER NOT NULL DEFAULT 0, -- Current progress towards achievement
    max_progress INTEGER NOT NULL DEFAULT 1, -- Total needed for achievement
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    claimed_at TIMESTAMP, -- When user claimed the rewards
    is_showcased BOOLEAN NOT NULL DEFAULT FALSE, -- Display on profile
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id),
    INDEX(user_id, is_completed),
    INDEX(achievement_id, is_completed)
);
```

### Achievement Progress Tracking Table
```sql
CREATE TABLE achievement_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(uuid),
    achievement_type VARCHAR(50) NOT NULL, -- 'chapters_read', 'novels_completed', etc.
    current_count INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB, -- Extra tracking data
    UNIQUE(user_id, achievement_type)
);
```

## Key Relationships:

### Primary Relationships:
- **User** ↔ **Novel**: One-to-Many (Users can write multiple novels)
- **Category** ↔ **Novel**: One-to-Many (Categories can have multiple novels)
- **Genre** ↔ **Novel**: Many-to-Many (Novels can have multiple genres, genres can have multiple novels)
- **Novel** ↔ **Chapter**: One-to-Many (Novels have multiple chapters)
- **User** ↔ **Library**: One-to-Many (Users have personal libraries with multiple novels)
- **User** ↔ **Review**: One-to-Many (Users can write multiple reviews)
- **User** ↔ **Comment**: One-to-Many (Users can make multiple comments)
- **Chapter** ↔ **Comment**: One-to-Many (Chapters can have multiple comments)
- **User** ↔ **Notification**: One-to-Many (Users receive multiple notifications)
- **User** ↔ **Achievement**: Many-to-Many (Users can earn multiple achievements)

### Gamification Features:
- **XP System**: Tracked in user table + reading_history for XP gains + achievement rewards
- **Yuan Economy**: User balance in user table + votes table for spending + achievement rewards
- **Levels**: Calculated from XP in user table
- **Reading Progress**: Tracked in library table
- **Achievement System**: Complete system with categories, progress tracking, and rewards
- **Notification System**: Real-time notifications for authors and readers

### Advanced Features:
- **Multi-Genre Support**: Novels can have multiple genres (fantasy + romance + adventure)
- **Achievement Progression**: Track progress towards achievements with metadata
- **Notification Preferences**: Users can customize what notifications they receive
- **Rarity System**: Achievements have rarity levels (Common to Mythic)
- **Hidden Achievements**: Some achievements are secret until unlocked

### Indexes for Performance:
```sql
-- Novel indexes
CREATE INDEX idx_novels_author ON novels(author_id);
CREATE INDEX idx_novels_category ON novels(category_id);
CREATE INDEX idx_novels_status ON novels(status);
CREATE INDEX idx_novels_featured ON novels(is_featured);

-- Chapter indexes  
CREATE INDEX idx_chapters_novel ON chapters(novel_id);
CREATE INDEX idx_chapters_published ON chapters(is_published, published_at);

-- Library indexes
CREATE INDEX idx_library_user ON libraries(user_id);
CREATE INDEX idx_library_status ON libraries(user_id, status);

-- Comment indexes
CREATE INDEX idx_comments_chapter ON comments(chapter_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- Review indexes
CREATE INDEX idx_reviews_novel ON reviews(novel_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Genre indexes
CREATE INDEX idx_novel_genres_novel ON novel_genres(novel_id);
CREATE INDEX idx_novel_genres_genre ON novel_genres(genre_id);

-- Notification indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type_id);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Achievement indexes
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id, is_completed);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX idx_achievement_progress_user ON achievement_progress(user_id);
```

## Sample Data for Initial Setup:

### Notification Types
```sql
INSERT INTO notification_types (type_name, display_name, description) VALUES
('vote_received', 'Vote Received', 'When someone votes on your novel with yuan'),
('new_review', 'New Review', 'When someone reviews your novel'),
('new_comment', 'New Comment', 'When someone comments on your chapter'),
('chapter_published', 'Chapter Published', 'When authors you follow publish new chapters'),
('achievement_unlocked', 'Achievement Unlocked', 'When you unlock a new achievement'),
('level_up', 'Level Up', 'When you reach a new level'),
('novel_featured', 'Novel Featured', 'When your novel gets featured'),
('milestone_reached', 'Milestone Reached', 'When your novel reaches view/vote milestones');
```

### Achievement Categories
```sql
INSERT INTO achievement_categories (name, description, display_order) VALUES
('Reading', 'Achievements for reading novels and chapters', 1),
('Writing', 'Achievements for authors and content creation', 2),
('Social', 'Achievements for community interaction', 3),
('Economy', 'Achievements for yuan spending and earning', 4),
('Special', 'Rare and special achievements', 5);
```

### Sample Genres
```sql
INSERT INTO genres (name, description, slug, color_hex) VALUES
('Fantasy', 'Magic, mythical creatures, and otherworldly adventures', 'fantasy', '#8B5CF6'),
('Romance', 'Love stories and romantic relationships', 'romance', '#F97316'),
('Sci-Fi', 'Science fiction and futuristic themes', 'sci-fi', '#06B6D4'),
('Mystery', 'Suspense, detective work, and puzzles', 'mystery', '#6B7280'),
('Action', 'High-energy adventures and combat', 'action', '#DC2626'),
('Drama', 'Emotional and character-driven stories', 'drama', '#7C3AED'),
('Comedy', 'Humorous and lighthearted content', 'comedy', '#F59E0B'),
('Horror', 'Scary and supernatural themes', 'horror', '#1F2937'),
('Slice of Life', 'Everyday life and realistic scenarios', 'slice-of-life', '#10B981'),
('Historical', 'Set in past time periods', 'historical', '#92400E');
```

### Sample Achievements
```sql
INSERT INTO achievements (category_id, name, description, requirement_description, rarity, xp_reward, yuan_reward, requirement_type, requirement_count) VALUES
(1, 'First Steps', 'Read your first chapter', 'Read 1 chapter', 1, 10, 0, 'chapter_read', 1),
(1, 'Bookworm', 'Read 100 chapters', 'Read 100 chapters', 2, 100, 5.00, 'chapter_read', 100),
(1, 'Novel Completionist', 'Complete your first novel', 'Complete 1 novel', 2, 200, 10.00, 'novel_completed', 1),
(2, 'First Publication', 'Publish your first chapter', 'Publish 1 chapter', 1, 50, 2.00, 'chapter_published', 1),
(2, 'Prolific Writer', 'Publish 100 chapters', 'Publish 100 chapters', 3, 500, 50.00, 'chapter_published', 100),
(3, 'Socialite', 'Leave your first comment', 'Leave 1 comment', 1, 5, 0, 'comment_made', 1),
(4, 'Generous Reader', 'Vote with yuan for the first time', 'Vote with yuan once', 1, 20, 0, 'yuan_voted', 1),
(5, 'Rising Star', 'Get 1000 votes on a single novel', 'Receive 1000 votes', 4, 1000, 100.00, 'novel_votes_received', 1000);
```
