# 🚀 FLY-FLEET PRODUCTION READINESS IMPLEMENTATION PLAN

**Created:** January 6, 2026
**Status:** 🔴 IN PROGRESS
**Target Completion:** 3-4 weeks

---

## 📊 PROGRESS TRACKER

- [ ] **Phase 1: Critical Security (BLOCKING)** - 0/6 ⏱️ Est: 8-10 hours
- [ ] **Phase 2: Critical Bugs** - 0/5 ⏱️ Est: 4-6 hours
- [ ] **Phase 3: Performance Optimization** - 0/4 ⏱️ Est: 6-8 hours
- [ ] **Phase 4: UX Improvements** - 0/8 ⏱️ Est: 10-12 hours
- [ ] **Phase 5: Code Refactoring** - 0/6 ⏱️ Est: 15-20 hours
- [ ] **Phase 6: Testing** - 0/4 ⏱️ Est: 20-25 hours
- [ ] **Phase 7: Design System** - 0/5 ⏱️ Est: 8-10 hours
- [ ] **Phase 8: Accessibility** - 0/4 ⏱️ Est: 8-10 hours

**TOTAL ESTIMATED TIME:** 79-101 hours

---

## 🔴 PHASE 1: CRITICAL SECURITY (BLOCKING DEPLOYMENT)

### ⚠️ MUST COMPLETE BEFORE ANY DEPLOYMENT

#### 1.1 ✅ Rotate Exposed API Key
**File:** `.env.local` line 12
**Status:** ⏳ PENDING
**Priority:** 🔴 CRITICAL
**Time:** 5 minutes

