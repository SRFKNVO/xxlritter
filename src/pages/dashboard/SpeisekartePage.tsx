import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import {
  createMenuItem,
  createPromotion,
  deleteMenuItem,
  deletePromotion,
  deletePublicImage,
  fetchMenuItems,
  fetchPromotions,
  publicImageUrl,
  publishPromotionToSlot,
  unpublishPromotion,
  updateMenuItem,
  uploadPublicImage,
} from '../../lib/reservations';
import { resizeImageFile } from '../../lib/image';
import { supabaseConfigured } from '../../lib/supabase';
import type { MenuItem, Promotion } from '../../types/reservations';

export default function SpeisekartePage() {
  const [tab, setTab] = useState<'speisekarte' | 'aktionen'>('speisekarte');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([fetchMenuItems(), fetchPromotions()])
      .then(([m, p]) => {
        setItems(m);
        setPromotions(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-cinzel font-bold text-2xl text-forest" style={{ fontFamily: 'Cinzel, serif' }}>
          Speisekarte & Aktionen
        </h1>
        <div className="flex gap-2 bg-gray-100 rounded-sm p-1">
          <button
            onClick={() => setTab('speisekarte')}
            className={`px-4 py-1.5 rounded-sm text-sm font-inter transition-colors ${
              tab === 'speisekarte' ? 'bg-white text-forest shadow-sm' : 'text-forest-muted'
            }`}
          >
            Speisekarte
          </button>
          <button
            onClick={() => setTab('aktionen')}
            className={`px-4 py-1.5 rounded-sm text-sm font-inter transition-colors ${
              tab === 'aktionen' ? 'bg-white text-forest shadow-sm' : 'text-forest-muted'
            }`}
          >
            Aktionen & Karussell
          </button>
        </div>
      </div>

      {!supabaseConfigured && (
        <div className="mb-6 border border-amber-300 bg-amber-50 rounded-sm p-4">
          <p className="font-inter text-xs text-amber-800">
            Supabase ist noch nicht verbunden — diese Ansicht zeigt erst Daten, sobald das Projekt eingerichtet ist.
          </p>
        </div>
      )}

      {loading ? (
        <p className="font-inter text-sm text-forest-muted">Lädt...</p>
      ) : tab === 'speisekarte' ? (
        <SpeisekarteTab items={items} onChanged={load} />
      ) : (
        <AktionenTab promotions={promotions} onChanged={load} />
      )}
    </div>
  );
}

function SpeisekarteTab({ items, onChanged }: { items: MenuItem[]; onChanged: () => void }) {
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of items) {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [items]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !price) return;
    setSaving(true);
    try {
      await createMenuItem({ category: category.trim(), name: name.trim(), price: Number(price), description: null });
      setName('');
      setPrice('');
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleFieldBlur = async (item: MenuItem, field: 'name' | 'description', value: string) => {
    if (value === (item[field] || '')) return;
    await updateMenuItem(item.id, { [field]: value || null });
    onChanged();
  };

  const handlePriceBlur = async (item: MenuItem, value: string) => {
    const num = Number(value);
    if (!num || num === item.price) return;
    await updateMenuItem(item.id, { price: num });
    onChanged();
  };

  const handleToggleActive = async (item: MenuItem) => {
    await updateMenuItem(item.id, { is_active: !item.is_active });
    onChanged();
  };

  const handleDelete = async (item: MenuItem) => {
    await deleteMenuItem(item.id);
    onChanged();
  };

  return (
    <div>
      {[...grouped.entries()].map(([cat, catItems]) => (
        <div key={cat} className="mb-6">
          <h3 className="font-cinzel text-xs tracking-widest uppercase text-forest-muted mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            {cat}
          </h3>
          <div className="bg-white rounded-sm border border-gray-200 divide-y divide-gray-100">
            {catItems.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <input
                  defaultValue={item.name}
                  onBlur={(e) => handleFieldBlur(item, 'name', e.target.value)}
                  className="font-inter text-sm text-forest bg-transparent border-b border-transparent hover:border-gray-300 focus:border-forest outline-none px-1 py-0.5 w-40"
                />
                <input
                  defaultValue={item.description || ''}
                  placeholder="Beschreibung"
                  onBlur={(e) => handleFieldBlur(item, 'description', e.target.value)}
                  className="font-inter text-xs text-forest-muted bg-transparent border-b border-transparent hover:border-gray-300 focus:border-forest outline-none px-1 py-0.5 flex-1 min-w-[120px]"
                />
                <label className="flex items-center gap-1 text-xs font-inter text-forest-muted">
                  €
                  <input
                    type="number"
                    min={0}
                    step="0.10"
                    defaultValue={item.price}
                    onBlur={(e) => handlePriceBlur(item, e.target.value)}
                    className="w-20 border border-gray-200 rounded-sm px-2 py-1 text-forest"
                  />
                </label>
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`text-xs font-inter uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors ${
                    item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {item.is_active ? 'Aktiv' : 'Aus'}
                </button>
                <button onClick={() => handleDelete(item)} className="text-gray-400 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <form onSubmit={handleAdd} className="bg-white rounded-sm border border-gray-200 p-4 flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-inter text-forest-muted mb-1">Kategorie</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="z. B. Hauptgerichte"
            className="w-40 border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-inter text-forest-muted mb-1">Gericht</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
          />
        </div>
        <div>
          <label className="block text-xs font-inter text-forest-muted mb-1">Preis €</label>
          <input
            type="number"
            min={0}
            step="0.10"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-24 border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-forest text-white text-sm font-inter px-4 py-2 rounded-sm hover:bg-forest-mid transition-colors disabled:opacity-60"
        >
          <Plus size={15} />
          Hinzufügen
        </button>
      </form>
    </div>
  );
}

function AktionenTab({ promotions, onChanged }: { promotions: Promotion[]; onChanged: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [slotPicker, setSlotPicker] = useState<{ promotionId: string; occupiedSlots: Record<number, Promotion> } | null>(null);

  const carouselSlots = useMemo(() => {
    const map: Record<number, Promotion> = {};
    for (const p of promotions) {
      if (p.is_published && p.carousel_slot) map[p.carousel_slot] = p;
    }
    return map;
  }, [promotions]);

  const drafts = promotions.filter((p) => !p.is_published);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      let imagePath: string | null = null;
      if (pendingFile) {
        const resized = await resizeImageFile(pendingFile);
        imagePath = await uploadPublicImage(resized, 'promotions');
      }
      await createPromotion({ title: title.trim(), description: description.trim() || null, image_path: imagePath });
      setTitle('');
      setDescription('');
      setPendingFile(null);
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Promotion) => {
    if (p.image_path) await deletePublicImage(p.image_path).catch(() => {});
    await deletePromotion(p.id);
    onChanged();
  };

  const handlePublishClick = (p: Promotion) => {
    const freeSlot = ([1, 2, 3] as const).find((s) => !carouselSlots[s]);
    if (freeSlot) {
      publishPromotionToSlot(p.id, freeSlot).then(onChanged);
    } else {
      setSlotPicker({ promotionId: p.id, occupiedSlots: carouselSlots });
    }
  };

  const handleReplaceSlot = async (slot: 1 | 2 | 3) => {
    if (!slotPicker) return;
    const occupied = slotPicker.occupiedSlots[slot];
    if (occupied) await unpublishPromotion(occupied.id);
    await publishPromotionToSlot(slotPicker.promotionId, slot);
    setSlotPicker(null);
    onChanged();
  };

  return (
    <div>
      <h3 className="font-cinzel text-xs tracking-widest uppercase text-forest-muted mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
        Im Karussell ({Object.keys(carouselSlots).length}/3)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((slot) => {
          const p = carouselSlots[slot];
          return (
            <div key={slot} className="bg-white border border-gray-200 rounded-sm overflow-hidden">
              {p ? (
                <>
                  {p.image_path && <img src={publicImageUrl(p.image_path)} alt={p.title} className="w-full h-32 object-cover" />}
                  <div className="p-3">
                    <p className="font-inter text-sm text-forest font-medium">{p.title}</p>
                    <button
                      onClick={() => unpublishPromotion(p.id).then(onChanged)}
                      className="mt-2 text-xs font-inter text-red-600 hover:underline"
                    >
                      Aus Karussell nehmen
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full min-h-[100px] flex items-center justify-center text-xs font-inter text-forest-muted/50 p-4">
                  Slot {slot} frei
                </div>
              )}
            </div>
          );
        })}
      </div>

      {slotPicker && (
        <div className="mb-8 border border-amber-300 bg-amber-50 rounded-sm p-4">
          <p className="font-inter text-sm text-amber-900 mb-3">
            Alle 3 Plätze sind belegt. Welchen Platz soll die neue Aktion ersetzen?
          </p>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((slot) => (
              <button
                key={slot}
                onClick={() => handleReplaceSlot(slot)}
                className="text-xs font-inter bg-white border border-amber-300 rounded-sm px-3 py-2 hover:bg-amber-100"
              >
                Slot {slot} ersetzen ({slotPicker.occupiedSlots[slot]?.title})
              </button>
            ))}
            <button onClick={() => setSlotPicker(null)} className="text-xs font-inter text-forest-muted px-3 py-2">
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {drafts.length > 0 && (
        <>
          <h3 className="font-cinzel text-xs tracking-widest uppercase text-forest-muted mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            Entwürfe
          </h3>
          <div className="bg-white rounded-sm border border-gray-200 divide-y divide-gray-100 mb-8">
            {drafts.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                {p.image_path && <img src={publicImageUrl(p.image_path)} alt="" className="w-12 h-12 rounded-sm object-cover" />}
                <div className="flex-1 min-w-[140px]">
                  <p className="font-inter text-sm text-forest">{p.title}</p>
                  {p.description && <p className="font-inter text-xs text-forest-muted">{p.description}</p>}
                </div>
                <button
                  onClick={() => handlePublishClick(p)}
                  className="text-xs font-inter uppercase tracking-wide px-3 py-1.5 rounded-full bg-forest text-white hover:bg-forest-mid"
                >
                  Veröffentlichen
                </button>
                <button onClick={() => handleDelete(p)} className="text-gray-400 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <form onSubmit={handleCreate} className="bg-white rounded-sm border border-gray-200 p-4 flex items-end gap-3 flex-wrap">
        <label className="relative w-16 h-16 rounded-sm bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0">
          {pendingFile ? (
            <img src={URL.createObjectURL(pendingFile)} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus size={18} className="text-gray-400" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setPendingFile(e.target.files?.[0] || null)}
          />
        </label>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-inter text-forest-muted mb-1">Titel</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z. B. Heute Smash-Burger ab 17 Uhr!"
            className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-inter text-forest-muted mb-1">Beschreibung</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-forest text-white text-sm font-inter px-4 py-2 rounded-sm hover:bg-forest-mid transition-colors disabled:opacity-60"
        >
          <Plus size={15} />
          Anlegen
        </button>
      </form>
    </div>
  );
}
