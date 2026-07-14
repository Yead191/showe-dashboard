import { useState } from 'react';
import { Switch, Button } from 'antd';
import { Tag, X, Plus, Sparkles, Link as LinkIcon, Trash2 } from 'lucide-react';
import { FieldGroup } from './FieldGroup';
import { EVENT_CATEGORIES } from '@/constants/events';
import type { EventFormState } from '../types';

interface BasicsTabProps {
  state: EventFormState;
  update: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
}

export function BasicsTab({ state, update }: BasicsTabProps) {
  const [tagInput, setTagInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');

  function addTag() {
    if (!tagInput.trim()) return;
    update('tags', [...state.tags, tagInput.trim()]);
    setTagInput('');
  }

  function removeTag(t: string) {
    update('tags', state.tags.filter((x) => x !== t));
  }

  function addHighlight() {
    if (!highlightInput.trim()) return;
    update('highlights', [...state.highlights, highlightInput.trim()]);
    setHighlightInput('');
  }

  function removeHighlight(h: string) {
    update('highlights', state.highlights.filter((x) => x !== h));
  }

  return (
    <div className="space-y-6">
      <FieldGroup label="Event title" required>
        <input
          value={state.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="e.g. Hamlet — Spring Repertory"
          className="input-base"
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Category">
          <select
            value={state.category}
            onChange={(e) => update('category', e.target.value)}
            className="input-base"
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup label="Status">
          <select
            value={state.status}
            onChange={(e) => update('status', e.target.value as EventFormState['status'])}
            className="input-base"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Price (£)">
          <input
            type="number"
            min={0}
            step={1}
            value={state.price}
            onChange={(e) => update('price', Number(e.target.value) || 0)}
            placeholder="200"
            className="input-base"
          />
        </FieldGroup>
        <FieldGroup label="Featured event" hint="Show with a sparkle on the SHOWE app.">
          <div className="h-11 flex items-center">
            <Switch checked={state.is_featured} onChange={(v) => update('is_featured', v)} />
            <span className="ml-2 text-sm text-ink-muted">
              {state.is_featured ? 'Yes — featured' : 'Not featured'}
            </span>
          </div>
        </FieldGroup>
      </div>

      <FieldGroup label="Tags" hint="Used in app search and recommendations">
        <div className="flex flex-wrap gap-2 mb-2">
          {state.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[12px] font-semibold"
            >
              <Tag size={11} />
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="ml-0.5 hover:text-primary-700"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag and press Enter"
            className="input-base"
          />
          <Button onClick={addTag} icon={<Plus size={14} />} />
        </div>
      </FieldGroup>

      <FieldGroup label="Description" hint="A short paragraph for the event detail page.">
        <textarea
          value={state.description_html}
          onChange={(e) => update('description_html', e.target.value)}
          rows={5}
          placeholder="What can the audience expect? Who is performing?"
          className="input-base !h-auto py-3 leading-relaxed"
        />
      </FieldGroup>

      <FieldGroup label="Highlights" hint="3–5 short bullet points displayed on the event page.">
        <ul className="space-y-1.5 mb-2">
          {state.highlights.map((h) => (
            <li
              key={h}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface-sunken"
            >
              <span className="text-sm text-ink flex items-center gap-2">
                <Sparkles size={12} className="text-accent" />
                {h}
              </span>
              <button
                type="button"
                onClick={() => removeHighlight(h)}
                className="text-ink-faint hover:text-danger transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            value={highlightInput}
            onChange={(e) => setHighlightInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
            placeholder="e.g. Captioned matinee available"
            className="input-base"
          />
          <Button onClick={addHighlight} icon={<Plus size={14} />} />
        </div>
      </FieldGroup>

      <FieldGroup label="Get tickets URL" hint="External link (e.g. your box office page).">
        <div className="relative">
          <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={state.get_tickets_url}
            onChange={(e) => update('get_tickets_url', e.target.value)}
            placeholder="https://royalcrescent.co.uk/whats-on/..."
            className="input-base pl-9"
          />
        </div>
      </FieldGroup>
    </div>
  );
}
