import { useState } from 'react';
import { Tabs, Switch, Button, Slider } from 'antd';
import { Sparkles, Plus, Trash2, X, MousePointer2 } from 'lucide-react';
import { useProgrammesStore } from '@/features/programmes/store/programmes.store';
import { ANIMATION_TYPES, ANIMATION_LABELS } from '@/features/programmes/animation';
import { findBlockTemplate } from '@/constants/module-blocks';
import type { Block, BlockAnimation, BlockLayout } from '@/types/programme';
import { cn } from '@/lib/utils';

export function LiveInspector() {
  const programmeId = useProgrammesStore((s) => s.activeId);
  const pageId = useProgrammesStore((s) => s.activePageId);
  const block = useProgrammesStore((s) => {
    const p = s.activeId ? s.programmes[s.activeId] : null;
    const page = p?.pages.find((pg) => pg.id === s.activePageId);
    return page?.blocks.find((b) => b.id === s.selectedBlockId) ?? null;
  });
  const updateBlock = useProgrammesStore((s) => s.updateBlock);
  const setSelectedBlockId = useProgrammesStore((s) => s.setSelectedBlockId);

  const [tab, setTab] = useState<'input' | 'layout'>('input');

  if (!block || !programmeId) {
    return (
      <div className="h-full min-h-0 flex flex-col bg-surface-raised border-l border-line">
        <div className="px-5 py-5 border-b border-line">
          <div className="eyebrow text-[10px] mb-1.5">Live Inspector</div>
          <h2 className="font-display font-bold text-base text-ink leading-tight">
            Select a block to edit
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-sunken text-ink-faint flex items-center justify-center mb-3">
            <MousePointer2 size={18} />
          </div>
          <p className="text-sm text-ink-muted max-w-[200px]">
            Click a block in the live preview to see its settings here.
          </p>
        </div>
      </div>
    );
  }

  const tpl = findBlockTemplate(block.type);

  function patch(updates: Partial<Block>) {
    if (!programmeId || !pageId || !block) return;
    updateBlock(programmeId, pageId, block.id, updates);
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-surface-raised border-l border-line">
      <div className="px-5 py-5 border-b border-line">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="eyebrow text-[10px] mb-1.5">Live Inspector</div>
            <h2 className="font-display font-bold text-base text-ink leading-tight truncate">
              {tpl?.label ?? block.type}
            </h2>
            <p className="text-[11px] text-ink-faint mt-0.5">{tpl?.description}</p>
          </div>
          <button
            onClick={() => setSelectedBlockId(null)}
            className="w-7 h-7 rounded-md bg-surface-sunken text-ink-muted hover:text-ink flex items-center justify-center shrink-0"
          >
            <X size={13} />
          </button>
        </div>
        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k as 'input' | 'layout')}
          items={[
            { key: 'input', label: 'Input' },
            { key: 'layout', label: 'Layout' },
          ]}
          className="!mt-3"
          size="small"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {tab === 'input' && <BlockInputEditor block={block} patch={patch} />}
        {tab === 'layout' && <LayoutEditor block={block} patch={patch} />}

        <AnimationSection animation={block.animation} onChange={(a) => patch({ animation: a })} />
      </div>
    </div>
  );
}

/* ============================================================
   Per-block input editor — switches by block type
   ============================================================ */

