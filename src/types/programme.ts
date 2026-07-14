/* =====================================================================
   Programme Builder — Type System
   Discriminated union of all block types across all 10 modules.
   ===================================================================== */

export type AnimationType =
  | 'none'
  | 'fade_in'
  | 'slide_up'
  | 'slide_in_right'
  | 'scale_in'
  | 'parallax'
  | 'tap_expand';

export interface BlockAnimation {
  type: AnimationType;
  delay_ms: number; // 0–1000
  duration_ms: number; // 200–1500
}

export interface BlockLayout {
  align: 'left' | 'center' | 'right' | 'full';
  padding_top: number;
  padding_bottom: number;
  padding_x: number;
  background?: 'none' | 'surface' | 'sunken' | 'primary' | 'accent' | 'custom' | 'dark';
  background_custom?: string; // hex when background === 'custom'
  text_color?: string;        // custom hex text colour for all text in this block
  title_color?: string;       // custom hex colour for headings only (overrides text_color)
  eyebrow_color?: string;     // custom hex colour for .eyebrow tag labels (the small uppercase section labels)
  card_background?: string;   // custom hex background for inner cards (.bg-surface-raised / .bg-surface-sunken)
  card_text_color?: string;   // custom hex text colour inside cards (overrides text_color within cards)
}

/* Base shape — every block has these */
interface BaseBlock {
  id: string;
  module: ModuleId;
  animation: BlockAnimation;
  layout: BlockLayout;
}

export type ModuleId =
  | 'foundation'
  | 'people_credits'
  | 'context_notes'
  | 'interactive_reactions'
  | 'purchasing'
  | 'memory_capture'
  | 'highlight_recap'
  | 'recommendations'
  | 'push_notifications'
  | 'getting_there';

/* ---------- Module 1: Foundation ---------- */

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  module: 'foundation';
  title: string;
  subtitle?: string;
  cover_image?: string;
  height: 'short' | 'medium' | 'tall' | 'full';
  overlay: boolean;
  parallax: boolean;
}

export interface WelcomeBlock extends BaseBlock {
  type: 'welcome';
  module: 'foundation';
  heading: string;
  body: string; // rich text — markdown subset
  signature?: string; // e.g. "Mara Sinclair, Artistic Director"
}

export interface ScheduleBlock extends BaseBlock {
  type: 'schedule';
  module: 'foundation';
  title: string;
  items: { id: string; time: string; label: string; note?: string }[];
}

export interface AccessibilityBlock extends BaseBlock {
  type: 'accessibility';
  module: 'foundation';
  title: string;
  features: { id: string; icon: string; label: string; description?: string }[];
}

export interface BehindScenesBlock extends BaseBlock {
  type: 'behind_scenes';
  module: 'foundation';
  title: string;
  body: string;
  images: string[];
}

export interface SponsorThanksBlock extends BaseBlock {
  type: 'sponsor_thanks';
  module: 'foundation';
  title: string;
  sponsors: { id: string; name: string; logo?: string; url?: string }[];
}

export interface RefreshmentsBlock extends BaseBlock {
  type: 'refreshments';
  module: 'foundation';
  title: string;
  description: string;
  cta_label: string;
  cta_url: string;
}

/* ---------- Module 2: People & Credits ---------- */

export interface CastGridBlock extends BaseBlock {
  type: 'cast_grid';
  module: 'people_credits';
  title: string;
  description?: string;
  members: {
    id: string;
    name: string;
    role: string;
    image?: string;
    bio?: string;
    link_url?: string;
    link_label?: string;
  }[];
  columns: 2 | 3;
}

export interface CastSpotlightBlock extends BaseBlock {
  type: 'cast_spotlight';
  module: 'people_credits';
  name: string;
  role: string;
  image?: string;
  bio: string;
  link_url?: string;
  link_label?: string;
  social?: { label: string; url: string }[];
}

/* ---------- Module 3: Context & Notes ---------- */

export interface NarrativeTextBlock extends BaseBlock {
  type: 'narrative_text';
  module: 'context_notes';
  eyebrow?: string;
  heading?: string;
  body: string;
}

export interface ImageStoryBlock extends BaseBlock {
  type: 'image_story';
  module: 'context_notes';
  image: string;
  caption?: string;
  body: string;
  image_position: 'top' | 'left' | 'right';
}

/* ---------- Module 4: Interactive Reactions ---------- */

export interface PollBlock extends BaseBlock {
  type: 'poll';
  module: 'interactive_reactions';
  question: string;
  variant: 'emoji_tap' | 'multiple_choice' | 'rating';
  options: { id: string; label: string; emoji?: string }[];
  results: { option_id: string; count: number }[];
  thank_you_message?: string;
  show_results_live: boolean;
  vote_submit_url?: string; // Optional backend endpoint for live vote submission
}

