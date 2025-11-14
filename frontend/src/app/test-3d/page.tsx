"use client"

export default function Test3D() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      <h1 className="text-4xl font-bold gradient-text mb-8">3D Effects Test Page</h1>

      {/* Test 1: Card 3D */}
      <div className="card-3d p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">✅ Test 1: 3D Card</h2>
        <p>Hover over me! I should lift up with a shadow effect.</p>
      </div>

      {/* Test 2: Button 3D */}
      <button className="btn-3d bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg">
        ✅ Test 2: 3D Button - Hover Me!
      </button>

      {/* Test 3: Glass Effect */}
      <div className="glass p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">✅ Test 3: Glassmorphism</h2>
        <p>This should have a frosted glass effect with blur.</p>
      </div>

      {/* Test 4: Input 3D */}
      <div className="max-w-md">
        <h2 className="text-2xl font-bold mb-4">✅ Test 4: 3D Input</h2>
        <input
          type="text"
          placeholder="Click me and I should lift up"
          className="input-3d"
        />
      </div>

      {/* Test 5: Stat Card */}
      <div className="stat-card max-w-sm">
        <h2 className="text-2xl font-bold mb-4">✅ Test 5: Stat Card</h2>
        <p>Hover over me for scale effect!</p>
      </div>

      {/* Test 6: Badge 3D */}
      <div>
        <h2 className="text-2xl font-bold mb-4">✅ Test 6: 3D Badges</h2>
        <div className="flex gap-4">
          <span className="badge-3d bg-indigo-100 text-indigo-700">Badge 1</span>
          <span className="badge-3d bg-green-100 text-green-700">Badge 2</span>
          <span className="badge-3d bg-red-100 text-red-700">Badge 3</span>
        </div>
      </div>

      {/* Test 7: Icon 3D */}
      <div className="icon-3d w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl">
        🚀
      </div>

      {/* Test 8: Animations */}
      <div className="space-y-4">
        <div className="card-3d p-6 max-w-md slide-in-bottom">
          <h3 className="font-bold mb-2">✅ Test 8: Slide In Bottom</h3>
          <p>This animated in from bottom</p>
        </div>

        <div className="card-3d p-6 max-w-md fade-in-scale">
          <h3 className="font-bold mb-2">✅ Test 9: Fade In Scale</h3>
          <p>This faded in with scale</p>
        </div>

        <div className="card-3d p-6 max-w-md float">
          <h3 className="font-bold mb-2">✅ Test 10: Floating</h3>
          <p>This should be floating up and down continuously</p>
        </div>
      </div>

      <div className="mt-12 p-8 bg-gray-100 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">📋 Checklist:</h2>
        <ul className="space-y-2">
          <li>✅ Cards lift on hover with shadows</li>
          <li>✅ Buttons have shimmer effect on hover</li>
          <li>✅ Glass has blur/frosted effect</li>
          <li>✅ Inputs lift slightly on focus</li>
          <li>✅ Stat card scales up on hover</li>
          <li>✅ Badges have inset shadow</li>
          <li>✅ Icons rotate slightly on hover</li>
          <li>✅ Elements animate in on page load</li>
          <li>✅ Float animation is continuous</li>
          <li>✅ Gradient text is colorful</li>
        </ul>
      </div>
    </div>
  )
}
