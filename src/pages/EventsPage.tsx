import PageHero from '../components/PageHero';
import Events from '../components/Events';

export default function EventsPage() {
  return (
    <div>
      <PageHero
        title="Events & Feiern"
        subtitle="Unvergessliche Momente"
        description="Ritterbankette, Hochzeiten, Firmenfeiern und mehr – wir machen jedes Fest zum Erlebnis."
      />
      <Events />
    </div>
  );
}
