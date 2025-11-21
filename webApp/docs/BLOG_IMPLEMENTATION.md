# Blog Implementation Guide

## Overview

The blog module is now fully integrated into your Repensar application! Visitors can read blog posts about environmental conservation efforts, and admins can manage posts, categories, and tags.

## How Visitors Access the Blog

### 1. **From the Landing Page**

Visitors will see a **"Latest from Our Blog"** section on the homepage (before the contact section):
- Displays the 3 most recent published blog posts
- Shows featured images, titles, excerpts, and metadata
- Includes a "View All Posts" button that links to the full blog

**Location:** Scroll down the landing page to the Blog section (between Team and Contact sections)

### 2. **From the Blog Link**

A new "Blog" link has been added to:
- **Footer navigation** - Available on every page
- **Direct URL:** `/{locale}/blog` (e.g., `/en/blog`, `/pt/blog`)

### 3. **Blog List Page** (`/blog`)

The main blog page features:
- **Grid layout** with all published blog posts
- **Filter sidebar** with:
  - Search functionality
  - Category filter
  - Tag filter
- **Three tabs:**
  - **Posts** - Main blog posts grid with pagination
  - **Categories** - Browse by category
  - **Tags** - Browse all tags
- **Pagination** - Navigate through multiple pages of posts
- **Responsive design** - Works on mobile, tablet, and desktop

### 4. **Individual Blog Post Page** (`/blog/{slug}`)

Each blog post has its own dedicated page featuring:
- Featured image (if available)
- Full post content with rich formatting
- Author information
- Publication date
- Categories and tags (clickable for filtering)
- Related posts section (shows 3 related posts from same category)
- "Back to Blog" button for easy navigation

## How It Looks

### Landing Page Blog Section
```
┌─────────────────────────────────────────┐
│    Latest from Our Blog                 │
│                                         │
│  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ Post 1 │  │ Post 2 │  │ Post 3 │   │
│  │ Image  │  │ Image  │  │ Image  │   │
│  │ Title  │  │ Title  │  │ Title  │   │
│  │ Excerpt│  │ Excerpt│  │ Excerpt│   │
│  └────────┘  └────────┘  └────────┘   │
│                                         │
│         [View All Posts →]             │
└─────────────────────────────────────────┘
```

### Blog List Page
```
┌──────────────────────────────────────────┐
│  Our Blog                                │
│  Stories and insights from our journey   │
├──────────┬───────────────────────────────┤
│          │  Posts | Categories | Tags    │
│ FILTERS  ├───────────────────────────────┤
│          │                               │
│ Search   │  ┌──────┐ ┌──────┐ ┌──────┐ │
│ Category │  │Post 1│ │Post 2│ │Post 3│ │
│ Tag      │  └──────┘ └──────┘ └──────┘ │
│          │                               │
│          │  ┌──────┐ ┌──────┐ ┌──────┐ │
│          │  │Post 4│ │Post 5│ │Post 6│ │
│          │  └──────┘ └──────┘ └──────┘ │
│          │                               │
│          │   [← Previous] Page 1 [Next →]│
└──────────┴───────────────────────────────┘
```

### Individual Post Page
```
┌─────────────────────────────────────────┐
│  [← Back to Blog]                       │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     Featured Image                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Conservation] [Wildlife]              │
│  Blog Post Title                        │
│  Brief excerpt of the post...           │
│  👤 John Doe  📅 Jan 15, 2025          │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │  Full blog post content...        │ │
│  │  With rich formatting...          │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Tags: #environment #wildlife #nature   │
│                                         │
│  Related Posts                          │
│  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ Post A │  │ Post B │  │ Post C │   │
│  └────────┘  └────────┘  └────────┘   │
└─────────────────────────────────────────┘
```

## Features

### For Visitors
✅ Browse all published blog posts
✅ Search posts by keyword
✅ Filter by category or tag
✅ Read full posts with rich content
✅ Discover related posts
✅ Responsive mobile-friendly design
✅ Beautiful card-based layout
✅ Loading states and animations

