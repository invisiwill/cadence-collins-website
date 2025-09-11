# Data Model: Cadence Collins Campaign Website

**Date**: 2025-09-10  
**Database**: Supabase (PostgreSQL)  
**Schema Version**: 1.0.0

## Entity Definitions

### MailingListSubscriber
**Purpose**: Store contact information for campaign mailing list  
**Access Pattern**: Insert-heavy, occasional exports to CSV

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE, CHECK (email ~* email_regex) | Subscriber email address |
| name | VARCHAR(100) | NOT NULL | Subscriber full name |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Subscription timestamp |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Subscription status |

**Indexes**:
- `idx_mailing_list_email` ON email (unique constraint)
- `idx_mailing_list_created_at` ON created_at (for chronological exports)

### CampaignEvent  
**Purpose**: Store campaign event information for public display
**Access Pattern**: Read-heavy with occasional admin updates

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| title | VARCHAR(200) | NOT NULL | Event name |
| description | TEXT | NOT NULL | Event details |
| date | TIMESTAMPTZ | NOT NULL | Event date and time |
| location | VARCHAR(300) | NOT NULL | Event venue/address |
| is_published | BOOLEAN | NOT NULL, DEFAULT TRUE | Visibility status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification |

**Indexes**:
- `idx_campaign_events_date` ON date (for chronological listing)
- `idx_campaign_events_published` ON is_published (for filtering)

### ContentBlock
**Purpose**: Store editable content for CMS functionality (bio, policy sections)  
**Access Pattern**: Read-heavy with infrequent admin updates

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| section_key | VARCHAR(50) | NOT NULL, UNIQUE | Content identifier (bio, policy) |
| title | VARCHAR(200) | NOT NULL | Section title |
| content | TEXT | NOT NULL | Section content (markdown supported) |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification |

**Indexes**:
- `idx_content_block_section` ON section_key (for content retrieval)

## Relationships

**None**: This is a simple single-page application with independent entities. No foreign key relationships required.

## Validation Rules

### MailingListSubscriber Validation
- **Email Format**: Must match RFC 5322 email regex pattern
- **Name Length**: 1-100 characters, no special characters except spaces, hyphens, apostrophes
- **Uniqueness**: Email addresses must be unique across all active subscriptions

### CampaignEvent Validation  
- **Date Range**: Events must be future-dated or within last 30 days
- **Title Length**: 1-200 characters
- **Location**: Required, 1-300 characters

### ContentBlock Validation
- **Section Key**: Allowed values: 'bio', 'policy', 'contact'
- **Content**: Markdown format, max 10,000 characters per section

## State Transitions

### MailingListSubscriber States
```
[New] -> [Active] (default state after creation)
[Active] -> [Inactive] (user unsubscribes or admin deactivates)
[Inactive] -> [Active] (resubscription allowed)
```

### CampaignEvent States  
```
[Draft] -> [Published] (admin publishes event)
[Published] -> [Draft] (admin unpublishes event)  
[Published] -> [Archived] (after event date + 7 days, automated)
```

### ContentBlock States
```
[Created] -> [Published] (default state, immediately visible)
[Published] -> [Updated] (admin edits content, triggers updated_at)
```

## Database Schema (SQL)

```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mailing list subscribers table
CREATE TABLE mailing_list_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    name VARCHAR(100) NOT NULL 
        CHECK (length(trim(name)) > 0 AND length(name) <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Campaign events table  
CREATE TABLE campaign_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL 
        CHECK (length(trim(title)) > 0 AND length(title) <= 200),
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL 
        CHECK (date >= NOW() - INTERVAL '30 days'),
    location VARCHAR(300) NOT NULL 
        CHECK (length(trim(location)) > 0 AND length(location) <= 300),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content blocks table
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key VARCHAR(50) NOT NULL UNIQUE 
        CHECK (section_key IN ('bio', 'policy', 'contact')),
    title VARCHAR(200) NOT NULL 
        CHECK (length(trim(title)) > 0 AND length(title) <= 200),
    content TEXT NOT NULL 
        CHECK (length(content) <= 10000),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_mailing_list_email ON mailing_list_subscribers(email);
CREATE INDEX idx_mailing_list_created_at ON mailing_list_subscribers(created_at);
CREATE INDEX idx_campaign_events_date ON campaign_events(date);  
CREATE INDEX idx_campaign_events_published ON campaign_events(is_published);
CREATE INDEX idx_content_block_section ON content_blocks(section_key);

-- Update timestamp trigger for events
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_events_updated_at 
    BEFORE UPDATE ON campaign_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at 
    BEFORE UPDATE ON content_blocks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## TypeScript Interfaces

```typescript
export interface MailingListSubscriber {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_active: boolean;
}

export interface CampaignEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  section_key: 'bio' | 'policy' | 'contact';
  title: string;
  content: string;
  updated_at: string;
}

// Form interfaces
export interface MailingListSignupForm {
  email: string;
  name: string;
}

export interface EventForm {
  title: string;
  description: string;
  date: string;
  location: string;
  is_published: boolean;
}

export interface ContentForm {
  title: string;
  content: string;
}
```

## Performance Considerations

**Query Optimization**:
- Events query: `SELECT * FROM campaign_events WHERE is_published = true ORDER BY date ASC`
- Mailing list export: `SELECT email, name, created_at FROM mailing_list_subscribers WHERE is_active = true ORDER BY created_at DESC`
- Content retrieval: `SELECT * FROM content_blocks WHERE section_key = $1`

**Caching Strategy**:
- Content blocks: Cache for 1 hour (infrequent updates)
- Published events: Cache for 15 minutes (occasional updates)
- Mailing list: No caching (real-time signups important)

**Scaling Considerations**:
- Expected load: <1000 mailing list signups, <50 events per year
- No partitioning needed at current scale
- Connection pooling sufficient for expected traffic