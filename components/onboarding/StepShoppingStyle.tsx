import React from 'react'

type StepShoppingStyleProps = {
  transportMode: string
  travelDistance: string
  shoppingStyle: string
  favouriteStores: string[]
  onUpdate: (
    field: 'transportMode' | 'travelDistance' | 'shoppingStyle',
    value: string
  ) => void
  onToggleFavouriteStore: (store: string) => void
}

const TRANSPORT_OPTIONS = [
  { value: 'walk', label: '🚶 Walk' },
  { value: 'drive', label: '🚗 Drive' },
  { value: 'transit', label: '🚌 Transit' },
  { value: 'mix', label: '🔄 Mix of all' }
]

const DISTANCE_OPTIONS = [
  { value: '1km', label: 'Nearby only ~1km' },
  { value: '5km', label: 'Up to 5km' },
  { value: '10km', label: 'Up to 10km' },
  { value: 'anywhere', label: 'Anywhere with a good deal' }
]

const SHOPPING_STYLE_OPTIONS = [
  {
    value: 'stock_up',
    label: '🛒 Big weekly haul',
    description: 'I like to stock up when things are on sale.'
  },
  {
    value: 'fresh',
    label: '🥬 Small frequent trips',
    description: 'I prefer buying fresh ingredients more often.'
  },
  {
    value: 'mix',
    label: '🔄 Mix of both',
    description: 'Some weeks I stock up, some weeks I keep it light.'
  }
]

const STORE_OPTIONS = [
  'No Frills',
  'Loblaws',
  'Real Canadian Superstore',
  'FreshCo',
  'Metro',
  'No preference'
]

export function StepShoppingStyle({
  transportMode,
  travelDistance,
  shoppingStyle,
  favouriteStores,
  onUpdate,
  onToggleFavouriteStore
}: StepShoppingStyleProps) {
  const isStoreSelected = (store: string) => favouriteStores.includes(store)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase mb-1">
          Step 2
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-1">
          Your shopping style
        </h2>
        <p className="text-sm text-slate-500">
          Tell us how you usually shop so we can match deals that actually work for you.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            How do you usually get to the grocery store?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TRANSPORT_OPTIONS.map(option => {
              const isActive = transportMode === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onUpdate('transportMode', option.value)}
                  className={`flex h-11 items-center justify-center rounded-2xl border text-sm font-medium transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            How far are you willing to travel for a good deal?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DISTANCE_OPTIONS.map(option => {
              const isActive = travelDistance === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onUpdate('travelDistance', option.value)}
                  className={`flex h-11 items-center justify-center rounded-2xl border text-sm font-medium text-center transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            Do you prefer to stock up or shop fresh?
          </label>
          <div className="space-y-2">
            {SHOPPING_STYLE_OPTIONS.map(option => {
              const isActive = shoppingStyle === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onUpdate('shoppingStyle', option.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <p
                    className={`mt-0.5 text-xs ${
                      isActive ? 'text-emerald-50/90' : 'text-slate-500'
                    }`}
                  >
                    {option.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <label className="text-sm font-medium text-slate-800">
              Any favourite stores? (pick all that apply)
            </label>
            <span className="text-[11px] text-slate-400">Optional</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {STORE_OPTIONS.map(store => {
              const selected = isStoreSelected(store)
              return (
                <button
                  key={store}
                  type="button"
                  onClick={() => onToggleFavouriteStore(store)}
                  className={`inline-flex items-center rounded-2xl border px-3 py-2 text-xs font-medium transition-all ${
                    selected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <span
                    className={`mr-1 inline-block h-2 w-2 rounded-full ${
                      selected ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  {store}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