**Steps:**
- [ ] Go to Resend Dashboard (https://resend.com/api-keys)
- [ ] Delete key: `re_BjcuDiLL_LNDT6Md7dxpEzVkYHEQkb3GQ`
- [ ] Generate new API key
- [ ] Update local `.env.local` with new key
- [ ] Update Vercel/Railway environment variables
- [ ] Test email sending functionality

**Commands:**
```bash
# After getting new key from Resend:
# Update local .env.local manually
# Then test:
npm run dev
# Test quote form submission
```

---

#### 1.2 ✅ Remove .env.local from Git History
**Status:** ⏳ PENDING
**Priority:** 🔴 CRITICAL
**Time:** 30 minutes

**Steps:**
- [ ] Install git-filter-repo: `brew install git-filter-repo` (Mac) or `pip install git-filter-repo`
- [ ] Backup repository: `cp -r . ../fly-fleet-backup`
- [ ] Remove file from history: `git filter-repo --path .env.local --invert-paths`
- [ ] Force push to remote: `git push origin --force --all`
- [ ] Verify file is gone: `git log --all --full-history -- .env.local`
- [ ] Add to .gitignore (should already be there)

**Commands:**
```bash
# Backup first!
cp -r . ../fly-fleet-backup

# Remove from history
git filter-repo --path .env.local --invert-paths --force

# Force push (DANGEROUS - warn team first!)
git push origin --force --all
git push origin --force --tags

# Verify
git log --all --full-history -- .env.local  # Should return nothing
```

**⚠️ WARNING:** This rewrites git history. All team members must re-clone the repo!

---

#### 1.3 ✅ Implement Admin Authentication
**Files:**
- New: `src/middleware.ts`
- New: `src/lib/auth/config.ts`
- Modify: `src/app/api/admin/*/route.ts`

**Status:** ⏳ PENDING
**Priority:** 🔴 CRITICAL
**Time:** 4 hours

**Implementation:**
```typescript
// src/lib/auth/config.ts
export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Check against environment variables
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", name: "Admin", email: "admin@fly-fleet.com" }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// src/middleware.ts
export { default } from "next-auth/middleware"
export const config = { matcher: ["/api/admin/:path*"] }
```

**New Environment Variables:**
```bash
# Add to .env.local and production:
ADMIN_USERNAME="your-secure-username"
ADMIN_PASSWORD="your-secure-password-hash"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

**Files to Create:**
- [ ] `src/lib/auth/config.ts`
- [ ] `src/middleware.ts`
- [ ] `src/app/admin/login/page.tsx`

**Files to Modify:**
- [ ] `package.json` - Add `next-auth` dependency
- [ ] `.env.local` - Add admin credentials
- [ ] All `src/app/api/admin/*/route.ts` - Add auth check

---

#### 1.4 ✅ Remove Build Error Ignore Flags
**File:** `next.config.ts` lines 32-33
**Status:** ⏳ PENDING
**Priority:** 🔴 CRITICAL
**Time:** 5 minutes + 2-4 hours to fix errors

**Changes:**
```typescript
// REMOVE these lines:
❌ eslint: { ignoreDuringBuilds: true },
❌ typescript: { ignoreBuildErrors: true },
```

**Steps:**
- [ ] Remove the lines from next.config.ts
- [ ] Run `npm run build`
- [ ] Fix all TypeScript errors that appear
- [ ] Fix all ESLint errors that appear
- [ ] Verify build succeeds: `npm run build`

---

#### 1.5 ✅ Fix All TypeScript Errors
**Status:** ⏳ PENDING
**Priority:** 🔴 CRITICAL
**Time:** 2-3 hours

**Steps:**
- [ ] Run `npx tsc --noEmit` to see all errors
- [ ] Fix each error systematically
- [ ] Common issues to look for:
  - Missing types in function parameters
  - `any` types that should be specific
  - Missing return types
  - Null/undefined checks
- [ ] Re-run until no errors

---

#### 1.6 ✅ Fix All ESLint Errors
**Status:** ⏳ PENDING
**Priority:** 🔴 CRITICAL
**Time:** 1-2 hours

**Steps:**
- [ ] Run `npm run lint`
- [ ] Fix each error
- [ ] Run `npm run lint -- --fix` for auto-fixable issues
- [ ] Manually fix remaining issues
- [ ] Re-run until no errors

---

## 🟡 PHASE 2: CRITICAL BUGS

#### 2.1 ✅ Fix Color System Conflicts
**Files:**
- `src/app/globals.css`
- `tailwind.config.js`
- New: `src/lib/design-tokens.ts`

**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 1 hour

**Current Problem:**
```css
/* THREE different definitions: */
--navy-primary: #0B1E3C;  /* Line 8 */
--navy-primary: #2F6AEF;  /* Line 11 - OVERWRITES! */
'navy-primary': '#13213d', /* tailwind.config.js - ACTUALLY USED */
```

**Solution:**
```typescript
// src/lib/design-tokens.ts
export const colors = {
  navy: {
    primary: '#13213d',  // ← Single source of truth
  },
  blue: {
    accent: '#2F6AEF',
  },
  neutral: {
    light: '#F4F6F8',
    medium: '#828FA0',
  },
  white: '#FFFFFF',
  black: '#000000',
}
```

**Steps:**
- [ ] Create `src/lib/design-tokens.ts`
- [ ] Update `tailwind.config.js` to import from design-tokens
- [ ] Clean up `globals.css` - remove duplicate definitions
- [ ] Search & replace any hardcoded color values
- [ ] Test visual consistency across all pages

---

#### 2.2 ✅ Fix Truncated Spanish Text
**File:** `src/app/[locale]/page.tsx` line 229
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 5 minutes

**Current:**
```typescript
{locale === 'es' ? 'Evacuaciones sanitarias,' :  // ← INCOMPLETE!
```

**Fix:**
```typescript
{locale === 'es' ? 'Evacuaciones sanitarias con equipamiento especializado 24/7' :
 locale === 'pt' ? 'Evacuações médicas com equipamento especializado 24/7' :
 'Medical evacuations with specialized equipment 24/7'}
```

---

#### 2.3 ✅ Remove Console.log Statements
**Files:** Multiple
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 15 minutes

**Locations:**
- `src/components/Hero.tsx:96, 163, 168`
- `src/components/Navigation/Header.tsx:68`

**Steps:**
- [ ] Search: `grep -r "console.log" src/`
- [ ] Replace with logger or remove
- [ ] For important logs, use: `import { logger } from '@/lib/observability/logger'`
- [ ] Replace `console.log(...)` with `logger.info(...)`

---

#### 2.4 ✅ Delete Duplicate PostCSS Config
**File:** `postcss.config.mjs`
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 1 minute

**Steps:**
- [ ] Delete `postcss.config.mjs`
- [ ] Keep `postcss.config.js`
- [ ] Verify build works: `npm run build`

---

#### 2.5 ✅ Delete Unused Assets
**Files:** Multiple in `public/images/`
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 30 minutes

**To Delete:**
```bash
# Logo files
public/images/flyfleet_logo.png
public/images/flyfleet_logo_new.svg
public/images/flyfleet_logo_white_transparent.png

# Unused aircraft images
public/images/aircrafts/light_jets.png
public/images/aircrafts/medium_jets.png
public/images/aircrafts/heavy_jets.png
public/images/aircrafts/turbo_jets.png

# Unreferenced destination
public/images/destinations/madrid.jpg
```

**Steps:**
- [ ] Verify files are truly unused (grep for references)
- [ ] Delete files
- [ ] Test site to ensure no broken images
- [ ] Commit changes

---

## 🚀 PHASE 3: PERFORMANCE OPTIMIZATION

#### 3.1 ✅ Compress Images
**Directory:** `public/images/`
**Current Size:** 107MB
**Target Size:** < 20MB
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 2 hours

**Tools:**
- Use https://squoosh.app for manual compression
- Or use ImageOptim (Mac)
- Or use `sharp` CLI: `npx @squoosh/cli --resize-width 1920 --webp auto public/images/**/*.{jpg,png}`

**Steps:**
- [ ] Compress all `.jpg` files to 80% quality, max 1920px width
- [ ] Convert large PNGs to WebP format
- [ ] Resize destination images to 1920x1080 max
- [ ] Compress aircraft images to 1200x800 max
- [ ] Test image quality on site
- [ ] Measure new total size (should be < 20MB)

---

#### 3.2 ✅ Move Videos to CDN
**Files:** `public/images/**/*.mp4` (4 files, ~80MB)
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 3 hours

**Options:**
1. **Cloudflare Stream** (Recommended)
2. **Mux**
3. **AWS S3 + CloudFront**

**Implementation (Cloudflare Stream):**
```typescript
// 1. Upload videos to Cloudflare Stream
// 2. Get video URLs
// 3. Update components

// src/components/Hero.tsx
<video src="https://customer-xxxxx.cloudflarestream.com/video-id/manifest/video.m3u8" />

// src/components/FleetSection.tsx
// Update all video sources
```

**Steps:**
- [ ] Sign up for Cloudflare Stream
- [ ] Upload 4 videos:
  - hero-video.mp4
  - aircrafts/light/light_video.mp4
  - aircrafts/medium/medium_video.mp4
  - aircrafts/heavy/heavy_video.mp4
- [ ] Get streaming URLs
- [ ] Update Hero.tsx
- [ ] Update FleetSection.tsx
- [ ] Test video playback
- [ ] Delete local video files
- [ ] Update .gitignore to exclude videos

---

#### 3.3 ✅ Add Image Lazy Loading
**Files:** All components using images
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 1 hour

**Steps:**
- [ ] Find all `<img>` tags: `grep -r "<img" src/components/`
- [ ] Replace with Next.js Image component
- [ ] Add `loading="lazy"` to non-critical images
- [ ] Keep `loading="eager"` for hero images

**Example:**
```typescript
// Before:
<img src="/images/destinations/brazil.jpg" alt="Rio de Janeiro" />

// After:
import Image from 'next/image'
<Image
  src="/images/destinations/brazil.jpg"
  alt="Rio de Janeiro"
  width={1920}
  height={1080}
  loading="lazy"
/>
```

---

#### 3.4 ✅ Optimize Logo Files
**Directory:** `public/images/`
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 30 minutes

**Current Mess:** 7 logo files
**Target:** 3 optimized SVGs

**Steps:**
- [ ] Keep and rename:
  - `flyfleet_logo_dark.png` → `logo-primary.svg` (convert to SVG)
  - `flyfleet_logo_white.png` → `logo-white.svg` (convert to SVG)
- [ ] Delete:
  - `flyfleet_logo.png`
  - `flyfleet_logo.svg`
  - `flyfleet_logo_new.svg`
  - `flyfleet_logo_white_transparent.png`
- [ ] Update references in components
- [ ] Test all logo appearances

---

## 🎨 PHASE 4: UX IMPROVEMENTS

#### 4.1 ✅ Fix Hero CTA Button Behavior
**File:** `src/components/Hero.tsx` lines 225-239
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 30 minutes

**Problem:** Button has both `href` and `onClick` - confusing behavior

**Current:**
```typescript
<a href="/quote" onClick={handlePrimaryCTA}>
  {content.primaryCTA}
</a>
```

**Fix:**
```typescript
<Button onClick={onQuoteRequest}>
  {content.primaryCTA}
</Button>
```

**Steps:**
- [ ] Remove `<a>` tag
- [ ] Replace with `<Button>` component
- [ ] Remove unused `handlePrimaryCTA` function
- [ ] Test modal opens correctly
- [ ] Update analytics tracking

---

#### 4.2 ✅ Add Carousel Pause Controls
**Files:**
- `src/components/AdditionalServicesCarousel.tsx`
- `src/components/DestinationsCarousel.tsx`

**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 1 hour

**Implementation:**
```typescript
const [isPlaying, setIsPlaying] = useState(true);

// Respect reduced motion
useEffect(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    emblaApi?.plugins()?.autoplay?.stop();
  }
}, [emblaApi]);