function BlockInputEditor({ block, patch }: { block: Block; patch: (u: Partial<Block>) => void }) {
  switch (block.type) {
    case 'hero':
      return (
        <>
          <Field label="Cover image">
            <ImageInput value={block.cover_image ?? ''} onChange={(v) => patch({ cover_image: v })} />
          </Field>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Subtitle">
            <input className="input-base" value={block.subtitle ?? ''} onChange={(e) => patch({ subtitle: e.target.value })} />
          </Field>
          <Field label="Height">
            <Choice
              value={block.height}
              options={[
                { v: 'short', label: 'Short' },
                { v: 'medium', label: 'Medium' },
                { v: 'tall', label: 'Tall' },
              ]}
              onChange={(v) => patch({ height: v as 'short' | 'medium' | 'tall' })}
            />
          </Field>
          <Field label="Dark gradient overlay">
            <Switch checked={block.overlay} onChange={(v) => patch({ overlay: v })} />
          </Field>
        </>
      );

    case 'welcome':
      return (
        <>
          <Field label="Heading">
            <input className="input-base" value={block.heading} onChange={(e) => patch({ heading: e.target.value })} />
          </Field>
          <Field label="Body">
            <textarea
              rows={5}
              className="input-base !h-auto py-2.5"
              value={block.body}
              onChange={(e) => patch({ body: e.target.value })}
            />
          </Field>
          <Field label="Signature">
            <input className="input-base" value={block.signature ?? ''} onChange={(e) => patch({ signature: e.target.value })} />
          </Field>
        </>
      );

    case 'schedule':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Schedule items">
            <ListEditor
              items={block.items}
              onChange={(items) => patch({ items })}
              renderItem={(item, set) => (
                <>
                  <input
                    className="input-base !h-9"
                    placeholder="19:30"
                    value={item.time}
                    onChange={(e) => set({ ...item, time: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Act I"
                    value={item.label}
                    onChange={(e) => set({ ...item, label: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Note (optional)"
                    value={item.note ?? ''}
                    onChange={(e) => set({ ...item, note: e.target.value })}
                  />
                </>
              )}
              newItem={() => ({ id: makeItemId(), time: '00:00', label: 'New item', note: '' })}
            />
          </Field>
        </>
      );

    case 'accessibility':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Features">
            <ListEditor
              items={block.features}
              onChange={(features) => patch({ features })}
              renderItem={(item, set) => (
                <>
                  <input
                    className="input-base !h-9"
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => set({ ...item, label: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Description (optional)"
                    value={item.description ?? ''}
                    onChange={(e) => set({ ...item, description: e.target.value })}
                  />
                </>
              )}
              newItem={() => ({ id: makeItemId(), icon: 'star', label: 'New feature', description: '' })}
            />
          </Field>
        </>
      );

    case 'behind_scenes':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Body">
            <textarea
              rows={4}
              className="input-base !h-auto py-2.5"
              value={block.body}
              onChange={(e) => patch({ body: e.target.value })}
            />
          </Field>
          <Field label="Image URLs">
            <ImageListEditor images={block.images} onChange={(images) => patch({ images })} />
          </Field>
        </>
      );

    case 'sponsor_thanks':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Sponsors">
            <ListEditor
              items={block.sponsors}
              onChange={(sponsors) => patch({ sponsors })}
              renderItem={(item, set) => (
                <>
                  <input
                    className="input-base !h-9"
                    placeholder="Sponsor name"
                    value={item.name}
                    onChange={(e) => set({ ...item, name: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Logo URL (optional)"
                    value={item.logo ?? ''}
                    onChange={(e) => set({ ...item, logo: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Link (optional)"
                    value={item.url ?? ''}
                    onChange={(e) => set({ ...item, url: e.target.value })}
                  />
                </>
              )}
              newItem={() => ({ id: makeItemId(), name: 'New sponsor', logo: '', url: '' })}
            />
          </Field>
        </>
      );

    case 'refreshments':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              className="input-base !h-auto py-2.5"
              value={block.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </Field>
          <Field label="CTA label">
            <input className="input-base" value={block.cta_label} onChange={(e) => patch({ cta_label: e.target.value })} />
          </Field>
          <Field label="CTA URL">
            <input className="input-base" value={block.cta_url} onChange={(e) => patch({ cta_url: e.target.value })} />
          </Field>
        </>
      );

    case 'cast_grid':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Description">
            <input
              className="input-base"
              value={block.description ?? ''}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </Field>
          <Field label="Columns">
            <Choice
              value={String(block.columns)}
              options={[
                { v: '2', label: '2 columns' },
                { v: '3', label: '3 columns' },
              ]}
              onChange={(v) => patch({ columns: (Number(v) as 2 | 3) })}
            />
          </Field>
          <Field label="Members">
            <ListEditor
              items={block.members}
              onChange={(members) => patch({ members })}
              renderItem={(item, set) => (
                <>
                  <input
                    className="input-base !h-9"
                    placeholder="Name"
                    value={item.name}
                    onChange={(e) => set({ ...item, name: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Role"
                    value={item.role}
                    onChange={(e) => set({ ...item, role: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Image URL"
                    value={item.image ?? ''}
                    onChange={(e) => set({ ...item, image: e.target.value })}
                  />
                  <textarea
                    rows={2}
                    className="input-base !h-auto py-2"
                    placeholder="Short bio"
                    value={item.bio ?? ''}
                    onChange={(e) => set({ ...item, bio: e.target.value })}
                  />
                </>
              )}
              newItem={() => ({ id: makeItemId(), name: 'New member', role: 'Role', image: '', bio: '' })}
            />
          </Field>
        </>
      );

    case 'cast_spotlight':
      return (
        <>
          <Field label="Image">
            <ImageInput value={block.image ?? ''} onChange={(v) => patch({ image: v })} />
          </Field>
          <Field label="Name">
            <input className="input-base" value={block.name} onChange={(e) => patch({ name: e.target.value })} />
          </Field>
          <Field label="Role">
            <input className="input-base" value={block.role} onChange={(e) => patch({ role: e.target.value })} />
          </Field>
          <Field label="Bio">
            <textarea
              rows={4}
              className="input-base !h-auto py-2.5"
              value={block.bio}
              onChange={(e) => patch({ bio: e.target.value })}
            />
          </Field>
        </>
      );

    case 'narrative_text':
      return (
        <>
          <Field label="Eyebrow">
            <input
              className="input-base"
              value={block.eyebrow ?? ''}
              onChange={(e) => patch({ eyebrow: e.target.value })}
            />
          </Field>
          <Field label="Heading">
            <input
              className="input-base"
              value={block.heading ?? ''}
              onChange={(e) => patch({ heading: e.target.value })}
            />
          </Field>
          <Field label="Body">
            <textarea
              rows={6}
              className="input-base !h-auto py-2.5"
              value={block.body}
              onChange={(e) => patch({ body: e.target.value })}
            />
          </Field>
        </>
      );

    case 'image_story':
      return (
        <>
          <Field label="Image">
            <ImageInput value={block.image} onChange={(v) => patch({ image: v })} />
          </Field>
          <Field label="Caption">
            <input
              className="input-base"
              value={block.caption ?? ''}
              onChange={(e) => patch({ caption: e.target.value })}
            />
          </Field>
          <Field label="Body">
            <textarea
              rows={4}
              className="input-base !h-auto py-2.5"
              value={block.body}
              onChange={(e) => patch({ body: e.target.value })}
            />
          </Field>
          <Field label="Image position">
            <Choice
              value={block.image_position}
              options={[
                { v: 'top', label: 'Top' },
                { v: 'left', label: 'Left' },
                { v: 'right', label: 'Right' },
              ]}
              onChange={(v) => patch({ image_position: v as 'top' | 'left' | 'right' })}
            />
          </Field>
        </>
      );

    case 'poll':
      return (
        <>
          <Field label="Question">
            <input className="input-base" value={block.question} onChange={(e) => patch({ question: e.target.value })} />
          </Field>
          <Field label="Style">
            <Choice
              value={block.variant}
              options={[
                { v: 'emoji_tap', label: 'Emoji tap' },
                { v: 'multiple_choice', label: 'Multiple choice' },
                { v: 'rating', label: 'Rating' },
              ]}
              onChange={(v) => patch({ variant: v as 'emoji_tap' | 'multiple_choice' | 'rating' })}
            />
          </Field>
          <Field label="Options">
            <ListEditor
              items={block.options}
              onChange={(options) => patch({ options })}
              renderItem={(item, set) => (
                <>
                  <input
                    className="input-base !h-9"
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => set({ ...item, label: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Emoji (optional)"
                    value={item.emoji ?? ''}
                    onChange={(e) => set({ ...item, emoji: e.target.value })}
                  />
                </>
              )}
              newItem={() => ({ id: makeItemId(), label: 'New option', emoji: '' })}
            />
          </Field>
          <Field label="Thank-you message">
            <input
              className="input-base"
              value={block.thank_you_message ?? ''}
              onChange={(e) => patch({ thank_you_message: e.target.value })}
            />
          </Field>
          <Field label="Show live results">
            <Switch checked={block.show_results_live} onChange={(v) => patch({ show_results_live: v })} />
          </Field>
        </>
      );

    case 'review':
      return (
        <>
          <Field label="Prompt">
            <input className="input-base" value={block.prompt} onChange={(e) => patch({ prompt: e.target.value })} />
          </Field>
          <Field label="Placeholder">
            <input className="input-base" value={block.placeholder} onChange={(e) => patch({ placeholder: e.target.value })} />
          </Field>
          <Field label="Max characters">
            <input
              type="number"
              className="input-base"
              value={block.max_chars}
              onChange={(e) => patch({ max_chars: Number(e.target.value) || 280 })}
            />
          </Field>
        </>
      );

    case 'merchandise':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Items">
            <ListEditor
              items={block.items}
              onChange={(items) => patch({ items })}
              renderItem={(item, set) => (
                <>
                  <input
                    className="input-base !h-9"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => set({ ...item, name: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="£18"
                    value={item.price}
                    onChange={(e) => set({ ...item, price: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Image URL"
                    value={item.image ?? ''}
                    onChange={(e) => set({ ...item, image: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="External URL"
                    value={item.url}
                    onChange={(e) => set({ ...item, url: e.target.value })}
                  />
                </>
              )}
              newItem={() => ({ id: makeItemId(), name: 'New item', price: '£0', url: '', image: '' })}
            />
          </Field>
        </>
      );

    case 'future_shows':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Shows">
            <ListEditor
              items={block.shows}
              onChange={(shows) => patch({ shows })}
              renderItem={(item, set) => (
                <>
                  <input
                    className="input-base !h-9"
                    placeholder="Show name"
                    value={item.name}
                    onChange={(e) => set({ ...item, name: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Date"
                    value={item.date}
                    onChange={(e) => set({ ...item, date: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Image URL"
                    value={item.image ?? ''}
                    onChange={(e) => set({ ...item, image: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Tickets URL"
                    value={item.url}
                    onChange={(e) => set({ ...item, url: e.target.value })}
                  />
                </>
              )}
              newItem={() => ({ id: makeItemId(), name: 'New show', date: 'TBA', url: '', image: '' })}
            />
          </Field>
        </>
      );

    case 'donation':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Body">
            <textarea
              rows={3}
              className="input-base !h-auto py-2.5"
              value={block.body}
              onChange={(e) => patch({ body: e.target.value })}
            />
          </Field>
          <Field label="CTA label">
            <input className="input-base" value={block.cta_label} onChange={(e) => patch({ cta_label: e.target.value })} />
          </Field>
          <Field label="CTA URL">
            <input className="input-base" value={block.cta_url} onChange={(e) => patch({ cta_url: e.target.value })} />
          </Field>
          <Field label="Preset amounts (£)" hint="Comma-separated, e.g. 5, 10, 25, 50">
            <input
              className="input-base"
              value={block.preset_amounts.join(', ')}
              onChange={(e) =>
                patch({
                  preset_amounts: e.target.value
                    .split(',')
                    .map((s) => Number(s.trim()))
                    .filter((n) => !isNaN(n)),
                })
              }
            />
          </Field>
        </>
      );

    case 'offers':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Offers">
            <ListEditor
              items={block.offers}
              onChange={(offers) => patch({ offers })}
              renderItem={(item, set) => (
                <>
                  <input
                    className="input-base !h-9"
                    placeholder="Offer title"
                    value={item.title}
                    onChange={(e) => set({ ...item, title: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => set({ ...item, description: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Code (optional)"
                    value={item.code ?? ''}
                    onChange={(e) => set({ ...item, code: e.target.value })}
                  />
                  <input
                    className="input-base !h-9"
                    placeholder="Expires (optional)"
                    value={item.expires ?? ''}
                    onChange={(e) => set({ ...item, expires: e.target.value })}
                  />
                </>
              )}
              newItem={() => ({ id: makeItemId(), title: 'New offer', description: '', code: '', expires: '' })}
            />
          </Field>
        </>
      );

    case 'memory_capture':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Prompt">
            <textarea
              rows={2}
              className="input-base !h-auto py-2.5"
              value={block.prompt}
              onChange={(e) => patch({ prompt: e.target.value })}
            />
          </Field>
          <Field label="Allow text">
            <Switch checked={block.allow_text} onChange={(v) => patch({ allow_text: v })} />
          </Field>
          <Field label="Allow image upload">
            <Switch checked={block.allow_image} onChange={(v) => patch({ allow_image: v })} />
          </Field>
          <Field label="Privacy note">
            <input className="input-base" value={block.privacy_note} onChange={(e) => patch({ privacy_note: e.target.value })} />
          </Field>
        </>
      );

    case 'recap':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              className="input-base !h-auto py-2.5"
              value={block.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </Field>
          <Field label="Release after (hours)" hint="When the recap becomes visible after the event">
            <input
              type="number"
              className="input-base"
              value={block.release_after_hours}
              onChange={(e) => patch({ release_after_hours: Number(e.target.value) || 24 })}
            />
          </Field>
        </>
      );

    case 'recommendations':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Category">
            <Choice
              value={block.category}
              options={[
                { v: 'all', label: 'All' },
                { v: 'restaurants', label: 'Restaurants' },
                { v: 'hotels', label: 'Hotels' },
                { v: 'bars', label: 'Bars' },
              ]}
              onChange={(v) => patch({ category: v as 'all' | 'restaurants' | 'hotels' | 'bars' })}
            />
          </Field>
          <Field label="Show distance">
            <Switch checked={block.show_distance} onChange={(v) => patch({ show_distance: v })} />
          </Field>
          <Field label="Show rating">
            <Switch checked={block.show_rating} onChange={(v) => patch({ show_rating: v })} />
          </Field>
        </>
      );

    case 'push_notification':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Message">
            <textarea
              rows={3}
              className="input-base !h-auto py-2.5"
              value={block.message}
              onChange={(e) => patch({ message: e.target.value })}
            />
          </Field>
          <Field label="Trigger">
            <Choice
              value={block.trigger}
              options={[
                { v: 'immediate', label: 'Immediate' },
                { v: 'scheduled', label: 'Scheduled' },
                { v: 'pre_event', label: 'Pre-event' },
                { v: 'post_event', label: 'Post-event' },
              ]}
              onChange={(v) =>
                patch({ trigger: v as 'immediate' | 'scheduled' | 'pre_event' | 'post_event' })
              }
            />
          </Field>
        </>
      );

    case 'map':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Address">
            <textarea
              rows={2}
              className="input-base !h-auto py-2.5"
              value={block.address}
              onChange={(e) => patch({ address: e.target.value })}
            />
          </Field>
          <Field label="Show parking info">
            <Switch checked={block.show_parking} onChange={(v) => patch({ show_parking: v })} />
          </Field>
          <Field label="Show accessibility route">
            <Switch checked={block.show_accessibility_route} onChange={(v) => patch({ show_accessibility_route: v })} />
          </Field>
        </>
      );

    case 'directions':
      return (
        <>
          <Field label="Title">
            <input className="input-base" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="By car">
            <textarea
              rows={2}
              className="input-base !h-auto py-2.5"
              value={block.by_car ?? ''}
              onChange={(e) => patch({ by_car: e.target.value })}
            />
          </Field>
          <Field label="By train">
            <textarea
              rows={2}
              className="input-base !h-auto py-2.5"
              value={block.by_train ?? ''}
              onChange={(e) => patch({ by_train: e.target.value })}
            />
          </Field>
          <Field label="By bus">
            <textarea
              rows={2}
              className="input-base !h-auto py-2.5"
              value={block.by_bus ?? ''}
              onChange={(e) => patch({ by_bus: e.target.value })}
            />
          </Field>
          <Field label="Parking info">
            <textarea
              rows={2}
              className="input-base !h-auto py-2.5"
              value={block.parking_info ?? ''}
              onChange={(e) => patch({ parking_info: e.target.value })}
            />
          </Field>
        </>
      );
  }
}

/* ============================================================
   Layout editor — common to all blocks
   ============================================================ */

function LayoutEditor({ block, patch }: { block: Block; patch: (u: Partial<Block>) => void }) {
  const layout = block.layout;
  function setL(updates: Partial<BlockLayout>) {
    patch({ layout: { ...layout, ...updates } });
  }
  return (
    <>
      <Field label="Alignment">
        <Choice
          value={layout.align}
          options={[
            { v: 'left', label: 'Left' },
            { v: 'center', label: 'Center' },
            { v: 'right', label: 'Right' },
            { v: 'full', label: 'Full' },
          ]}
          onChange={(v) => setL({ align: v as 'left' | 'center' | 'right' | 'full' })}
        />
      </Field>

      <Field label="Background">
        <Choice
          value={layout.background ?? 'none'}
          options={[
            { v: 'none', label: 'None' },
            { v: 'surface', label: 'Surface' },
            { v: 'sunken', label: 'Sunken' },
          ]}
          onChange={(v) => setL({ background: v as 'none' | 'surface' | 'sunken' })}
        />
      </Field>

      <Field label="Padding top" hint={`${layout.padding_top}px`}>
        <Slider min={0} max={80} value={layout.padding_top} onChange={(v) => setL({ padding_top: v })} />
      </Field>
      <Field label="Padding bottom" hint={`${layout.padding_bottom}px`}>
        <Slider min={0} max={80} value={layout.padding_bottom} onChange={(v) => setL({ padding_bottom: v })} />
      </Field>
      <Field label="Padding sides" hint={`${layout.padding_x}px`}>
        <Slider min={0} max={40} value={layout.padding_x} onChange={(v) => setL({ padding_x: v })} />
      </Field>
    </>
  );
}

/* ============================================================
   Animation section — universal
   ============================================================ */

function AnimationSection({
  animation,
  onChange,
}: {
  animation: BlockAnimation;
  onChange: (a: BlockAnimation) => void;
}) {
  return (
    <div className="rounded-xl bg-surface-sunken/50 border border-line p-4 space-y-3.5">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-7 h-7 rounded-lg bg-accent/15 text-[#8A5C00] flex items-center justify-center">
          <Sparkles size={13} />
        </span>
        <div>
          <div className="font-display font-bold text-[13px] text-ink leading-tight">Animation</div>
          <div className="text-[11px] text-ink-faint">Plays as the block scrolls into view.</div>
        </div>
      </div>

      <Field label="Type">
        <select
          className="input-base"
          value={animation.type}
          onChange={(e) => onChange({ ...animation, type: e.target.value as BlockAnimation['type'] })}
        >
          {ANIMATION_TYPES.map((t) => (
            <option key={t} value={t}>
              {ANIMATION_LABELS[t]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Delay" hint={`${animation.delay_ms}ms`}>
        <Slider min={0} max={1000} step={50} value={animation.delay_ms} onChange={(v) => onChange({ ...animation, delay_ms: v })} />
      </Field>

      <Field label="Duration" hint={`${animation.duration_ms}ms`}>
        <Slider min={200} max={1500} step={50} value={animation.duration_ms} onChange={(v) => onChange({ ...animation, duration_ms: v })} />
      </Field>
    </div>
  );
}

/* ============================================================
   Generic editor utilities
   ============================================================ */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="!normal-case !tracking-normal !font-normal text-[11px] text-ink-faint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Choice({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { v: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-1 p-1 rounded-full bg-surface-sunken border border-line">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            'h-8 rounded-full text-[11.5px] font-semibold transition-all',
            value === o.v ? 'bg-primary text-ink-inverse shadow-soft' : 'text-ink-muted hover:text-ink'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-line aspect-video bg-surface-sunken mb-2">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 backdrop-blur flex items-center justify-center text-ink hover:bg-white"
          >
            <X size={12} />
          </button>
        </div>
      ) : null}
      <input
        className="input-base"
        placeholder="https://… image URL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ImageListEditor({ images, onChange }: { images: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {images.map((src, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-line group">
            <img src={src} alt="" className="w-full h-full object-cover bg-surface-sunken" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const url = prompt('Image URL?');
            if (url) onChange([...images, url]);
          }}
          className="aspect-square rounded-lg border-2 border-dashed border-line hover:border-primary text-ink-muted hover:text-primary flex items-center justify-center"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

interface ListItem {
  id: string;
  [key: string]: unknown;
}

function ListEditor<T extends ListItem>({
  items,
  onChange,
  renderItem,
  newItem,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, set: (next: T) => void) => React.ReactNode;
  newItem: () => T;
}) {
  function update(idx: number, next: T) {
    const arr = [...items];
    arr[idx] = next;
    onChange(arr);
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const arr = [...items];
    [arr[idx], arr[j]] = [arr[j]!, arr[idx]!];
    onChange(arr);
  }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id} className="rounded-lg border border-line bg-surface-sunken/50 p-2.5 space-y-1.5 relative">
          <div className="absolute top-1.5 right-1.5 flex gap-0.5">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="w-6 h-6 rounded text-ink-faint hover:text-ink disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              className="w-6 h-6 rounded text-ink-faint hover:text-ink disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-6 h-6 rounded text-ink-faint hover:text-danger"
            >
              <Trash2 size={11} />
            </button>
          </div>
          <div className="space-y-1.5 pr-12">{renderItem(item, (next) => update(i, next))}</div>
        </div>
      ))}
      <Button block icon={<Plus size={13} />} onClick={() => onChange([...items, newItem()])}>
        Add
      </Button>
    </div>
  );
}

function makeItemId() {
  return `item_${Math.random().toString(36).slice(2, 10)}`;
}
