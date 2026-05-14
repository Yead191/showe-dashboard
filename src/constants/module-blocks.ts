import type { Block, BlockType, ModuleId, BlockAnimation, BlockLayout } from '@/types/programme';
import type { LucideIcon } from 'lucide-react';
import {
  Image as ImageIcon,
  CalendarDays,
  Accessibility,
  Camera,
  Heart,
  Coffee,
  Users,
  UserCircle2,
  AlignLeft,
  ImagePlus,
  Vote,
  MessageSquareText,
  ShoppingBag,
  CalendarPlus,
  HandCoins,
  Tag,
  StickyNote,
  Sparkles,
  MapPinned,
  Bell,
  Map,
  Navigation,
  Hand,
} from 'lucide-react';

export interface ModuleMeta {
  id: ModuleId;
  number: number;
  label: string;
  description: string;
  required_tier: number; // 1, 1.5 (T1+), 2, 3, 3.5 (T3+)
  blocks: BlockTemplate[];
}

export interface BlockTemplate {
  type: BlockType;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Returns a fresh block instance with sensible defaults */
  factory: () => Block;
}

const defaultAnimation = (): BlockAnimation => ({
  type: 'fade_in',
  delay_ms: 0,
  duration_ms: 600,
});

const defaultLayout = (): BlockLayout => ({
  align: 'full',
  padding_top: 24,
  padding_bottom: 24,
  padding_x: 20,
  background: 'none',
});

const uid = () => `blk_${Math.random().toString(36).slice(2, 10)}`;
const itemId = () => `item_${Math.random().toString(36).slice(2, 8)}`;

/* ============================================================
   Module 1 — Foundation
   ============================================================ */
const FOUNDATION_BLOCKS: BlockTemplate[] = [
  {
    type: 'hero',
    label: 'Hero / Cover',
    description: 'Full-width title block with optional cover image and parallax.',
    icon: ImageIcon,
    factory: () => ({
      id: uid(),
      module: 'foundation',
      type: 'hero',
      animation: defaultAnimation(),
      layout: { ...defaultLayout(), padding_top: 0, padding_bottom: 0, padding_x: 0 },
      title: 'Welcome to the show',
      subtitle: 'Tonight at the Royal Crescent Theatre',
      cover_image:
        'https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1600',
      height: 'medium',
      overlay: true,
      parallax: false,
    }),
  },
  {
    type: 'welcome',
    label: 'Welcome message',
    description: 'A short note from the venue or producer.',
    icon: Hand,
    factory: () => ({
      id: uid(),
      module: 'foundation',
      type: 'welcome',
      animation: { ...defaultAnimation(), type: 'slide_up' },
      layout: defaultLayout(),
      heading: 'A warm welcome',
      body: 'Thank you for joining us tonight. We hope you find tonight’s performance moving, surprising and worth talking about on the way home.',
      signature: 'Mara Sinclair · Artistic Director',
    }),
  },
  {
    type: 'schedule',
    label: 'Schedule',
    description: 'Running order with timings.',
    icon: CalendarDays,
    factory: () => ({
      id: uid(),
      module: 'foundation',
      type: 'schedule',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'Tonight’s running order',
      items: [
        { id: itemId(), time: '19:00', label: 'Doors open', note: 'Bar and refreshments' },
        { id: itemId(), time: '19:30', label: 'Act I' },
        { id: itemId(), time: '20:30', label: 'Interval', note: '20 minutes' },
        { id: itemId(), time: '20:50', label: 'Act II' },
        { id: itemId(), time: '22:15', label: 'Curtain' },
      ],
    }),
  },
  {
    type: 'accessibility',
    label: 'Accessibility',
    description: 'Captions, audio description, step-free access etc.',
    icon: Accessibility,
    factory: () => ({
      id: uid(),
      module: 'foundation',
      type: 'accessibility',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'Accessibility',
      features: [
        { id: itemId(), icon: 'captions', label: 'Captioned matinee', description: 'Saturday 13:30 only.' },
        { id: itemId(), icon: 'wheelchair', label: 'Step-free access', description: 'Lift access to all floors.' },
        { id: itemId(), icon: 'ear', label: 'Hearing loop', description: 'Available in all seats.' },
      ],
    }),
  },
  {
    type: 'behind_scenes',
    label: 'Behind the scenes',
    description: 'Rehearsal photos and production notes.',
    icon: Camera,
    factory: () => ({
      id: uid(),
      module: 'foundation',
      type: 'behind_scenes',
      animation: { ...defaultAnimation(), type: 'slide_up' },
      layout: defaultLayout(),
      title: 'Behind the scenes',
      body: 'Six weeks of rehearsals, two weeks in the build, one company finding its rhythm.',
      images: [
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200',
        'https://upload.wikimedia.org/wikipedia/commons/f/fa/Anne-Marie-4250_%28cropped%29.jpg',
      ],
    }),
  },
  {
    type: 'sponsor_thanks',
    label: 'Thank sponsors',
    description: 'Logos and links for tonight’s supporters.',
    icon: Heart,
    factory: () => ({
      id: uid(),
      module: 'foundation',
      type: 'sponsor_thanks',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'With thanks to',
      sponsors: [
        { id: itemId(), name: 'Bath Spa Hotel', url: 'https://example.com' },
        { id: itemId(), name: 'The Gilded Fork', url: 'https://example.com' },
      ],
    }),
  },
  {
    type: 'refreshments',
    label: 'Pre-order refreshments',
    description: 'CTA linking to interval-drinks ordering.',
    icon: Coffee,
    factory: () => ({
      id: uid(),
      module: 'foundation',
      type: 'refreshments',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'Skip the queue',
      description: 'Pre-order interval drinks and have them waiting at the bar.',
      cta_label: 'Order now',
      cta_url: 'https://example.com/refreshments',
    }),
  },
];

