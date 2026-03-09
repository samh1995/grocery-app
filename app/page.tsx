'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { ProgressBar } from '../components/onboarding/ProgressBar'
import { StepAboutYou } from '../components/onboarding/StepAboutYou'
import { StepShoppingStyle } from '../components/onboarding/StepShoppingStyle'
import { StepFoodPreferences } from '../components/onboarding/StepFoodPreferences'
import { StepKitchen } from '../components/onboarding/StepKitchen'

const TOTAL_STEPS = 4

const INITIAL_FORM = {
  name: '',
  postalCode: '',
  householdSize: '',
  transportMode: '',
  travelDistance: '',
  shoppingStyle: '',
  favouriteStores: [] as string[],
  diet: '',
  allergies: [] as string[],
  cuisines: [] as string[],
  spice: '',
  comfortLevel: '',
  cookTime: '',
  growSkills: ''
}

const isValidCanadianPostalCode = (value: string) => {
  const pattern = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
  return pattern.test(value.trim())
}

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  const [form, setForm] = useState<typeof INITIAL_FORM>(INITIAL_FORM)

  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth')
        return
      }

      setUser(session.user)

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (!error && profile) {
        setHasExistingProfile(true)

        const favouriteStores =
          Array.isArray(profile.favourite_stores) && profile.favourite_stores.length
            ? profile.favourite_stores
            : typeof profile.favourite_stores === 'string'
              ? profile.favourite_stores.split(',').map((s: string) => s.trim()).filter(Boolean)
              : []

        const allergiesArray = Array.isArray(profile.allergies)
          ? profile.allergies
          : typeof profile.allergies === 'string'
            ? profile.allergies.split(',').map((a: string) => a.trim()).filter(Boolean)
            : []

        const cuisinesArray = Array.isArray(profile.cuisines)
          ? profile.cuisines
          : typeof profile.cuisines === 'string'
            ? profile.cuisines.split(',').map((c: string) => c.trim()).filter(Boolean)
            : []

        setForm(prev => ({
          ...prev,
          name: profile.name || '',
          postalCode: profile.postal_code || '',
          householdSize: profile.household_size || '',
          transportMode: profile.transport_mode || '',
          travelDistance: profile.travel_distance || '',
          shoppingStyle: profile.shopping_style || '',
          favouriteStores,
          diet: profile.dietary_style || '',
          allergies: allergiesArray,
          cuisines: cuisinesArray,
          spice: profile.spice || '',
          comfortLevel: profile.comfort_level || '',
          cookTime: profile.cook_time || '',
          growSkills: profile.want_to_grow || ''
        }))
      }

      setCheckingAuth(false)
    }

    checkUserAndLoadProfile()
  }, [router])

  useEffect(() => {
    if (!submitted) return

    const timer = setTimeout(() => {
      router.push('/feed')
    }, 1200)

    return () => clearTimeout(timer)
  }, [submitted, router])

  const updateField = (field: keyof typeof INITIAL_FORM, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleMultiSelect = (field: 'favouriteStores' | 'allergies' | 'cuisines', value: string) => {
    setForm(prev => {
      const current = prev[field] as string[]
      const exists = current.includes(value)
      return {
        ...prev,
        [field]: exists ? current.filter(v => v !== value) : [...current, value]
      }
    })
  }

  const canProceedFromStep = (currentStep: number) => {
    if (currentStep === 1) {
      return (
        form.name.trim().length > 0 &&
        form.householdSize.trim().length > 0 &&
        isValidCanadianPostalCode(form.postalCode)
      )
    }
    if (currentStep === 2) {
      return (
        form.transportMode.trim().length > 0 &&
        form.travelDistance.trim().length > 0 &&
        form.shoppingStyle.trim().length > 0
      )
    }
    if (currentStep === 3) {
      return form.diet.trim().length > 0 && form.spice.trim().length > 0 && form.cuisines.length > 0
    }
    if (currentStep === 4) {
      return (
        form.comfortLevel.trim().length > 0 &&
        form.cookTime.trim().length > 0 &&
        form.growSkills.trim().length > 0
      )
    }
    return true
  }

  const handleNext = () => {
    if (!canProceedFromStep(step)) return
    setStep(prev => Math.min(prev + 1, TOTAL_STEPS))
  }

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!user || !canProceedFromStep(4)) return

    setLoading(true)

    const payload: any = {
      user_id: user.id,
      name: form.name.trim(),
      postal_code: form.postalCode.trim().toUpperCase(),
      household_size: form.householdSize,
      transport_mode: form.transportMode,
      travel_distance: form.travelDistance,
      shopping_style: form.shoppingStyle,
      favourite_stores: form.favouriteStores,
      dietary_style: form.diet,
      allergies: form.allergies.join(', '),
      cuisines: form.cuisines.join(', '),
      spice: form.spice,
      cook_time: form.cookTime,
      comfort_level: form.comfortLevel,
      want_to_grow: form.growSkills
    }

    const query = supabase.from('user_profiles')

    const { error } = hasExistingProfile
      ? await query.update(payload).eq('user_id', user.id)
      : await query.insert([payload])

    setLoading(false)

    if (error) {
      // eslint-disable-next-line no-alert
      alert('Something went wrong saving your profile. Please try again.')
      // eslint-disable-next-line no-console
      console.error(error)
      return
    }

    setSubmitted(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Checking your account…</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 via-emerald-100/60 to-amber-50 px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white/90 p-6 text-center shadow-xl shadow-emerald-100 backdrop-blur">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              🎉
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">
            You&apos;re all set{form.name ? `, ${form.name}` : ''}!
          </h1>
          <p className="text-sm text-slate-500">
            We&apos;re finding the best grocery deals near you based on your preferences.
          </p>
        </div>
      </div>
    )
  }

  const canProceed = canProceedFromStep(step)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 via-slate-50 to-amber-50 px-4 py-6">
      <div className="w-full max-w-md space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm shadow-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Grocery Deals · Toronto
            </div>
            <h1 className="mt-3 text-xl font-semibold text-slate-900">
              Smarter grocery trips, less guesswork.
            </h1>
          </div>
        </header>

        <main className="rounded-3xl bg-white/90 p-5 shadow-lg shadow-emerald-100 backdrop-blur-sm sm:p-6">
          <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />

          <div className="mt-4 space-y-2">
            {step === 1 && (
              <StepAboutYou
                name={form.name}
                postalCode={form.postalCode}
                householdSize={form.householdSize}
                onUpdate={(field, value) => updateField(field, value)}
              />
            )}

            {step === 2 && (
              <StepShoppingStyle
                transportMode={form.transportMode}
                travelDistance={form.travelDistance}
                shoppingStyle={form.shoppingStyle}
                favouriteStores={form.favouriteStores}
                onUpdate={(field, value) => updateField(field, value)}
                onToggleFavouriteStore={store => toggleMultiSelect('favouriteStores', store)}
              />
            )}

            {step === 3 && (
              <StepFoodPreferences
                diet={form.diet}
                allergies={form.allergies}
                cuisines={form.cuisines}
                spice={form.spice}
                onUpdate={(field, value) => updateField(field, value)}
                onToggleMulti={(field, value) => toggleMultiSelect(field, value)}
              />
            )}

            {step === 4 && (
              <StepKitchen
                comfortLevel={form.comfortLevel}
                cookTime={form.cookTime}
                growSkills={form.growSkills}
                name={form.name}
                onUpdate={(field, value) => updateField(field, value)}
              />
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                ← Back
              </button>
            ) : (
              <span className="text-xs text-slate-400">
                Signed in with Supabase
              </span>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                className="inline-flex items-center rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                Next
                <span className="ml-1.5">→</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !canProceed}
                className="inline-flex items-center rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {loading ? 'Saving…' : "Let's find your deals! 🎉"}
              </button>
            )}
          </div>
        </main>

        <footer className="flex items-center justify-between text-[11px] text-slate-400">
          <button
            type="button"
            onClick={handleLogout}
            className="font-medium text-slate-500 hover:text-slate-700"
          >
            Not you? Sign out
          </button>
          <span>Built with Supabase &amp; Next.js</span>
        </footer>
      </div>
    </div>
  )
}
