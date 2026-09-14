import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { aboutPage } from '../../data/demoContent';

export default function About() {
  const { intro, story, howItWorks, craft, team, visit, cta } = aboutPage;

  return (
    <div className="w-full">
      <section className="border-b border-[var(--bf-border)] bg-[#fffaf4] px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="bf-page text-xs font-semibold uppercase tracking-[0.28em] text-[var(--bf-accent)]">
            {intro.eyebrow}
          </p>
          <h1 className="bf-page bf-display mt-3 text-3xl font-bold text-[var(--bf-ink)] sm:text-5xl">
            {intro.headline}
          </h1>
          <p className="bf-page-delay mt-4 text-base text-[var(--bf-muted)] sm:text-lg">
            {intro.mission}
          </p>
          <div className="bf-page-delay mt-8">
            <Link to="/menu">
              <Button>{cta.menuLabel}</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="bf-display text-2xl font-bold text-[var(--bf-ink)] sm:text-3xl">
              {story.title}
            </h2>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[var(--bf-accent)]">
              {story.sinceLabel}
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--bf-muted)]">
              {story.body}
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-[var(--bf-placeholder)] shadow-md">
            <img
              src={story.imageUrl}
              alt=""
              className="aspect-[4/3] h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#f3ebe0] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="bf-display text-center text-2xl font-bold text-[var(--bf-ink)] sm:text-3xl">
            {howItWorks.title}
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {howItWorks.steps.map((step, index) => (
              <li key={step.title} className="text-center sm:text-left">
                <span className="bf-display text-3xl font-bold text-[var(--bf-accent)]">
                  {index + 1}
                </span>
                <h3 className="bf-display mt-2 text-lg font-bold text-[var(--bf-ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--bf-muted)]">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="bf-display text-center text-2xl font-bold text-[var(--bf-ink)] sm:text-3xl">
            {craft.title}
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {craft.items.map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--bf-muted)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3ebe0] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="bf-display text-center text-2xl font-bold text-[var(--bf-ink)] sm:text-3xl">
            {team.title}
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {team.members.map((member) => (
              <div key={member.role} className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--bf-accent)]">
                  {member.role}
                </p>
                <h3 className="bf-display mt-1 text-lg font-bold text-[var(--bf-ink)]">
                  {member.name}
                </h3>
                <p className="mt-2 text-sm text-[var(--bf-muted)]">{member.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="bf-display text-2xl font-bold text-[var(--bf-ink)] sm:text-3xl">
            {visit.title}
          </h2>
          <dl className="mt-8 space-y-3 text-sm text-[var(--bf-muted)] sm:text-base">
            <div>
              <dt className="inline font-semibold text-[var(--bf-ink)]">Hours: </dt>
              <dd className="inline">{visit.hours}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-[var(--bf-ink)]">Address: </dt>
              <dd className="inline">{visit.address}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-[var(--bf-ink)]">Email: </dt>
              <dd className="inline">{visit.email}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-[var(--bf-ink)]">Phone: </dt>
              <dd className="inline">{visit.phone}</dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-[var(--bf-muted)]">{visit.note}</p>
        </div>
      </section>

      <section className="border-t border-[var(--bf-border)] bg-[#2a1a12] px-4 py-14 text-center text-[#f7f1e8]">
        <h2 className="bf-display text-2xl font-bold sm:text-3xl">{cta.title}</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/menu">
            <Button className="!bg-white !text-[var(--bf-ink)] hover:!bg-[#f7f1e8]">
              {cta.menuLabel}
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="ghost" className="!text-white hover:!bg-white/10">
              {cta.registerLabel}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