// Add pause button
<button
  onClick={() => {
    isPlaying ? emblaApi?.plugins()?.autoplay?.stop() : emblaApi?.plugins()?.autoplay?.play();
    setIsPlaying(!isPlaying);
  }}
  aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
>
  {isPlaying ? '⏸️' : '▶️'}
</button>
```

---

#### 4.3 ✅ Add Loading States for Images
**Files:** Both carousel components
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 2 hours

**Implementation:**
```typescript
const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

<div className="relative">
  {!loadedImages.has(index) && (
    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
  )}
  <img
    src={destination.image}
    onLoad={() => setLoadedImages(prev => new Set(prev).add(index))}
    className={loadedImages.has(index) ? 'opacity-100' : 'opacity-0'}
  />
</div>
```

---

#### 4.4 ✅ Fix Modal Animations & Scroll Lock
**File:** `src/app/[locale]/page.tsx` lines 276-345
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 2 hours

**Steps:**
- [ ] Install `react-modal` or use Headless UI Dialog
- [ ] Add fade-in animation
- [ ] Lock body scroll when modal open
- [ ] Add escape key handler
- [ ] Improve accessibility

**Implementation:**
```typescript
import { Dialog, Transition } from '@headlessui/react'

<Transition show={showQuoteForm}>
  <Dialog onClose={() => setShowQuoteForm(false)}>
    <Transition.Child
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black/50" />
    </Transition.Child>

    <Transition.Child
      enter="ease-out duration-300"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Dialog.Panel>
        {/* Modal content */}
      </Dialog.Panel>
    </Transition.Child>
  </Dialog>
