import React from 'react'

type StepAboutYouProps = {
  name: string
  postalCode: string
  householdSize: string
  onUpdate: (field: 'name' | 'postalCode' | 'householdSize', value: string) => void
}

const HOUSEHOLD_OPTIONS = ['1', '2', '3', '4', '5+']

const formatPostalCode = (value: string) => {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (cleaned.length <= 3) return cleaned
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`
}

const isValidCanadianPostalCode = (value: string) => {
  const pattern = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
  return pattern.test(value.trim())
}

export function StepAboutYou({
  name,
  postalCode,
  householdSize,
  onUpdate
}: StepAboutYouProps) {
  const showPostalError = postalCode.length > 0 && !isValidCanadianPostalCode(postalCode)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase mb-1">
          Step 1
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-1">
          Let&apos;s personalize your deals
        </h1>
        <p className="text-sm text-slate-500">
          We&apos;ll use this to find the best grocery deals near you in Toronto.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            What&apos;s your name?
          </label>
          <input
            type="text"
            value={name}
            onChange={e => onUpdate('name', e.target.value)}
            placeholder="e.g. Sam"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <label className="text-sm font-medium text-slate-800">
              What&apos;s your postal code?
            </label>
            <span className="text-[11px] text-slate-400">
              Toronto only for now 🇨🇦
            </span>
          </div>
          <input
            type="text"
            value={postalCode}
            onChange={e => onUpdate('postalCode', formatPostalCode(e.target.value))}
            placeholder="e.g. M5V 2T6"
            className={`w-full rounded-2xl border px-4 py-3 text-sm shadow-inner focus:outline-none focus:ring-2 ${
              showPostalError
                ? 'border-rose-400 bg-rose-50/60 text-rose-900 focus:ring-rose-100'
                : 'border-slate-200 bg-slate-50/60 text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-emerald-100'
            }`}
          />
          {showPostalError && (
            <p className="text-[11px] text-rose-600">
              Please enter a valid Canadian postal code (e.g. M5V 2T6).
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            How many people are you shopping for?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {HOUSEHOLD_OPTIONS.map(option => {
              const isActive = householdSize === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onUpdate('householdSize', option)}
                  className={`flex h-11 items-center justify-center rounded-2xl border text-sm font-medium transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

