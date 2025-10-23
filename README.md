## Some looks for now, have to fix a lot to make it work as expected 📸
###### Had some changes in direction then some back and forth with the idea now moving forward with my favourite in the segment <br /> `FeatureBase` and mixing the admin with linear like styles + wan't to achieve some good ux and learn something new so some <br /> `tanstack-db` optimistic first style updates added for now and will try to add some local first features in next iterations 

<img width="400" height="auto" alt="image" src="https://github.com/user-attachments/assets/90609908-58db-4d1c-9387-6aa16ed94a0f" />
<img width="425" height="auto" alt="image" src="https://github.com/user-attachments/assets/97762448-3ecf-485c-830a-113eec6807b6" />

---

## 🚀 Improvement Roadmap

I keep this roadmap mostly for myself so future-me remembers what felt important at the time. A bunch of it is stitched together from blog notes, TanStack twitter threads people, and random indie reddit SaaS threads I bookmarked.

### ✅ Already Completed

Stuff I'm not touching right now (rare feeling):
- ✅ **Automated CD Pipeline** – all 4 apps still deploy when I push to `main`
- ✅ **Widget Distribution** – pushes a fresh build to the public repo so I can hotlink it
- ✅ **Multi-App Cloudflare Workers** – admin/public/server are on Workers, surprisingly stable
- ✅ **Database Migrations** – drizzle migrations run on deploy, thanks to that midnight note from [this Neon guide](https://neon.tech/blog/serverless-postgres-cloudflare-workers)
- ✅ **Secrets Management** – storing env vars in GitHub + wrangler secrets, no plaintext horrors
- ✅ **Path-Based Triggers** – workflow only runs for changed apps (borrowed from a Graphite article)
- ✅ **Environment Configuration** – `.env.example` lives in each app so I can reset fast

`deploy-widget.yml` is still the hero here; it’s the messy but reliable script that wires the whole thing together, i understand what it does for now, different steps in it but i dont want to change it.

---

### 📅 Up Next (ish)

#### CI/CD & Deployment
- [ ] **1. GitHub Actions Pipeline** – want a tiny `ci.yml` that runs lint + typecheck. Preview deploys would be neat but not urgent.
- [x] **2. Environment Management** – `.env.example` files are in place; `scripts/bootstrap.ts` copies them. Small win for tired mornings.

#### Code Quality (Keep It Scrappy)
- [ ] **3. Basic CI Checks** – once the `ci.yml` exists I’ll let it run on PRs. Not adding full test matrices yet.
- [x] Pre-commit linting rides on `lint-staged`. If it hurts I can toggle it. --no-verify is always there.
- [x] No automated tests yet; TypeScript + manual QA after deploy is the compromise for now.

---

### 📅 Active Development (Trying Not to Overcook It)

#### Code Organization
- [x] **4. Shared Component Library** – `packages/ui` exists and is slowly getting cleaned up.
- [ ] **5. Shared Types?** – maybe a `packages/types` if the duplication gets annoying. Parking it for now.

#### Database (Neon Hosted)
- [ ] **6. Local DX** – Neon backups are automatic, but I still owe myself a `seed` script and a quick note on rolling back migrations (probably copying from that Drizzle blog post I saved).

---

### 📅 Production Ready-ish (Month 2-3? maybe)

#### Environments
- [ ] **7. Staging Environment** – likely just a second Worker + Neon branch when real users show up. Keeping the note here so I don’t forget.

#### Release Management
- [ ] **8. Release Flow** – experiment with conventional commits + manual changelog. Automating tags can wait until there are paying teams.

#### Performance Monitoring
- [ ] **9. Performance Checks** – enable Cloudflare Analytics, run Lighthouse locally every now and then, maybe add a bundle size script if deploys creep up.

---

### 📅 Before Letting Strangers In (Later)

#### Monitoring & Errors
- [ ] **10. Production Monitoring** – Sentry (or even Logtail) plus a Discord webhook so I don’t miss crashes.

#### API Documentation
- [ ] **11. Widget Docs** – light write-up + examples so folks know how to embed it. maybe OpenApi plugin in oRPC docs if I keep that stack.

#### TypeScript Improvements  
- [ ] **12. Stricter Types** – flip `noUncheckedIndexedAccess` once I have a free week.

#### Pre-Launch Polish
- [ ] **13. Launch Checklist** – manual pass on critical flows, responsive checks, email smoke test, GitHub integration sanity check, quick accessibility skim. Borrowed from a ShipFast article.

---

### 📅 Long-ish Term (If This Actually Grows)

#### Infrastructure as Code
- [ ] **14. IaC** – maybe alchemy or pulumi. For now it’s manual but documented.

#### Dependency Management
- [x] **15. Dependency Health** – React versions are aligned, shared deps centralized, dependabot enabled. Thanks to the Graphite article (https://graphite.dev/guides/strategies-managing-dependencies-monorepo).

---

### 📊 Progress Tracking (Mostly for sanity)

**Current Status:** Learning & Building 🚀  
**Overall Progress:** 9/14-ish Items – foundation feels decent.

#### Phase 1: Foundation ✅
- ✅ Automated deployments (all 4 apps)
- ✅ Environment configuration
- ✅ Pre-commit linting
- ✅ Security scanning (Dependabot + TruffleHog)
- ✅ Security headers (Hono middleware)
- ✅ GitHub Secret Scanning enabled
- ✅ TypeScript + Biome linting
- ✅ Cloudflare Workers pipeline
- ✅ Database backups (Neon handles)

#### Phase 2: Active Development (Now)
- [x] Shared component library
- [ ] Database seed scripts

#### Phase 3: Production Ready-ish
- [ ] Staging environment
- [ ] Release automation
- [ ] Performance checks

#### Phase 4: Before Launch
- [ ] Sentry / monitoring
- [ ] Widget docs
- [ ] Strict TypeScript flags
- [ ] Launch checklist run-through

#### Phase 5: Someday
- [ ] Infrastructure as code
- [ ] Anything else I pick up from other founders

---

### 🎯 Current Focus

**✅ What's Working:**
- Push to main → auto deploy still magical
- TypeScript catches most oops
- Security scans run quietly in the background
- Neon keeps backups

**🔨 Next Steps:**
1. Draft `ci.yml` (lint + typecheck)  
2. Flesh out seed data script  
3. Write down a migration rollback note  

**📅 Later:**
- Staging worker once there’s real traffic  
- Some form of release notes (even Notion)  
- Manual Lighthouse runs during big UI pushes

**⏸️ Before Launch:**
- Wire up Sentry  
- Ship widget docs  
- Tighten TypeScript strictness  
- Manual regression sweep before opening the doors
