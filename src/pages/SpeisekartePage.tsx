import PageHero from '../components/PageHero';
import Speisekarte from '../components/Speisekarte';
import SpeisekartenListe from '../components/SpeisekartenListe';

export default function SpeisekartePage() {
  return (
    <div>
      <PageHero
        title="Speisekarte"
        subtitle="XXL-Gerichte & Spezialitäten"
        description="Gigantische Portionen, regionale Spezialitäten und legendäre Ritterplatten – für echte Helden am Tisch."
      />
      <Speisekarte />
      <SpeisekartenListe />
    </div>
  );
}