/* ============================================================
   Module 2 — People & Credits
   ============================================================ */
const PEOPLE_BLOCKS: BlockTemplate[] = [
  {
    type: 'cast_grid',
    label: 'Cast grid',
    description: 'Tappable grid of cast portraits.',
    icon: Users,
    factory: () => ({
      id: uid(),
      module: 'people_credits',
      type: 'cast_grid',
      animation: { ...defaultAnimation(), type: 'fade_in' },
      layout: defaultLayout(),
      title: 'Cast',
      description: 'Tap a card to read each performer’s biography.',
      columns: 2,
      members: [
        {
          id: itemId(),
          name: 'Amelia Hart',
          role: 'Hamlet',
          image: 'https://i.pravatar.cc/300?img=47',
          bio: 'Amelia trained at LAMDA and last appeared at the Royal Crescent in The Seagull.',
        },
        {
          id: itemId(),
          name: 'Jonas Price',
          role: 'Claudius',
          image: 'https://i.pravatar.cc/300?img=12',
          bio: 'Jonas’s recent credits include King Lear at Bristol Old Vic.',
        },
        {
          id: itemId(),
          name: 'Leah Ford',
          role: 'Ophelia',
          image: 'https://i.pravatar.cc/300?img=44',
          bio: 'Leah is making her professional debut in this production.',
        },
        {
          id: itemId(),
          name: 'Tariq Bell',
          role: 'Horatio',
          image: 'https://i.pravatar.cc/300?img=14',
          bio: 'Tariq trained at RADA and joined the company last season.',
        },
      ],
    }),
  },
  {
    type: 'cast_spotlight',
    label: 'Cast spotlight',
    description: 'Feature one performer in detail.',
    icon: UserCircle2,
    factory: () => ({
      id: uid(),
      module: 'people_credits',
      type: 'cast_spotlight',
      animation: { ...defaultAnimation(), type: 'slide_up' },
      layout: defaultLayout(),
      name: 'Amelia Hart',
      role: 'Hamlet',
      image: 'https://i.pravatar.cc/600?img=47',
      bio: 'Amelia trained at LAMDA. She last appeared at the Royal Crescent in The Seagull and Mary Stuart. This is her first leading role at the venue.',
      social: [{ label: 'Instagram', url: 'https://example.com' }],
    }),
  },
];

