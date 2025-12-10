import { getPostBySlug, getAllPosts } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Metadata } from 'next'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found | DafLegal',
    }
  }

  return {
    title: `${post.title} | DafLegal Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [post.image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#f5edd8] to-[#e5d5c0] dark:from-[#1a2e1a] dark:to-[#0f1a0f] py-12 mb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link
                href="/blog"
                className="text-sm text-[#8b7355] dark:text-[#d4c5b0] hover:text-[#d4a561] transition-colors inline-flex items-center gap-2"
              >
                ← Back to Blog
              </Link>
            </div>

            {/* Category Badge */}
            <div className="mb-4">
              <span className="bg-[#d4a561] text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-4">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#8b7355] dark:text-[#d4c5b0]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>{post.author}</span>
              </div>

              <span>•</span>

              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>

              <span>•</span>

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{post.readingTime}</span>
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-[#8b7355] dark:text-[#d4c5b0] bg-[#f5edd8] dark:bg-[#1a2e1a] px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.image && (
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-4xl mx-auto">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-beige p-8 md:p-12">
            <div className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:text-[#1a2e1a] dark:prose-headings:text-[#f5edd8]
              prose-p:text-[#1a2e1a] dark:prose-p:text-[#f5edd8]
              prose-li:text-[#1a2e1a] dark:prose-li:text-[#f5edd8]
              prose-a:text-[#d4a561] hover:prose-a:text-[#b8965a]
              prose-strong:text-[#1a2e1a] dark:prose-strong:text-[#f5edd8]
              prose-em:text-[#1a2e1a] dark:prose-em:text-[#f5edd8]
              prose-code:text-[#d4a561] prose-code:bg-[#e8d5b7] dark:prose-code:bg-[#1a2e1a] prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-[#1a2e1a] dark:prose-pre:bg-[#0f1a0f] prose-pre:text-[#f5edd8]
              prose-blockquote:border-[#d4a561] prose-blockquote:text-[#1a2e1a] dark:prose-blockquote:text-[#f5edd8]
              prose-ul:text-[#1a2e1a] dark:prose-ul:text-[#f5edd8]
              prose-ol:text-[#1a2e1a] dark:prose-ol:text-[#f5edd8]
              prose-h2:text-[#1a2e1a] dark:prose-h2:text-[#f5edd8]
              prose-h3:text-[#1a2e1a] dark:prose-h3:text-[#f5edd8]
              prose-h4:text-[#1a2e1a] dark:prose-h4:text-[#f5edd8]
            ">
              <MDXRemote
                source={post.content}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeHighlight],
                  },
                }}
              />
            </div>
          </div>

          {/* Share & CTA */}
          <div className="mt-16 pt-8 border-t border-[#d4a561]/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
                  Ready to transform your legal workflow?
                </h3>
                <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0]">
                  Start analyzing contracts with AI today.
                </p>
              </div>
              <Link
                href="/analyze"
                className="btn-gold px-8 py-3 whitespace-nowrap"
              >
                Start Free Trial →
              </Link>
            </div>
          </div>

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="text-[#d4a561] hover:text-[#b8965a] font-semibold inline-flex items-center gap-2 transition-colors"
            >
              ← Read More Articles
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
