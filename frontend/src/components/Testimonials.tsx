'use client'

import { useState } from 'react'

const testimonials = [
  {
    quote: "DafLegal has transformed how we review contracts. What used to take hours now takes minutes. The AI is incredibly accurate and has caught issues our team missed.",
    author: "Sarah Mitchell",
    role: "Managing Partner",
    company: "Mitchell & Associates",
    image: "/testimonial-1.jpg",
    rating: 5,
  },
  {
    quote: "We've increased our contract review capacity by 300% without hiring additional staff. DafLegal pays for itself in saved time alone.",
    author: "David Chen",
    role: "General Counsel",
    company: "TechCorp Legal",
    image: "/testimonial-2.jpg",
    rating: 5,
  },
  {
    quote: "The compliance checking feature is a game-changer. We can now ensure every contract meets regulatory requirements in seconds instead of days.",
    author: "Jennifer Park",
    role: "Senior Associate",
    company: "Park Legal Group",
    image: "/testimonial-3.jpg",
    rating: 5,
  },
  {
    quote: "As a solo practitioner, DafLegal gives me the analytical power of a large firm. My clients are impressed with the speed and thoroughness of my work.",
    author: "Michael Rodriguez",
    role: "Solo Practitioner",
    company: "Rodriguez Law",
    image: "/testimonial-4.jpg",
    rating: 5,
  },
  {
    quote: "The ROI was immediate. We reduced contract review costs by 65% in the first month. Best investment we've made in legal tech.",
    author: "Emily Thompson",
    role: "COO",
    company: "Global Ventures LLC",
    image: "/testimonial-5.jpg",
    rating: 5,
  },
  {
    quote: "I was skeptical about AI legal tools, but DafLegal exceeded my expectations. It's like having a junior associate who never sleeps and never makes mistakes.",
    author: "Robert Williams",
    role: "Partner",
    company: "Williams & Partners",
    image: "/testimonial-6.jpg",
    rating: 5,
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className="py-16 bg-gradient-to-br from-[#f5edd8] to-[#e5d5c0] dark:from-[#1a2e1a] dark:to-[#0f1a0f]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-4">
            Trusted by Legal Professionals
          </h2>
          <p className="text-[#8b7355] dark:text-[#d4c5b0] max-w-2xl mx-auto">
            Join hundreds of law firms who have transformed their contract review process
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="card-beige p-8 md:p-12 relative">
            {/* Quote Icon */}
            <svg className="absolute top-6 left-6 w-12 h-12 text-[#d4a561]/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(currentTestimonial.rating)].map((_, idx) => (
                <svg key={idx} className="w-6 h-6 text-[#d4a561]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl text-[#1a2e1a] dark:text-[#f5edd8] text-center mb-8 leading-relaxed">
              "{currentTestimonial.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#d4a561] flex items-center justify-center text-white font-bold text-2xl mb-3">
                {currentTestimonial.author.charAt(0)}
              </div>
              <div className="text-center">
                <p className="font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
                  {currentTestimonial.author}
                </p>
                <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0]">
                  {currentTestimonial.role}
                </p>
                <p className="text-sm text-[#d4a561] font-medium">
                  {currentTestimonial.company}
                </p>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-[#d4a561]/20 hover:bg-[#d4a561] text-[#d4a561] hover:text-white transition-all flex items-center justify-center"
                aria-label="Previous testimonial"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-[#d4a561]/20 hover:bg-[#d4a561] text-[#d4a561] hover:text-white transition-all flex items-center justify-center"
                aria-label="Next testimonial"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-[#d4a561] w-8' : 'bg-[#d4a561]/30'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mini Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
          {testimonials.slice(0, 3).map((testimonial, idx) => (
            <div key={idx} className="card-beige p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, starIdx) => (
                  <svg key={starIdx} className="w-4 h-4 text-[#d4a561]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-[#5c4a3d] dark:text-[#d4c5b0] mb-4 line-clamp-3">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d4a561] flex items-center justify-center text-white font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a2e1a] dark:text-[#f5edd8]">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
