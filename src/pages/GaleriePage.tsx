import PageHero from '../components/PageHero';
import Galerie from '../components/Galerie';

export default function GaleriePage() {
  return (
    <div>
      <PageHero
        title="Galerie"
        subtitle="Einblicke"
        description="Fotos aus unserem Restaurant, dem Landhotel und unvergesslichen Veranstaltungen."
      />
      <Galerie />
    </div>
  );
}
