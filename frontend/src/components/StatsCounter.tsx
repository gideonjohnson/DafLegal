'use client'

import { useEffect, useState, useRef } from 'react'

const stats = [
  { value: 10000, suffix: '+', label: 'Contracts Analyzed', prefix: '' },
  { value: 500, suffix: '+', label: 'Law Firms Trust Us', prefix: '' },
  { value: 95, suffix: '%', label: 'Accuracy Rate', prefix: '' },
  { value: 65, suffix: '%', label: 'Cost Reduction', prefix: '' },
]

function Counter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [isVisible, value, duration])

  return <div ref={ref}>{count.toLocaleString()}</div>
}

export function StatsCounter() {
  return (
    <div className="py-16 bg-gradient-to-r from-[#2d5a2d] to-[#1a2e1a] dark:from-[#0f1a0f] dark:to-[#1a2e1a]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#d4a561] mb-2">
                {stat.prefix}
                <Counter value={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-sm md:text-base text-[#f5edd8]/80 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