</Transition>
```

---

#### 4.5 ✅ Improve Form Error Display
**File:** `src/components/QuoteForm.tsx`
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 2 hours

**Current:** Errors shown below field
**Improve:** Red border + inline error icon

**Implementation:**
```typescript
<div className="relative">
  <Input
    {...field}
    className={errors.email ? 'border-red-500' : ''}
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <div className="absolute right-3 top-3">
      <svg className="w-5 h-5 text-red-500">⚠️</svg>
    </div>
  )}
</div>
{errors.email && (
  <p id="email-error" className="mt-1 text-sm text-red-500">
    {errors.email.message}
  </p>
)}
```

---

#### 4.6 ✅ Add Success Feedback After Submission
**File:** `src/components/QuoteForm.tsx`
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 1 hour

**Current:** Modal just closes
**Improve:** Show success message first

**Implementation:**
```typescript
const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

// After successful submission
setSubmitStatus('success');

// In render:
{submitStatus === 'success' ? (
  <div className="text-center py-8">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-green-500">✓</svg>
    </div>
    <h3 className="text-2xl font-bold mb-2">¡Cotización Enviada!</h3>
    <p className="text-gray-600 mb-6">
      Te contactaremos en las próximas 24 horas.
    </p>
    <Button onClick={() => {
      setSubmitStatus('idle');
      onSubmitSuccess();
    }}>
      Cerrar
    </Button>
  </div>
) : (
  // Normal form
)}
```

---

#### 4.7 ✅ Add Empty States
**Files:** Various components
**Status:** ⏳ PENDING
**Priority:** 🟢 LOW
**Time:** 2 hours

**Create:**
```typescript
// src/components/ui/EmptyState.tsx
export function EmptyState({
  icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {action}
    </div>
  );
}
```

**Use in:**
- FAQComponent (no FAQs loaded)
- TestimonialsComponent (no testimonials)
- AirportSearch (no results)

---

#### 4.8 ✅ Add Carousel Progress Indicators
**Files:** Both carousel components
**Status:** ⏳ PENDING
**Priority:** 🟢 LOW
**Time:** 1 hour

**Implementation:**
```typescript
<div className="flex justify-center gap-2 mt-6">
  {slides.map((_, index) => (
    <button
      key={index}
      onClick={() => emblaApi?.scrollTo(index)}
      className={clsx(
        'w-2 h-2 rounded-full transition-all',
        currentIndex === index
          ? 'bg-navy-primary w-8'
          : 'bg-gray-300'
      )}
      aria-label={`Go to slide ${index + 1}`}
    />
  ))}
