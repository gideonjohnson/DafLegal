import { getAllPosts, getAllCategories } from '@/lib/blog'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Tech Blog | DafLegal',
  description: 'Expert insights on legal technology, AI in law, contract analysis, and legal innovation.',
  openGraph: {
    title: 'Legal Tech Blog | DafLegal',
    description: 'Expert insights on legal technology, AI in law, contract analysis, and legal innovation.',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()
  const categories = getAllCategories()

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Section */}
      <div className="container mx-auto px-4 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-4">
            Legal Tech Insights
          </h1>
          <p className="text-lg text-[#5c4a3d] dark:text-[#d4c5b0]">
            Expert perspectives on AI, legal technology, and the future of law
          </p>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-full bg-[#d4a561] text-white text-sm font-semibold hover:bg-[#b8965a] transition-colors"
          >
            All Posts
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-4 py-2 rounded-full bg-[#f5edd8] dark:bg-[#1a2e1a] text-[#1a2e1a] dark:text-[#f5edd8] text-sm font-semibold hover:bg-[#d4a561] hover:text-white transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card-beige group hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {post.image && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-[#d4a561] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {post.category}
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-[#8b7355] dark:text-[#d4c5b0] mb-3">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <span>•</span>
                  <span>{post.readingTime}</span>
                </div>

                <h2 className="text-xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-3 group-hover:text-[#d4a561] transition-colors">
                  {post.title}
                </h2>

                <p className="text-sm text-[#5c4a3d] dark:text-[#d4c5b0] mb-4 line-clamp-3">
                  {post.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8b7355] dark:text-[#d4c5b0]">
                    By {post.author}
                  </span>

                  <span className="text-[#d4a561] text-sm font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">
                    Read More →
                  </span>
                </div>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#d4a561]/20">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-[#8b7355] dark:text-[#d4c5b0] bg-[#f5edd8]/50 dark:bg-[#1a2e1a]/50 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-[#8b7355] dark:text-[#d4c5b0]">
              No blog posts yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