/* ============================================================
   Module 3 — Context & Notes
   ============================================================ */
const CONTEXT_BLOCKS: BlockTemplate[] = [
  {
    type: 'narrative_text',
    label: 'Narrative text',
    description: 'Long-form copy — director’s notes, dramaturgy.',
    icon: AlignLeft,
    factory: () => ({
      id: uid(),
      module: 'context_notes',
      type: 'narrative_text',
      animation: { ...defaultAnimation(), type: 'fade_in' },
      layout: { ...defaultLayout(), align: 'left' },
      eyebrow: 'Director’s note',
      heading: 'A court that watches itself fall apart',
      body: 'When I started rehearsing this Hamlet I was thinking about surveillance — about who is watching whom, and who decides what counts as evidence. Five actors, one ghost, and a court turning in on itself.',
    }),
  },
  {
    type: 'image_story',
    label: 'Image story',
    description: 'Image with accompanying narrative copy.',
    icon: ImagePlus,
    factory: () => ({
      id: uid(),
      module: 'context_notes',
      type: 'image_story',
      animation: { ...defaultAnimation(), type: 'slide_up' },
      layout: defaultLayout(),
      image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200',
      caption: 'The Royal Crescent stage, set for Act I',
      body: 'The set was built across six weeks in the workshop on Argyle Street.',
      image_position: 'top',
    }),
  },
];

/* ============================================================
   Module 4 — Interactive Reactions
   ============================================================ */
const REACTIONS_BLOCKS: BlockTemplate[] = [
  {
    type: 'poll',
    label: 'Poll / reaction',
    description: 'Single-tap audience response.',
    icon: Vote,
    factory: () => ({
      id: uid(),
      module: 'interactive_reactions',
      type: 'poll',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      question: 'How did Act I land for you?',
      variant: 'emoji_tap',
      options: [
        { id: itemId(), label: 'Awe', emoji: '✨' },
        { id: itemId(), label: 'Tense', emoji: '😬' },
        { id: itemId(), label: 'Moved', emoji: '🥺' },
        { id: itemId(), label: 'Surprised', emoji: '😲' },
      ],
      thank_you_message: 'Thanks — see how the rest of the audience felt at the end.',
      show_results_live: false,
    }),
  },
  {
    type: 'review',
    label: 'Free-text review',
    description: 'Open response from the audience.',
    icon: MessageSquareText,
    factory: () => ({
      id: uid(),
      module: 'interactive_reactions',
      type: 'review',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      prompt: 'Share a thought from tonight',
      placeholder: 'A line, a feeling, a question…',
      max_chars: 280,
      submit_label: 'Submit',
    }),
  },
];

/* ============================================================
   Module 5 — Purchasing
   ============================================================ */
const PURCHASING_BLOCKS: BlockTemplate[] = [
  {
    type: 'merchandise',
    label: 'Merchandise',
    description: 'Show shop items with external checkout.',
    icon: ShoppingBag,
    factory: () => ({
      id: uid(),
      module: 'purchasing',
      type: 'merchandise',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'The shop',
      items: [
        {
          id: itemId(),
          name: 'Hamlet poster (signed)',
          image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600',
          price: '£18',
          url: 'https://example.com/poster',
        },
        {
          id: itemId(),
          name: 'Programme tote',
          image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600',
          price: '£12',
          url: 'https://example.com/tote',
        },
      ],
    }),
  },
  {
    type: 'future_shows',
    label: 'Upcoming shows',
    description: 'Cross-sell future programming.',
    icon: CalendarPlus,
    factory: () => ({
      id: uid(),
      module: 'purchasing',
      type: 'future_shows',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'Coming up',
      shows: [
        {
          id: itemId(),
          name: 'A Midsummer Night’s Dream',
          date: 'June 4–14',
          image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600',
          url: 'https://example.com/midsummer',
        },
      ],
    }),
  },
  {
    type: 'donation',
    label: 'Donation',
    description: 'Support the venue or company.',
    icon: HandCoins,
    factory: () => ({
      id: uid(),
      module: 'purchasing',
      type: 'donation',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'Support our work',
      body: 'Royal Crescent is a charity — your donation helps us keep ticket prices accessible.',
      cta_label: 'Donate',
      cta_url: 'https://example.com/donate',
      preset_amounts: [5, 10, 25, 50],
    }),
  },
  {
    type: 'offers',
    label: 'Special offers',
    description: 'Discount codes, member offers.',
    icon: Tag,
    factory: () => ({
      id: uid(),
      module: 'purchasing',
      type: 'offers',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'Tonight’s offers',
      offers: [
        {
          id: itemId(),
          title: 'Cast album — 20% off',
          description: 'Use code SHOWE20 at checkout.',
          code: 'SHOWE20',
          expires: '31 May 2026',
        },
      ],
    }),
  },
];

