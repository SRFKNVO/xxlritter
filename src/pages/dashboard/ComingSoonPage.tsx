export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h1 className="font-cinzel font-bold text-2xl text-forest mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
        {title}
      </h1>
      <p className="font-inter text-sm text-forest-muted">
        Dieser Bereich folgt in einer der nächsten Ausbaustufen.
      </p>
    </div>
  );
}
