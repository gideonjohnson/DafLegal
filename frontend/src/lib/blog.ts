import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  category: string
  tags: string[]
  image?: string
  content: string
  readingTime: string
}

export function getAllPosts(): BlogPost[] {
  // Ensure directory exists
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPosts = fileNames
    .filter(fileName => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      const { text } = readingTime(content)

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        category: data.category,
        tags: data.tags || [],
        image: data.image,
        content,
        readingTime: text,
      }
    })

  return allPosts.sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const { text } = readingTime(content)

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      category: data.category,
      tags: data.tags || [],
      image: data.image,
      content,
      readingTime: text,
    }
  } catch (error) {
    return null
  }
}

export function getAllCategories(): string[] {
  const posts = getAllPosts()
  const categories = posts.map(post => post.category)
  return Array.from(new Set(categories))
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tags = posts.flatMap(post => post.tags)
  return Array.from(new Set(tags))
}

export function getPostsByCategory(category: string): BlogPost[] {
  const posts = getAllPosts()
  return posts.filter(post => post.category === category)
}

export function getPostsByTag(tag: string): BlogPost[] {
  const posts = getAllPosts()
  return posts.filter(post => post.tags.includes(tag))
}
