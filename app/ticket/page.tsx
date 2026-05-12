import { SiteHeader } from "@/components/marketing/site-header";
import { TicketSummary } from "@/components/ticket/ticket-summary";

export default function TicketPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <TicketSummary />
      </section>
    </main>
  );
}