export interface ReviewBlock extends BaseBlock {
  type: 'review';
  module: 'interactive_reactions';
  prompt: string;
  placeholder: string;
  max_chars: number;
  submit_label: string;
  submit_url?: string; // backend endpoint for future integration
}

/* ---------- Module 5: Purchasing ---------- */

export interface MerchandiseBlock extends BaseBlock {
  type: 'merchandise';
  module: 'purchasing';
  title: string;
  items: {
    id: string;
    name: string;
    image?: string;
    price: string;
    url: string;
  }[];
}

export interface FutureShowsBlock extends BaseBlock {
  type: 'future_shows';
  module: 'purchasing';
  title: string;
  shows: { id: string; name: string; date: string; image?: string; url: string }[];
}

export interface DonationBlock extends BaseBlock {
  type: 'donation';
  module: 'purchasing';
  title: string;
  body: string;
  image?: string;
  cta_label: string;
  cta_url: string;
  preset_amounts: number[];
}

export interface OffersBlock extends BaseBlock {
  type: 'offers';
  module: 'purchasing';
  title: string;
  offers: { id: string; title: string; description: string; code?: string; expires?: string }[];
}

export interface AdsBlock extends BaseBlock {
  type: 'ads';
  module: 'purchasing';
  title: string;
  selected_items?: string[];
}

/* ---------- Module 6: Memory Capture ---------- */

export interface MemoryCaptureBlock extends BaseBlock {
  type: 'memory_capture';
  module: 'memory_capture';
  title: string;
  prompt: string;
  placeholder: string;
  submit_label: string;
  success_message: string;
  allow_image: boolean;
  allow_text: boolean;
  privacy_note: string;
}

/* ---------- Module 7: Highlight & Recap ---------- */

export interface RecapBlock extends BaseBlock {
  type: 'recap';
  module: 'highlight_recap';
  title: string;
  description: string;
  release_after_hours: number;
  poll_ids_to_include: string[];
  results_api_url?: string; // Optional backend endpoint for recap aggregation
}

/* ---------- Module 8: Recommendations ---------- */

export interface RecommendationsBlock extends BaseBlock {
  type: 'recommendations';
  module: 'recommendations';
  title: string;
  category: 'all' | 'restaurants' | 'hotels' | 'bars';
  show_distance: boolean;
  show_rating: boolean;
  source: 'venue' | 'showe'; // tier-gated
  selected_items?: string[];
}

/* ---------- Module 9: Push Notifications ---------- */

export interface PushNotificationBlock extends BaseBlock {
  type: 'push_notification';
  module: 'push_notifications';
  title: string;
  message: string;
  scheduled_at?: string; // ISO
  event_date?: string; // ISO
  trigger: 'immediate' | 'scheduled' | 'pre_event' | 'post_event';
  offset_minutes?: number;
}

/* ---------- Module 10: Getting There ---------- */

export interface MapBlock extends BaseBlock {
  type: 'map';
  module: 'getting_there';
  title: string;
  address: string;
  lat?: number;
  lng?: number;
  show_parking: boolean;
  show_accessibility_route: boolean;
}

export interface DirectionsBlock extends BaseBlock {
  type: 'directions';
  module: 'getting_there';
  title: string;
  by_car?: string;
  by_train?: string;
  by_bus?: string;
  parking_info?: string;
}

/* ---------- Discriminated union ---------- */

export type Block =
  | HeroBlock
  | WelcomeBlock
  | ScheduleBlock
  | AccessibilityBlock
  | BehindScenesBlock
  | SponsorThanksBlock
  | RefreshmentsBlock
  | CastGridBlock
  | CastSpotlightBlock
  | NarrativeTextBlock
  | ImageStoryBlock
  | PollBlock
  | ReviewBlock
  | MerchandiseBlock
  | FutureShowsBlock
  | DonationBlock
  | OffersBlock
  | AdsBlock
  | MemoryCaptureBlock
  | RecapBlock
  | RecommendationsBlock
  | PushNotificationBlock
  | MapBlock
  | DirectionsBlock;

export type BlockType = Block['type'];

/* ---------- Programme document ---------- */

export interface ProgrammePage {
  id: string;
  title: string;
  blocks: Block[];
}

export type ProgrammeDocStatus = 'draft' | 'published' | 'archived';

export interface ProgrammeDoc {
  id: string;
  // venue_id: string;
  event_id: string | null; // optionally linked to an event
  title: string;
  cover_image?: string;
  category?: 'THEATRE' | 'SPORTS' | 'MUSIC' | 'EVENTS' | 'MUSEUM' | 'COMMUNITY' | 'CEREMONIES';
  pages: ProgrammePage[];
  status: ProgrammeDocStatus;
  is_free: boolean;
  price_pence: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}
