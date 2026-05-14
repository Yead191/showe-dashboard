import { useState, useRef } from 'react';
import { Tabs, Switch, Button, Slider } from 'antd';
import { Sparkles, Plus, Trash2, X, MousePointer2, Video, Image as ImageIcon, Bell, } from 'lucide-react';
import { useProgrammesStore } from '@/features/programmes/store/programmes.store';
import { ANIMATION_TYPES, ANIMATION_LABELS } from '@/features/programmes/animation';
import { findBlockTemplate } from '@/constants/module-blocks';
import type { Block, BlockAnimation, BlockLayout } from '@/types/programme';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MOCK_RECOMMENDATION } from '@/constants/mock-recommendation';
import MediaRenderer from '@/helpers/MediaRenderer';

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
          <Field label="Hero media" hint="Supports image, video, or GIF (max 10MB)">
            <MediaInput value={block.cover_image ?? ''} onChange={(v) => patch({ cover_image: v })} />
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
                { v: 'full', label: 'Full Screen' },
              ]}
              onChange={(v) => patch({ height: v as 'short' | 'medium' | 'tall' | 'full' })}
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
          <Field label="Media Assets" hint="Supports images, videos, and GIFs (max 10MB)">
            <MediaListEditor images={block.images} onChange={(images) => patch({ images })} />
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
                  <div className="flex gap-2 items-start">
                    <MediaInput compact value={item.image ?? ''} onChange={(v) => set({ ...item, image: v })} />
                    <div className="flex-1 space-y-1.5">
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
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    className="input-base !h-auto py-2"
                    placeholder="Short bio"
                    value={item.bio ?? ''}
                    onChange={(e) => set({ ...item, bio: e.target.value })}
                  />
                  <div className="grid grid-cols-[1fr_auto] gap-1.5 items-center">
                    <input
                      className="input-base !h-8 text-[12px]"
                      placeholder="Link label (e.g. Website)"
                      value={item.link_label ?? ''}
                      onChange={(e) => set({ ...item, link_label: e.target.value })}
                    />
                    <input
                      className="input-base !h-8 text-[12px]"
                      placeholder="https://..."
                      value={item.link_url ?? ''}
                      onChange={(e) => set({ ...item, link_url: e.target.value })}
                    />
                  </div>
                  {item.link_url && !item.link_url.startsWith('http') && (
                    <p className="text-[11px] text-danger">⚠ URL should start with https://</p>
                  )}
                </>
              )}
              newItem={() => ({ id: makeItemId(), name: 'New member', role: 'Role', image: '', bio: '', link_url: '', link_label: '' })}
            />
          </Field>
        </>
      );

    case 'cast_spotlight':
      return (
        <>
          <Field label="Spotlight media">
            <MediaInput value={block.image ?? ''} onChange={(v) => patch({ image: v })} />
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
          <Field label="External link" hint="Optional — shown as a button on the card">
            <input
              className="input-base mb-2"
              placeholder="Link label (e.g. Instagram, Portfolio)"
              value={block.link_label ?? ''}
              onChange={(e) => patch({ link_label: e.target.value })}
            />
            <input
              className="input-base"
              placeholder="https://..."
              value={block.link_url ?? ''}
              onChange={(e) => patch({ link_url: e.target.value })}
            />
            {block.link_url && !block.link_url.startsWith('http') && (
              <p className="text-[11px] text-danger mt-1">⚠ URL should start with https://</p>
            )}
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
          <Field label="Story media">
            <MediaInput value={block.image} onChange={(v) => patch({ image: v })} />
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
          <Field label="Submit button label">
            <input
              className="input-base"
              placeholder="e.g. Submit review"
              value={block.submit_label}
              onChange={(e) => patch({ submit_label: e.target.value })}
            />
          </Field>
          <Field
            label="Backend endpoint"
            hint="Optional — where reviews will be sent when your backend is ready"
          >
            <input
              className="input-base"
              placeholder="https://your-api.com/reviews"
              value={block.submit_url ?? ''}
              onChange={(e) => patch({ submit_url: e.target.value })}
            />
            {block.submit_url && (
              <p className="text-[11px] text-ink-faint mt-1">
                🔌 Submissions will POST to this URL once connected.
              </p>
            )}
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
                  <div className="flex gap-2 items-start">
                    <MediaInput compact value={item.image ?? ''} onChange={(v) => set({ ...item, image: v })} />
                    <div className="flex-1 space-y-1.5">
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
                    </div>
                  </div>
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
                  <div className="flex gap-2 items-start">
                    <MediaInput compact value={item.image ?? ''} onChange={(v) => set({ ...item, image: v })} />
                    <div className="flex-1 space-y-1.5">
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
                    </div>
                  </div>
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
          <Field label="Cover image" hint="Optional — adds a visual to the donation card">
            <MediaInput value={block.image ?? ''} onChange={(v) => patch({ image: v })} />
          </Field>
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
          <Field label="CTA label">
            <input className="input-base" value={block.cta_label} onChange={(e) => patch({ cta_label: e.target.value })} />
          </Field>
          <Field
            label="CTA URL"
            hint="Where the donate button links — your payment page or charity link"
          >
            <input className="input-base" value={block.cta_url} onChange={(e) => patch({ cta_url: e.target.value })} />
            {block.cta_url && (
              <p className="text-[11px] text-ink-faint mt-1">
                🔌 The selected amount will be appended as ?amount=X when connecting to your backend.
              </p>
            )}
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
          <Field label="Text placeholder">
            <input className="input-base" value={block.placeholder} onChange={(e) => patch({ placeholder: e.target.value })} />
          </Field>
          <Field label="Submit button label">
            <input className="input-base" value={block.submit_label} onChange={(e) => patch({ submit_label: e.target.value })} />
          </Field>
          <Field label="Success message">
            <input className="input-base" value={block.success_message} onChange={(e) => patch({ success_message: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Allow text">
              <Switch checked={block.allow_text} onChange={(v) => patch({ allow_text: v })} />
            </Field>
            <Field label="Allow image">
              <Switch checked={block.allow_image} onChange={(v) => patch({ allow_image: v })} />
            </Field>
          </div>
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

    case 'recommendations': {
      const getOptions = () => {
        if (block.category === 'all') {
          return [
            ...MOCK_RECOMMENDATION?.nearby_restaurants,
            ...MOCK_RECOMMENDATION?.nearby_hotels,
            ...MOCK_RECOMMENDATION?.nearby_bars,
          ];
        }
        if (block.category === 'restaurants') return MOCK_RECOMMENDATION?.nearby_restaurants;
        if (block.category === 'hotels') return MOCK_RECOMMENDATION?.nearby_hotels;
        if (block.category === 'bars') return MOCK_RECOMMENDATION?.nearby_bars;
        return [];
      };

      const availableItems = getOptions();
      const selectedIds = block.selected_items || [];

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
          <Field label="Select Recommendations" hint="Choose items from the mock list">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {availableItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-primary' : 'bg-surface-raised border-line hover:border-primary/40'}`}
                    onClick={() => {
                      if (isSelected) {
                        patch({ selected_items: selectedIds.filter(id => id !== item.id) });
                      } else {
                        patch({ selected_items: [...selectedIds, item.id] });
                      }
                    }}
                  >
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-ink truncate">{item.name}</div>
                      <div className="text-[11px] text-ink-muted">
                        {(item as any).category || (item as any).type} · {item.distance}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'border-line'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
              {availableItems.length === 0 && (
                <div className="text-sm text-ink-muted text-center py-4">No items available</div>
              )}
            </div>
          </Field>
        </>
      );
    }

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

          <Field label="Event Date" hint="Required for pre/post event triggers">
            <input
              type="datetime-local"
              className="input-base"
              value={toLocalDatetimeString(block.event_date)}
              onChange={(e) => patch({ event_date: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
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

          {block.trigger === 'scheduled' && (
            <Field label="Schedule Time">
              <input
                type="datetime-local"
                className="input-base"
                value={toLocalDatetimeString(block.scheduled_at)}
                onChange={(e) => patch({ scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </Field>
          )}

          {(block.trigger === 'pre_event' || block.trigger === 'post_event') && (
            <Field
              label={block.trigger === 'pre_event' ? 'Minutes before event' : 'Minutes after event'}
              hint={`${block.offset_minutes || 0} mins`}
            >
              <input
                type="number"
                className="input-base"
                min={1}
                max={1440}
                value={block.offset_minutes || ''}
                placeholder="e.g. 15"
                onChange={(e) => patch({ offset_minutes: Number(e.target.value) || undefined })}
              />
            </Field>
          )}

          <div className="pt-2">
            <Button
              block
              type="primary"
              icon={<Bell size={13} />}
              onClick={() => {
                console.log('🔔 Triggering Notification:', {
                  title: block.title,
                  message: block.message,
                  trigger: block.trigger,
                  scheduled_at: block.scheduled_at,
                  event_date: block.event_date,
                  offset_minutes: block.offset_minutes,
                });
                toast(block.title || 'Notification', {
                  description: block.message,
                  icon: <Bell size={15} className="text-primary" />,
                });
              }}
            >
              Test Trigger
            </Button>
          </div>
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

      <Field label="Background" hint="Block background colour">
        <BackgroundPicker
          value={layout.background ?? 'none'}
          customColor={layout.background_custom}
          onPreset={(v) => setL({ background: v })}
          onCustom={(hex) => setL({ background: 'custom', background_custom: hex })}
        />
      </Field>

      <Field label="Text colour" hint="Override all text in this block">
        <ColorPicker
          value={layout.text_color}
          onChange={(hex) => setL({ text_color: hex })}
        />
      </Field>

      <Field label="Title colour" hint="Headings only (h1–h4)">
        <ColorPicker
          value={layout.title_color}
          onChange={(hex) => setL({ title_color: hex })}
        />
      </Field>

      <Field label="Tag colour" hint="Eyebrow / section labels (default teal)">
        <ColorPicker
          value={layout.eyebrow_color}
          onChange={(hex) => setL({ eyebrow_color: hex })}
        />
      </Field>

      <Field label="Card background" hint="Inner card surfaces in this block">
        <ColorPicker
          value={layout.card_background}
          onChange={(hex) => setL({ card_background: hex })}
          presets={CARD_BG_PRESETS}
        />
      </Field>

      <Field label="Card text colour" hint="Text inside card surfaces">
        <ColorPicker
          value={layout.card_text_color}
          onChange={(hex) => setL({ card_text_color: hex })}
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

/* ─── Background colour picker ─────────────────────────────── */

const BG_PRESETS: { v: NonNullable<BlockLayout['background']>; bg: string; title: string; checker?: boolean }[] = [
  { v: 'none', bg: '', title: 'None (transparent)', checker: true },
  { v: 'surface', bg: '#FBFAF7', title: 'Surface' },
  { v: 'sunken', bg: '#F2EFE9', title: 'Sunken' },
  { v: 'primary', bg: '#014B52', title: 'Primary' },
  { v: 'accent', bg: '#F5A800', title: 'Accent' },
  { v: 'dark', bg: '#000000', title: 'Dark' },
];

function BackgroundPicker({
  value,
  customColor,
  onPreset,
  onCustom,
}: {
  value: string;
  customColor?: string;
  onPreset: (v: NonNullable<BlockLayout['background']>) => void;
  onCustom: (hex: string) => void;
}) {
  const colorRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {BG_PRESETS.map((p) => (
          <button
            key={p.v}
            type="button"
            title={p.title}
            onClick={() => onPreset(p.v)}
            className={cn(
              'w-8 h-8 rounded-full border-2 transition-all shrink-0 overflow-hidden',
              value === p.v
                ? 'border-primary scale-110 shadow-ring'
                : 'border-line hover:border-line-strong hover:scale-105'
            )}
            style={
              p.checker
                ? { background: 'repeating-conic-gradient(#d4d4d4 0% 25%, #f5f5f5 0% 50%) 0 0 / 8px 8px' }
                : { background: p.bg }
            }
          />
        ))}

        {/* Custom swatch */}
        <input
          ref={colorRef}
          type="color"
          value={customColor || '#ffffff'}
          onChange={(e) => onCustom(e.target.value)}
          className="sr-only"
        />
        <button
          type="button"
          title="Custom colour"
          onClick={() => {
            onPreset('custom');
            colorRef.current?.click();
          }}
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
            value === 'custom'
              ? 'border-primary scale-110 shadow-ring'
              : 'border-dashed border-line hover:border-line-strong hover:scale-105'
          )}
          style={{ background: value === 'custom' ? (customColor || '#ffffff') : 'transparent' }}
        >
          {value !== 'custom' && (
            <span className="text-ink-faint font-bold text-sm leading-none">+</span>
          )}
        </button>
      </div>

      {value === 'custom' && (
        <div className="flex items-center gap-2 pl-0.5">
          <span
            className="w-5 h-5 rounded-full border border-line shrink-0"
            style={{ background: customColor || '#ffffff' }}
          />
          <span className="text-[12px] font-mono text-ink-muted flex-1 truncate">
            {customColor || '#ffffff'}
          </span>
          <button
            type="button"
            onClick={() => colorRef.current?.click()}
            className="text-[11px] text-primary font-semibold hover:text-primary-700 shrink-0"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Generic colour picker (Auto + presets + custom) ───────── */

const TEXT_PRESETS: { hex: string; title: string }[] = [
  { hex: '#28251D', title: 'Dark (default)' },
  { hex: '#F9F8F4', title: 'Light / White' },
  { hex: '#014B52', title: 'Primary teal' },
  { hex: '#F5A800', title: 'Accent amber' },
];

const CARD_BG_PRESETS: { hex: string; title: string }[] = [
  { hex: '#FFFFFF', title: 'White' },
  { hex: '#FBFAF7', title: 'Surface' },
  { hex: '#F2EFE9', title: 'Sunken' },
  { hex: '#28251D', title: 'Dark' },
];

function ColorPicker({
  value,
  onChange,
  presets = TEXT_PRESETS,
}: {
  value?: string;
  onChange: (hex: string | undefined) => void;
  presets?: { hex: string; title: string }[];
}) {
  const colorRef = useRef<HTMLInputElement>(null);

  const isCustom = !!value && !presets.some((p) => p.hex === value);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Auto / clear */}
      <button
        type="button"
        title="Auto (inherited)"
        onClick={() => onChange(undefined)}
        className={cn(
          'h-8 px-3 rounded-full text-[11.5px] font-semibold border transition-all',
          !value
            ? 'bg-primary text-ink-inverse border-primary'
            : 'border-line text-ink-muted hover:border-line-strong hover:text-ink'
        )}
      >
        Auto
      </button>

      {presets.map((p) => (
        <button
          key={p.hex}
          type="button"
          title={p.title}
          onClick={() => onChange(p.hex)}
          className={cn(
            'w-8 h-8 rounded-full border-2 transition-all shrink-0',
            value === p.hex
              ? 'border-primary scale-110 shadow-ring'
              : 'border-line hover:border-line-strong hover:scale-105'
          )}
          style={{ background: p.hex }}
        />
      ))}

      {/* Custom */}
      <input
        ref={colorRef}
        type="color"
        value={value || '#28251D'}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
      <button
        type="button"
        title="Custom colour"
        onClick={() => colorRef.current?.click()}
        className={cn(
          'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
          isCustom
            ? 'border-primary scale-110 shadow-ring'
            : 'border-dashed border-line hover:border-line-strong hover:scale-105'
        )}
        style={{ background: isCustom ? (value ?? 'transparent') : 'transparent' }}
      >
        {!isCustom && (
          <span className="text-ink-faint font-bold text-sm leading-none">+</span>
        )}
      </button>

      {value && (
        <span className="text-[11px] font-mono text-ink-faint">{value}</span>
      )}
    </div>
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
      <label className="field-label flex items-center justify-between gap-2">
        <span className='text-nowrap'>{label}</span>
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

function MediaInput({ value, onChange, compact }: { value: string; onChange: (v: string) => void; compact?: boolean }) {
  const fileRef = useState(() => Math.random().toString(36).slice(2, 10))[0];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isVideo = value.startsWith('data:video') || value.match(/\.(mp4|webm|mov)$/i);

  return (
    <div>
      <input
        id={fileRef}
        type="file"
        accept="image/*,video/*,.gif"
        onChange={handleFile}
        className="hidden"
      />

      {value ? (
        <div className={cn(
          "relative rounded-lg overflow-hidden border border-line bg-surface-sunken group",
          compact ? "w-16 h-16" : "aspect-video"
        )}>
          {isVideo ? (
            <video
              src={value}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={value} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => document.getElementById(fileRef)?.click()}
              className={cn(
                "rounded-full bg-white text-ink font-bold shadow-soft hover:bg-white/90 inline-flex items-center justify-center gap-1.5",
                compact ? "w-8 h-8" : "px-3 py-1.5 text-[12px]"
              )}
            >
              {compact ? <Plus size={14} /> : (
                <>
                  <Video size={13} />
                  Replace
                </>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/95 backdrop-blur flex items-center justify-center text-ink hover:bg-white shadow-sm"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => document.getElementById(fileRef)?.click()}
          className={cn(
            "rounded-lg border-2 border-dashed border-line bg-surface-sunken hover:border-primary hover:bg-primary/5 text-ink-muted hover:text-primary transition-all flex flex-col items-center justify-center gap-1",
            compact ? "w-16 h-16" : "w-full aspect-video gap-2"
          )}
        >
          <div className="flex gap-2">
            <ImageIcon size={compact ? 12 : 16} />
            <Video size={compact ? 12 : 16} />
          </div>
          {!compact && (
            <div className="text-center">
              <span className="text-[12px] font-bold block">Upload media</span>
              <span className="text-[10px] opacity-60">Image, Video, GIF (Max 10MB)</span>
            </div>
          )}
        </button>
      )}
    </div>
  );
}

function MediaListEditor({ images, onChange }: { images: string[]; onChange: (v: string[]) => void }) {
  const fileId = useState(() => Math.random().toString(36).slice(2, 10))[0];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onChange([...images, reader.result as string]);
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset for same file select
    }
  };

  return (
    <div>
      <input
        id={fileId}
        type="file"
        accept="image/*,video/*,.gif"
        onChange={handleFile}
        className="hidden"
      />
      <div className="grid grid-cols-3 gap-2 mb-2">
        {images.map((src, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-line group">
            <MediaRenderer src={src} className="w-full h-full object-cover bg-surface-sunken" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => document.getElementById(fileId)?.click()}
          className="aspect-square rounded-lg border-2 border-dashed border-line hover:border-primary text-ink-muted hover:text-primary flex flex-col items-center justify-center gap-1 transition-colors hover:bg-primary/5"
        >
          <div className="flex gap-1">
            <ImageIcon size={14} />
            <Video size={14} />
          </div>
          <span className="text-[9px] font-bold">Add Media</span>
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

function toLocalDatetimeString(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset() * 60000;
  const localDate = new Date(d.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
}