</div>
```

---

## 🔧 PHASE 5: CODE REFACTORING

#### 5.1 ✅ Refactor Homepage to Sections
**File:** `src/app/[locale]/page.tsx` (349 lines → ~100 lines)
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 4 hours

**Create New Files:**
```
src/app/[locale]/sections/
├── HeroSection.tsx
├── WhyChooseSection.tsx
├── UseCasesSection.tsx
└── TestimonialsSection.tsx
```

**New page.tsx:**
```typescript
export default function HomePage() {
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  return (
    <div className="min-h-screen">
      <Header locale={locale} />
      <main className="pt-14">
        <HeroSection onQuoteRequest={() => setShowQuoteForm(true)} />
        <ServicesGrid locale={locale} />
        <ProcessSteps locale={locale} />
        <WhyChooseSection locale={locale} />
        <AdditionalServicesCarousel locale={locale} />
        <FleetSection locale={locale} />
        <DestinationsCarousel locale={locale} />
        <UseCasesSection locale={locale} />
        <TestimonialsSection locale={locale} />
        <FAQComponent locale={locale} />
      </main>
      <Footer locale={locale} />
      <QuoteModal
        isOpen={showQuoteForm}
        onClose={() => setShowQuoteForm(false)}
      />
    </div>
  );
}
```

---

#### 5.2 ✅ Create BaseCarousel Component
**New File:** `src/components/carousels/BaseCarousel.tsx`
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 2 hours

**Extract Common Logic:**
```typescript
export function BaseCarousel<T>({
  slides,
  renderSlide,
  autoplayDelay = 5500,
  options = {}
}: BaseCarouselProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      ...options
    },
    [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })]
  );

  // Common navigation logic
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => renderSlide(slide, index))}
        </div>
      </div>

      {/* Navigation buttons */}
      <CarouselButton direction="prev" onClick={scrollPrev} />
      <CarouselButton direction="next" onClick={scrollNext} />
    </div>
  );
}
```

**Then simplify:**
```typescript
// AdditionalServicesCarousel.tsx
export function AdditionalServicesCarousel({ locale }: Props) {
  return (
    <BaseCarousel
      slides={getServices(locale)}
      renderSlide={(service) => <ServiceCard {...service} />}
    />
  );
}
```

---

#### 5.3 ✅ Create Modal Component
**New File:** `src/components/ui/Modal.tsx`
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 1 hour

**Implementation:**
```typescript
import { Dialog, Transition } from '@headlessui/react'

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}: ModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className={clsx(
              'bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto',
              size === 'sm' && 'max-w-md',
              size === 'md' && 'max-w-2xl',
              size === 'lg' && 'max-w-4xl',
            )}>
              <div className="flex justify-between items-center p-6 border-b">
                <Dialog.Title className="text-2xl font-bold">
                  {title}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6">×</svg>
                </button>
              </div>
              <div className="p-6">
                {children}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
```

**Usage:**
```typescript
<Modal
  isOpen={showQuoteForm}
  onClose={() => setShowQuoteForm(false)}
  title={t('quote.title')}
  size="lg"
>
  <QuoteForm onSubmitSuccess={() => setShowQuoteForm(false)} />
</Modal>
```

---

#### 5.4 ✅ Move Hardcoded Translations to i18n
**Files:** Multiple components
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 2 hours

**Find all instances:**
```bash
grep -r "locale === 'es'" src/components/
```

**Move to message files:**
```json
// messages/es.json
{
  "services": {
    "title": "Servicios Adicionales",
    "subtitle": "Servicios complementarios para hacer de tu viaje una experiencia excepcional"
  }
}
```

**Update components:**
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('services');

<h2>{t('title')}</h2>
<p>{t('subtitle')}</p>
```

---

#### 5.5 ✅ Extract Navigation Items to Config
**File:** `src/components/Navigation/Header.tsx` lines 26-58
**New File:** `src/config/navigation.ts`
**Status:** ⏳ PENDING
**Priority:** 🟢 LOW
**Time:** 30 minutes

**Create:**
```typescript
// src/config/navigation.ts
export const navigationItems = {
  en: [
    { href: '/', label: 'Home', description: 'Return to homepage' },
    { href: '/what-we-do', label: 'What We Do', description: 'Our aviation services' },
    // ...
  ],
  es: [
    { href: '/', label: 'Inicio', description: 'Volver al inicio' },
    // ...
  ],
  pt: [
    // ...
  ]
}
```

**Update Header.tsx:**
```typescript
import { navigationItems } from '@/config/navigation';

const items = navigationItems[locale];
```

---

#### 5.6 ✅ Create Design Tokens File
**New File:** `src/lib/design-tokens.ts`
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 1 hour

**Implementation:**
```typescript
// src/lib/design-tokens.ts
export const colors = {
  navy: {
    primary: '#13213d',
    50: '#f0f4f8',
    100: '#d9e2ec',
    200: '#bcccdc',
    300: '#9fb3c8',
    400: '#829ab1',
    500: '#627d98',
    600: '#486581',
    700: '#334e68',
    800: '#243b53',
    900: '#13213d',
  },
  blue: {
    accent: '#2F6AEF',
  },
  neutral: {
    light: '#F4F6F8',
    medium: '#828FA0',
  },
  white: '#FFFFFF',
  black: '#000000',
};

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
};

export const spacing = {
  section: {
    sm: '3rem',   // 48px
    md: '4rem',   // 64px
    lg: '5rem',   // 80px
    xl: '6rem',   // 96px
  }
};

export const shadows = {
  soft: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  medium: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  large: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};
```

