import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { APP_NAME } from '../../utils/constants';
import Button from '../../components/common/Button';
import {
  demoBanner,
  demoDesserts,
  demoHero,
  demoHighlights,
  demoRecommended,
  demoStats,
  demoTestimonials,
} from '../../data/demoContent';

function DemoProductCard({ item }) {
  return (
    <article className="bf-card overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden bg-[var(--bf-placeholder)]">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
            {item.name}
          </h3>
          <span className="text-sm font-semibold text-[var(--bf-accent)]">
            {item.priceLabel}
          </span>
        </div>
        <p className="text-sm text-[var(--bf-muted)]">{item.blurb}</p>
        <Link to="/menu" className="inline-block pt-1">
          <Button className="!px-4 !py-2 text-xs">Order Now</Button>
        </Link>
      </div>
    </article>
  );
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative isolate min-h-[78vh] overflow-hidden">
        <img
          src={demoHero.imageUrl}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[rgba(42,26,18,0.55)] via-[rgba(42,26,18,0.4)] to-[rgba(42,26,18,0.65)]" />

        <div className="mx-auto flex min-h-[78vh] max-w-4xl flex-col items-center justify-center px-4 py-20 text-center">
          <p className="bf-page text-xs font-semibold uppercase tracking-[0.3em] text-[#f0d9c0]">
            {demoHero.eyebrow}
          </p>
          <h1 className="bf-page bf-display mt-4 text-4xl font-bold leading-tight text-white sm:text-6xl">
            {demoHero.headline || APP_NAME}
          </h1>
          <p className="bf-page-delay mt-4 max-w-xl text-base text-[#f7f1e8]/90 sm:text-lg">
            {demoHero.subcopy}
          </p>
          <div className="bf-page-delay mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/menu">
              <Button className="!bg-white !text-[var(--bf-ink)] hover:!bg-[#f7f1e8]">
                {demoHero.ctaLabel}
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link to="/account">
                <Button variant="ghost" className="!text-white hover:!bg-white/10">
                  Hi, {user?.name?.split(' ')[0] || 'there'}
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="ghost" className="!text-white hover:!bg-white/10">
                  Log in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
          {demoHighlights.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border-4 border-[#f3ebe0] shadow-md">
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <h2 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--bf-muted)]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended drinks (dummy) */}
      <section className="bg-[#f3ebe0] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="bf-display text-3xl font-bold text-[var(--bf-ink)]">
              Most recommended coffee
            </h2>
            <p className="mt-2 text-sm text-[var(--bf-muted)]">
              Sample favorites for layout preview — open the live menu to order.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {demoRecommended.map((item) => (
              <DemoProductCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Recommended desserts (dummy) */}
      <section className="bg-[var(--bf-bg)] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="bf-display text-3xl font-bold text-[var(--bf-ink)]">
              Most recommended desserts
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {demoDesserts.map((item) => (
              <DemoProductCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white px-4 py-14">
        <div className="mx-auto grid max-w-4xl gap-8 text-center sm:grid-cols-3">
          {demoStats.map((stat) => (
            <div key={stat.label}>
              <p className="bf-display text-4xl font-bold text-[var(--bf-accent)]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[var(--bf-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="relative isolate overflow-hidden px-4 py-20">
        <img
          src={demoBanner.imageUrl}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[rgba(42,26,18,0.7)]" />
        <div className="mx-auto max-w-3xl text-center text-white">
          <h2 className="bf-display text-3xl font-bold sm:text-4xl">
            {demoBanner.title}
          </h2>
          <div className="mt-6">
            <Link to="/menu">
              <Button className="!bg-white !text-[var(--bf-ink)] hover:!bg-[#f7f1e8]">
                {demoBanner.ctaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#2a1a12] px-4 py-16 text-[#f7f1e8]">
        <div className="mx-auto max-w-6xl">
          <h2 className="bf-display mb-10 text-center text-3xl font-bold">
            What guests say
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {demoTestimonials.map((t) => (
              <article
                key={t.name}
                className="rounded-2xl bg-white p-5 text-[var(--bf-ink)] shadow-lg"
              >
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src={t.imageUrl}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <p className="font-semibold">{t.name}</p>
                </div>
                <p className="text-sm text-[var(--bf-muted)]">“{t.quote}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
