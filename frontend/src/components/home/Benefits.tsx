import { PLATFORM_BENEFITS } from "@/lib/tools";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BenefitIcon } from "@/components/ui/ToolIcon";

export function Benefits() {
  return (
    <section
      aria-labelledby="benefits-heading"
      className="border-t border-slate-200/80 bg-white py-16 sm:py-20"
    >
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Why OneToolHub"
          title="Built for Everyday Productivity"
          description="A clean, dependable utility experience focused on speed, clarity, and accessibility across all devices."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_BENEFITS.map((benefit) => (
            <div
              key={benefit.id}
              className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 transition-colors hover:bg-white hover:shadow-xs"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                <BenefitIcon
                  name={benefit.icon}
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </span>
              <h3 className="mt-5 text-base font-bold text-slate-900">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