**Update tailwind.config.js:**
```javascript
import { colors, fontSize, shadows } from './src/lib/design-tokens';

module.exports = {
  theme: {
    extend: {
      colors,
      fontSize,
      boxShadow: shadows,
    }
  }
}
```

---

## 🧪 PHASE 6: TESTING

#### 6.1 ✅ Write API Route Tests
**New Files:** `src/app/api/**/__tests__/*.test.ts`
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 6 hours

**Test Files to Create:**
```
src/app/api/
├── quote/__tests__/route.test.ts
├── contact/__tests__/route.test.ts
├── airports/__tests__/route.test.ts
├── faqs/__tests__/route.test.ts
└── admin/__tests__/
    ├── quotes.test.ts
    ├── email-stats.test.ts
    └── email-activities.test.ts
```

**Example Test:**
```typescript
// src/app/api/quote/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/quote', () => {
  it('should create quote with valid data', async () => {
    const req = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: 'charter',
        departureAirport: 'EZE',
        // ...
      })
    });

    const response = await POST(req);
    expect(response.status).toBe(201);
  });

  it('should reject invalid reCAPTCHA', async () => {
    // Test reCAPTCHA validation
  });

  it('should respect rate limiting', async () => {
    // Test rate limiting
  });
});
```

---

#### 6.2 ✅ Write Component Tests
**New Files:** `src/components/**/__tests__/*.test.tsx`
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 8 hours

**Priority Components to Test:**
- [ ] Hero.tsx
- [ ] QuoteForm.tsx (already has tests ✅)
- [ ] ContactForm.tsx
- [ ] AdditionalServicesCarousel.tsx
- [ ] DestinationsCarousel.tsx
- [ ] Header.tsx
- [ ] Footer.tsx
- [ ] Button.tsx
- [ ] Modal.tsx
- [ ] AirportSearch.tsx

**Example:**
```typescript
// src/components/__tests__/Hero.test.tsx
import { render, screen } from '@testing-library/react';
import { Hero } from '../Hero';

describe('Hero', () => {
  it('renders headline in English', () => {
    render(<Hero locale="en" />);
    expect(screen.getByText(/Fly private, hassle-free/i)).toBeInTheDocument();
  });

  it('calls onQuoteRequest when CTA clicked', () => {
    const onQuoteRequest = jest.fn();
    render(<Hero locale="en" onQuoteRequest={onQuoteRequest} />);

    const button = screen.getByRole('link', { name: /get a quote/i });
    button.click();

    expect(onQuoteRequest).toHaveBeenCalled();
  });
});
```

---

#### 6.3 ✅ Achieve 80% Test Coverage
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 10 hours

**Steps:**
- [ ] Run `npm run test:coverage`
- [ ] Identify uncovered files
- [ ] Write tests for critical paths first
- [ ] Focus on:
  - All API routes (highest priority)
  - Form components
  - Business logic in lib/
  - Validation schemas
- [ ] Re-run coverage until >= 80%

---

#### 6.4 ✅ Add E2E Tests
**New Files:** `tests/e2e/*.spec.ts`
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 6 hours

**Tests to Add:**
```
tests/e2e/
├── quote-flow.spec.ts
├── contact-flow.spec.ts
├── navigation.spec.ts
├── language-switching.spec.ts
└── responsive.spec.ts
```

**Example:**
```typescript
// tests/e2e/quote-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete quote flow', async ({ page }) => {
  await page.goto('/');

  // Click quote CTA
  await page.click('text=Get a quote');

  // Fill form
  await page.fill('[name="departureAirport"]', 'EZE');
  await page.fill('[name="arrivalAirport"]', 'MIA');
  await page.fill('[name="email"]', 'test@example.com');
  // ...

  // Submit
  await page.click('button[type="submit"]');

  // Verify success
  await expect(page.locator('text=Cotización Enviada')).toBeVisible();
});
```

---

## 🎨 PHASE 7: DESIGN SYSTEM

#### 7.1 ✅ Document Design System
**New File:** `DESIGN_SYSTEM.md`
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 3 hours

**Create comprehensive documentation:**
```markdown
# Fly-Fleet Design System

## Colors
- Primary: Navy #13213d
- Accent: Blue #2F6AEF
- Neutral Light: #F4F6F8
- Neutral Medium: #828FA0

## Typography
- Font Family: Poppins
- Sizes: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl
- Weights: 300, 400, 500, 600, 700

## Spacing
- Section padding: py-12, py-16, py-24, py-32
- Component padding: p-4, p-6, p-8
- Gap: gap-4, gap-6, gap-8

## Shadows
- soft: Subtle elevation
- medium: Cards, dropdowns
- large: Modals, popovers

## Components
[Document each UI component with examples]
```

