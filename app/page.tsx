'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const CUISINES = ['Italian', 'South Asian', 'Middle Eastern', 'East Asian', 'Caribbean', 'Latin American', 'African', 'Mediterranean', 'American', 'Japanese', 'Mexican']
const DIETARY = ['Balanced', 'Protein-heavy', 'Low carb', 'Vegetarian', 'Vegan', 'Halal', 'Gluten-free']
const ALLERGIES = ['None', 'Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy']

export default function Onboarding() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    name: '',
    householdSize: '',
    dietaryStyle: [],
    allergies: [],
    spice: '',
    dislikes: '',
    cuisines: [],
    cookTime: '',
    comfortLevel: '',
    wantToGrow: ''
  })

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      setUser(session.user)

      // Check if they already completed onboarding
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (profile) {
        setDone(true)
      }
      setCheckingAuth(false)
    }
    checkUser()
  }, [router])

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const toggleArray = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { error } = await supabase.from('user_profiles').insert([{
      user_id: user.id,
      name: form.name,
      household_size: form.householdSize,
      dietary_style: form.dietaryStyle.join(', '),
      allergies: form.allergies.join(', '),
      spice: form.spice,
      dislikes: form.dislikes,
      cuisines: form.cuisines.join(', '),
      cook_time: form.cookTime,
      comfort_level: form.comfortLevel,
      want_to_grow: form.wantToGrow
    }])
    setLoading(false)
    if (error) {
      alert('Something went wrong. Please try again.')
      console.error(error)
    } else {
      setDone(true)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const progress = (step / 4) * 100

  // Show nothing while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">You're all set{form.name ? `, ${form.name}` : ''}!</h1>
          <p className="text-gray-500 mb-6">Your personalized deal feed is coming soon. We'll match the best grocery deals in Toronto to your preferences.</p>
          <button onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600 underline">
            Log out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6">

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome! 👋</h1>
            <p className="text-gray-500 mb-6">Let's get to know you a little.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">What's your name?</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Sam"
              value={form.name}
              onChange={e => update('name', e.target.value)}
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">How many people are you shopping for?</label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {['1', '2', '3', '4+'].map(n => (
                <button key={n} onClick={() => update('householdSize', n)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.householdSize === n ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Your Diet 🥗</h1>
            <p className="text-gray-500 mb-6">Help us match deals to how you eat.</p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary style <span className="text-gray-400">(pick all that apply)</span></label>
            <div className="flex flex-wrap gap-2 mb-4">
              {DIETARY.map(d => (
                <button key={d} onClick={() => toggleArray('dietaryStyle', d)}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${form.dietaryStyle.includes(d) ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                  {d}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allergies <span className="text-gray-400">(pick all that apply)</span></label>
            <div className="flex flex-wrap gap-2 mb-4">
              {ALLERGIES.map(a => (
                <button key={a} onClick={() => toggleArray('allergies', a)}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${form.allergies.includes(a) ? 'bg-red-400 text-white border-red-400' : 'border-gray-200 text-gray-600 hover:border-red-200'}`}>
                  {a}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Spice preference</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['Mild 😊', 'Medium 🌶️', 'Spicy 🔥'].map(s => (
                <button key={s} onClick={() => update('spice', s)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.spice === s ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                  {s}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anything you don't want to eat?</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. no fish, hate cilantro, no lamb"
              value={form.dislikes}
              onChange={e => update('dislikes', e.target.value)}
            />
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Your Cuisines 🌍</h1>
            <p className="text-gray-500 mb-6">What kinds of food do you love to cook or eat?</p>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map(c => (
                <button key={c} onClick={() => toggleArray('cuisines', c)}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${form.cuisines.includes(c) ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Your Cooking 👨‍🍳</h1>
            <p className="text-gray-500 mb-6">Tell us about how you like to cook.</p>
            <label className="block text-sm font-medium text-gray-700 mb-2">How long do you want recipes to take?</label>
            <div className="flex flex-col gap-2 mb-4">
              {['Under 20 minutes', '30–45 minutes', 'Up to 1 hour', 'No preference'].map(t => (
                <button key={t} onClick={() => update('cookTime', t)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium text-left transition-all ${form.cookTime === t ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                  {t}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How comfortable are you in the kitchen?</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['Beginner', 'Comfortable', 'Confident'].map(l => (
                <button key={l} onClick={() => update('comfortLevel', l)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.comfortLevel === l ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                  {l}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Want to expand your cooking skills?</label>
            <div className="flex flex-col gap-2">
              {["Yes, I'd love to learn new things", "No, I'm happy with what I know"].map(w => (
                <button key={w} onClick={() => update('wantToGrow', w)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium text-left transition-all ${form.wantToGrow === w ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
              Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button onClick={() => setStep(step + 1)}
              className="px-6 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-all">
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="px-6 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-all disabled:opacity-50">
              {loading ? 'Saving...' : "Let's go! 🚀"}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}