/* ============================================================
   Module 6 — Memory Capture
   ============================================================ */
const MEMORY_BLOCKS: BlockTemplate[] = [
  {
    type: 'memory_capture',
    label: 'Memory capture',
    description: 'Private note or photo attached to the programme.',
    icon: StickyNote,
    factory: () => ({
      id: uid(),
      module: 'memory_capture',
      type: 'memory_capture',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'Keep tonight close',
      prompt: 'Write a line. Add a photo. Only you will see it.',
      placeholder: 'Write your memory…',
      submit_label: 'Save memory',
      success_message: 'Memory saved! You can view it in your "My Memories" section.',
      allow_image: true,
      allow_text: true,
      privacy_note: 'Private — only visible inside your copy of this programme.',
    }),
  },
];

/* ============================================================
   Module 7 — Highlight & Recap
   ============================================================ */
const RECAP_BLOCKS: BlockTemplate[] = [
  {
    type: 'recap',
    label: 'Highlight & recap',
    description: 'Aggregated audience reactions, sent the next day.',
    icon: Sparkles,
    factory: () => ({
      id: uid(),
      module: 'highlight_recap',
      type: 'recap',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'How tonight felt — together',
      description: 'A summary of the audience’s reactions, ready 24 hours after the show.',
      release_after_hours: 24,
      poll_ids_to_include: [],
    }),
  },
];

/* ============================================================
   Module 8 — Recommendations
   ============================================================ */
const RECOMMENDATIONS_BLOCKS: BlockTemplate[] = [
  {
    type: 'recommendations',
    label: 'Plan your trip',
    description: 'Curated nearby restaurants, hotels and bars.',
    icon: MapPinned,
    factory: () => ({
      id: uid(),
      module: 'recommendations',
      type: 'recommendations',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'Make a night of it',
      category: 'all',
      show_distance: true,
      show_rating: true,
      source: 'venue',
    }),
  },
];

/* ============================================================
   Module 9 — Push Notifications
   ============================================================ */
const PUSH_BLOCKS: BlockTemplate[] = [
  {
    type: 'push_notification',
    label: 'Push notification',
    description: 'Timed message to programme holders.',
    icon: Bell,
    factory: () => ({
      id: uid(),
      module: 'push_notifications',
      type: 'push_notification',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'Curtain in 15 minutes',
      message: 'Please make your way to your seats.',
      trigger: 'pre_event',
    }),
  },
];

/* ============================================================
   Module 10 — Getting There
   ============================================================ */
const GETTING_THERE_BLOCKS: BlockTemplate[] = [
  {
    type: 'map',
    label: 'Map',
    description: 'Embedded map with venue location.',
    icon: Map,
    factory: () => ({
      id: uid(),
      module: 'getting_there',
      type: 'map',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'Find us',
      address: 'Royal Crescent Theatre, 12 Royal Crescent, Bath, BA1 2LR',
      lat: 51.3873,
      lng: -2.3669,
      show_parking: true,
      show_accessibility_route: true,
    }),
  },
  {
    type: 'directions',
    label: 'Directions & parking',
    description: 'Turn-by-turn travel info.',
    icon: Navigation,
    factory: () => ({
      id: uid(),
      module: 'getting_there',
      type: 'directions',
      animation: defaultAnimation(),
      layout: defaultLayout(),
      title: 'Getting here',
      by_car: 'Park at the Charlotte Street car park, 4 minutes’ walk away.',
      by_train: 'Bath Spa is a 12-minute walk along Pulteney Street.',
      by_bus: 'Routes 1, 6 and 7 stop at the Crescent Lodge gates.',
      parking_info: 'Limited blue-badge bays directly outside the venue.',
    }),
  },
];