### For Admins (via API)
✅ Create, edit, and delete posts
✅ Publish/unpublish posts (draft workflow)
✅ Manage categories and tags
✅ Add featured images
✅ Rich content editing (HTML/Markdown)
✅ SEO-friendly excerpts
✅ Author attribution

## API Routes

All blog functionality uses these API endpoints:

### Blog Posts
- `GET /api/v1/blog/posts` - List posts
- `GET /api/v1/blog/posts/{id}` - Get post by ID
- `GET /api/v1/blog/posts/by-slug/{slug}` - Get post by slug
- `POST /api/v1/blog/posts` - Create post (Admin)
- `PUT /api/v1/blog/posts/{id}` - Update post (Admin)
- `DELETE /api/v1/blog/posts/{id}` - Delete post (Admin)
- `POST /api/v1/blog/posts/{id}/publish` - Publish post (Admin)
- `POST /api/v1/blog/posts/{id}/unpublish` - Unpublish post (Admin)

### Categories
- `GET /api/v1/blog/categories` - List categories
- `GET /api/v1/blog/categories/{id}` - Get category
- `POST /api/v1/blog/categories` - Create category (Admin)
- `PUT /api/v1/blog/categories/{id}` - Update category (Admin)
- `DELETE /api/v1/blog/categories/{id}` - Delete category (Admin)

### Tags
- `GET /api/v1/blog/tags` - List tags
- `GET /api/v1/blog/tags/{id}` - Get tag
- `POST /api/v1/blog/tags` - Create tag (Admin)
- `PUT /api/v1/blog/tags/{id}` - Update tag (Admin)
- `DELETE /api/v1/blog/tags/{id}` - Delete tag (Admin)

## Testing the Blog

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit the landing page:**
   - Go to `http://localhost:3000` (or your dev URL)
   - Scroll down to see the "Latest from Our Blog" section

3. **Visit the blog page:**
   - Click "View All Posts" or go to `/en/blog`
   - Try filtering and searching

4. **View a blog post:**
   - Click on any blog post card to view the full post

## Creating Sample Blog Content

To test the blog with sample data, you can use the blog API to create posts. Here's an example:

```typescript
import { blogApi } from '@/lib/api';

// Create a category
const category = await blogApi.createCategory({
  name: 'Conservation',
  description: 'Posts about conservation efforts'
});

// Create a tag
const tag = await blogApi.createTag({
  name: 'Environment'
});

// Create a blog post
const post = await blogApi.createPost({
  title: 'Introduction to Environmental Conservation',
  content: '<p>Full blog post content here...</p>',
  excerpt: 'A brief introduction to our conservation efforts',
  status: 'published',
  featured_image_url: 'https://example.com/image.jpg',
  category_ids: [category.id],
  tag_ids: [tag.id]
});
```

## File Structure

```
webApp/
├── src/app/[locale]/
│   └── blog/
│       ├── page.tsx              # Blog list page
│       └── [slug]/
│           └── page.tsx          # Individual post page
├── components/blog/
│   ├── blog-post-card.tsx        # Post preview card
│   ├── blog-post-list.tsx        # Posts grid layout
│   ├── blog-post-detail.tsx      # Full post view
│   ├── blog-post-form.tsx        # Admin form
│   ├── blog-filter.tsx           # Filter sidebar
│   ├── category-list.tsx         # Category grid
│   ├── tag-list.tsx              # Tag cloud
│   └── index.ts                  # Exports
├── lib/api/
│   ├── blog.ts                   # Blog API client
│   └── types.ts                  # TypeScript types
└── docs/
    ├── BLOG_API_SPEC.md          # API specification
    └── BLOG_IMPLEMENTATION.md    # This file
```

## Next Steps

1. **Add blog posts** via the admin API or backend
2. **Customize styling** to match your brand
3. **Add translations** for multi-language support
4. **Create an admin UI** using the `BlogPostForm` component
5. **Add rich text editor** for better content editing (e.g., TinyMCE, Tiptap)

## Notes

- Only **published** posts are visible to non-admin users
- Blog uses **server-side data fetching** for better SEO
- All routes are **locale-aware** (works with `/en/blog` and `/pt/blog`)
- **Responsive design** works on all screen sizes
- **Dark mode** fully supported