---

#### 7.2 ✅ Fix Typography Scale
**File:** `src/app/globals.css` + components
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 2 hours

**Standardize all heading sizes:**
```css
/* globals.css */
h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

h2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

h3 {
  font-size: clamp(1.25rem, 3vw, 1.875rem);
  line-height: 1.3;
}

body {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.6;
}
```

**Remove inconsistent clamp() calls from components**

---

#### 7.3 ✅ Fix Font Loading
**File:** `src/app/globals.css` line 34
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 1 hour

**Problem:** "Soul Gaze BC" referenced but never loaded

**Options:**
1. **Remove the font** (simplest)
2. **Add the font file** and load it

**If removing:**
```css
/* Change from: */
--font-heading: 'Soul Gaze BC', 'Poppins', serif;

/* To: */
--font-heading: 'Poppins', system-ui, sans-serif;
```

**If adding:**
```css
@font-face {
  font-family: 'Soul Gaze BC';
  src: url('/fonts/soul-gaze-bc.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
}
```

---

#### 7.4 ✅ Enforce Spacing Scale
**Files:** All components
**Status:** ⏳ PENDING
**Priority:** 🟢 LOW
**Time:** 1 hour

**Current inconsistency:**
- Some: `py-12`
- Some: `py-16`
- Some: `py-20`
- Some: `py-24`

**Standardize to:**
```
py-12  (3rem / 48px)  - Small sections
py-16  (4rem / 64px)  - Medium sections
py-24  (6rem / 96px)  - Large sections
py-32  (8rem / 128px) - Hero sections
```

**Find & replace:**
```bash
# Find all non-standard values
grep -r "py-20" src/
# Replace with py-24
```

---

#### 7.5 ✅ Enforce Shadow Scale
**Files:** All components
**Status:** ⏳ PENDING
**Priority:** 🟢 LOW
**Time:** 1 hour

**Allowed values:**
- `shadow-soft` - Subtle lift
- `shadow-medium` - Cards
- `shadow-large` - Modals

**Find & replace:**
```bash
grep -r "shadow-lg\|shadow-xl\|shadow-2xl" src/
# Replace with design token equivalents
```

---

## ♿ PHASE 8: ACCESSIBILITY

#### 8.1 ✅ Fix Keyboard Navigation
**Files:** Multiple
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 4 hours

**Issues to fix:**
- [ ] Carousel navigation buttons missing focus styles
- [ ] Tab order in modal (already has focus trap ✅)
- [ ] Skip link styling (Hero.tsx:132-137)
- [ ] Add keyboard shortcut for mobile menu

**Focus styles:**
```css
/* Add to all interactive elements */
.focus-visible:focus {
  outline: 2px solid var(--navy-primary);
  outline-offset: 2px;
}

/* Or use tailwind: */
className="focus:ring-2 focus:ring-navy-primary focus:ring-offset-2"
```

**Test:**
- [ ] Tab through entire page
- [ ] Verify logical tab order
- [ ] Ensure all interactive elements have visible focus

---

#### 8.2 ✅ Add ARIA Labels
**Files:** Multiple
**Status:** ⏳ PENDING
**Priority:** 🔴 HIGH
**Time:** 2 hours

**Missing labels:**
```typescript
// Icon buttons
<button aria-label="Previous slide">←</button>
<button aria-label="Next slide">→</button>
<button aria-label="Close modal">×</button>
<button aria-label="Open menu">☰</button>

// Carousel
<div role="region" aria-label="Service carousel">

// Images
<img src="..." alt="Descriptive alt text" />
```

**Run:**
```bash
npm run test:accessibility
# Fix all missing label warnings
```

---

#### 8.3 ✅ Fix Contrast Ratios
**Files:** Various
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 2 hours

**Issues:**
```css
/* FAILS: text-gray-500 on white = 4.3:1 (needs 4.5:1) */
.text-gray-500 → .text-gray-600

/* FAILS: text-white/90 on navy = 3.8:1 */
text-white/90 → text-white (full opacity)

/* Check hero subtext */
```

**Tool:** Use browser DevTools or https://webaim.org/resources/contrastchecker/

**Steps:**
- [ ] Find all color combinations
- [ ] Test with contrast checker
- [ ] Adjust colors to meet WCAG AA (4.5:1 for normal text, 3:1 for large)

---

#### 8.4 ✅ Test with Screen Reader
**Status:** ⏳ PENDING
**Priority:** 🟡 MEDIUM
**Time:** 3 hours

**Test with:**
- VoiceOver (Mac): `Cmd + F5`
- NVDA (Windows): Free download
- JAWS (Windows): Trial version