/* ============================================================
   Module catalogue
   ============================================================ */

export const MODULE_CATALOGUE: ModuleMeta[] = [
  {
    id: 'foundation',
    number: 1,
    label: 'Foundation',
    description: 'Front page, schedule, accessibility, sponsors.',
    required_tier: 1,
    blocks: FOUNDATION_BLOCKS,
  },
  {
    id: 'people_credits',
    number: 2,
    label: 'People & Credits',
    description: 'Cast and crew with biographies.',
    required_tier: 1,
    blocks: PEOPLE_BLOCKS,
  },
  {
    id: 'context_notes',
    number: 3,
    label: 'Context & Notes',
    description: 'Director’s notes, dramaturgy, production stories.',
    required_tier: 1,
    blocks: CONTEXT_BLOCKS,
  },
  {
    id: 'interactive_reactions',
    number: 4,
    label: 'Interactive Reactions',
    description: 'Polls and single-tap audience reactions.',
    required_tier: 1,
    blocks: REACTIONS_BLOCKS,
  },
  {
    id: 'purchasing',
    number: 5,
    label: 'Purchasing',
    description: 'Merch, future shows, donations, offers.',
    required_tier: 2,
    blocks: PURCHASING_BLOCKS,
  },
  {
    id: 'memory_capture',
    number: 6,
    label: 'Memory Capture',
    description: 'Private audience reflections.',
    required_tier: 2,
    blocks: MEMORY_BLOCKS,
  },
  {
    id: 'highlight_recap',
    number: 7,
    label: 'Highlight & Recap',
    description: 'Aggregated audience data, returned 24h later.',
    required_tier: 2,
    blocks: RECAP_BLOCKS,
  },
  {
    id: 'recommendations',
    number: 8,
    label: 'Recommendations',
    description: 'Curated nearby restaurants, hotels and bars.',
    required_tier: 2,
    blocks: RECOMMENDATIONS_BLOCKS,
  },
  {
    id: 'push_notifications',
    number: 9,
    label: 'Push Notifications',
    description: 'Real-time messages to programme holders.',
    required_tier: 3,
    blocks: PUSH_BLOCKS,
  },
  {
    id: 'getting_there',
    number: 10,
    label: 'Getting There',
    description: 'Map and travel directions.',
    required_tier: 1.5,
    blocks: GETTING_THERE_BLOCKS,
  },
];

/* Tier number from VenueTier string */
export function tierToNumber(tier: string | undefined): number {
  switch (tier) {
    case 'tier_1': return 1;
    case 'tier_1_plus': return 1.5;
    case 'tier_2': return 2;
    case 'tier_3': return 3;
    case 'tier_3_plus': return 3.5;
    default: return 1;
  }
}

export function isModuleUnlocked(moduleNumber: number, tier: string | undefined): boolean {
  const userTier = tierToNumber(tier);
  // T1+ specifically unlocks 1-4 + 10 (no 5-9). T2 unlocks 1-8 + 10 (no 9). T3 unlocks all.
  if (userTier === 1.5) {
    return moduleNumber <= 4 || moduleNumber === 10;
  }
  if (userTier === 2) {
    return moduleNumber <= 8 || moduleNumber === 10;
  }
  if (userTier >= 3) {
    return true;
  }
  // Tier 1
  return moduleNumber <= 4;
}

/* Quick lookup */
export function findBlockTemplate(type: BlockType): BlockTemplate | undefined {
  for (const m of MODULE_CATALOGUE) {
    const t = m.blocks.find((b) => b.type === type);
    if (t) return t;
  }
  return undefined;
}

export function findModule(id: ModuleId): ModuleMeta | undefined {
  return MODULE_CATALOGUE.find((m) => m.id === id);
}
