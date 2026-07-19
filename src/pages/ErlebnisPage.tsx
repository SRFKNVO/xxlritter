import PageHero from '../components/PageHero';
import Erlebnis from '../components/Erlebnis';

export default function ErlebnisPage() {
  return (
    <div>
      <PageHero
        title="Das Erlebnis"
        subtitle="Geschichte & Atmosphäre"
        description="Tauche ein in die Geschichte des Ritter XXL – von den Anfängen bis heute."
      />
      <Erlebnis />
    </div>
  );
}