**Critical flows to test:**
- [ ] Navigation menu
- [ ] Quote form
- [ ] Carousel navigation
- [ ] Modal opening/closing
- [ ] Form error announcements

**Verify:**
- [ ] All interactive elements announced
- [ ] Form labels read correctly
- [ ] Error messages announced
- [ ] Success messages announced
- [ ] Focus moves logically

---

## 📝 ADDITIONAL NOTES

### Environment Variables Needed for Production

```bash
# Production .env
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

RESEND_API_KEY="re_NEW_KEY_AFTER_ROTATION"
RESEND_WEBHOOK_SECRET="whsec_..."
BUSINESS_EMAIL="info@fly-fleet.com"
NOREPLY_EMAIL="noreply@fly-fleet.com"

NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6Le..."  # PRODUCTION KEY
RECAPTCHA_SECRET_KEY="6Le..."  # PRODUCTION KEY
RECAPTCHA_SCORE_THRESHOLD="0.5"

NEXT_PUBLIC_BASE_URL="https://fly-fleet.com"
FRONTEND_URL="https://fly-fleet.com"
ADMIN_URL="https://fly-fleet.com/admin"

WHATSAPP_BUSINESS_NUMBER="+5491234567890"
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."

UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

ADMIN_USERNAME="admin"
ADMIN_PASSWORD="$2b$10$..."  # bcrypt hash
NEXTAUTH_SECRET="..."  # Generate: openssl rand -base64 32
NEXTAUTH_URL="https://fly-fleet.com"

NODE_ENV="production"
```

---

## 🎯 SUCCESS CRITERIA

**Before marking complete, verify:**

### Phase 1 - Security
- [ ] New Resend API key working
- [ ] .env.local removed from git history
- [ ] Admin routes require authentication
- [ ] Build succeeds without ignore flags
- [ ] No TypeScript errors
- [ ] No ESLint errors

### Phase 2 - Bugs
- [ ] Single navy-primary color definition
- [ ] Spanish text complete
- [ ] No console.log in production
- [ ] One PostCSS config file
- [ ] Unused assets deleted

### Phase 3 - Performance
- [ ] Images < 20MB total
- [ ] Videos on CDN
- [ ] Lazy loading implemented
- [ ] Logo files consolidated

### Phase 4 - UX
- [ ] Hero CTA behavior correct
- [ ] Carousel has pause control
- [ ] Loading states visible
- [ ] Modal animations smooth
- [ ] Form errors clear
- [ ] Success feedback shown

### Phase 5 - Refactoring
- [ ] Homepage < 100 lines
- [ ] BaseCarousel extracted
- [ ] Modal component created
- [ ] Translations in i18n files
- [ ] Design tokens file created

### Phase 6 - Testing
- [ ] API routes tested
- [ ] Components tested
- [ ] 80% coverage achieved
- [ ] E2E tests passing

### Phase 7 - Design System
- [ ] Design system documented
- [ ] Typography consistent
- [ ] Font loading fixed
- [ ] Spacing standardized
- [ ] Shadows standardized

### Phase 8 - Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels added
- [ ] Contrast ratios pass
- [ ] Screen reader tested

---

## 🚨 DEPLOYMENT CHECKLIST

**Before deploying to production:**

- [ ] All Phase 1 (Security) complete
- [ ] All Phase 2 (Critical Bugs) complete
- [ ] At least 50% test coverage
- [ ] Images optimized
- [ ] All critical UX issues fixed
- [ ] Production environment variables set
- [ ] Database migrations tested
- [ ] Email sending tested
- [ ] reCAPTCHA tested with production keys
- [ ] SSL certificate configured
- [ ] Custom domain configured
- [ ] Analytics tracking verified
- [ ] Error monitoring set up (Sentry)
- [ ] Uptime monitoring configured
- [ ] Team notified of deployment
- [ ] Rollback plan documented

---

## 📞 SUPPORT & RESOURCES

**Documentation:**
- Next.js 15: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Prisma: https://www.prisma.io/docs
- next-intl: https://next-intl-docs.vercel.app
- Playwright: https://playwright.dev
- Jest: https://jestjs.io

**Tools:**
- Image Compression: https://squoosh.app
- Contrast Checker: https://webaim.org/resources/contrastchecker
- WAVE Accessibility: https://wave.webaim.org
- Lighthouse: Built into Chrome DevTools

**Team Communication:**
- Create issues for each major task
- Use PR reviews for code changes
- Document decisions in README
- Update this file as work progresses

---

**Last Updated:** January 6, 2026
**Owner:** Development Team
**Reviewer:** Staff Engineer
**Status:** 🔴 IN PROGRESS

---

_This document is a living guide. Update it as tasks are completed and new issues are discovered._
