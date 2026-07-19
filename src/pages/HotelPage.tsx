import PageHero from '../components/PageHero';
import Hotel from '../components/Hotel';

export default function HotelPage() {
  return (
    <div>
      <PageHero
        title="Landhotel"
        subtitle="Übernachten im Schwarzwald"
        description="Komfortable Zimmer mit rustikalem Flair und herzlicher Gastfreundschaft – dein Zuhause auf Zeit."
      />
      <Hotel />
    </div>
  );
}
