import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Share2 } from 'lucide-react';
import { useProgrammesStore } from '@/features/programmes/store/programmes.store';
import { renderBlockPreview } from '@/features/programmes/builder/BlockPreviews';
import { useReveal } from '@/features/programmes/animation';
import { Logo } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Block, ProgrammeDoc, ProgrammePage } from '@/types/programme';

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const programme = useProgrammesStore((s) => (id ? s.programmes[id] : null));
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
    window.scrollTo({ top: 0 });
  }, [id]);

  if (!id || !programme) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-base p-6">
        <BookOpen size={32} className="text-ink-faint mb-3" />
        <h1 className="font-display font-bold text-2xl text-ink">Programme not found</h1>
        <p className="text-ink-muted mt-2">This programme may have been deleted or moved.</p>
        <Link to="/" className="mt-4 text-primary font-semibold">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const page = programme.pages[pageIndex] ?? programme.pages[0]!;
  const totalPages = programme.pages.length;
  const goPrev = () => {
    if (pageIndex > 0) {
      setPageIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const goNext = () => {
    if (pageIndex < totalPages - 1) {
      setPageIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-dvh bg-ink/95 text-ink-inverse relative !hide-scrollbar">
      {/* Brand strip — discreet header */}
      <div className="px-5 py-2 border-b border-white/8 flex items-center justify-between fixed top-0 w-full backdrop-blur-2xl z-50">
        <Logo size="sm" inverse />
        <div className='flex justify-center items-center'>
          <h1 className="font-display font-extrabold text-xl md:text-2xl mt-1.5 text-ink-inverse text-center">
            {programme.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} /> Back to dashboard
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: programme.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
            aria-label="Share"
          >
            <Share2 size={13} />
          </button>
        </div>
      </div>

      {/* Title strip */}
      {/* <div className="text-center py-4 px-5 pt-[73px]">
        <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-accent">
          Programme
        </div>
      
        <div className="text-[11.5px] text-white/60 mt-1.5">
          Page {pageIndex + 1} of {totalPages}
          {totalPages > 1 && (
            <>
              {' · '}
              <span className="font-semibold text-white/80">{page.title}</span>
            </>
          )}
        </div>
      </div> */}

      {/* Phone frame on desktop, full-width on mobile */}
      <div className="px-4 pt-[72px]  2xl:pt-20 2xl:pb-16">
        <div className="mx-auto" style={{ maxWidth: 420 }}>
          <div className="md:p-2.5 md:bg-ink md:rounded-[40px] md:shadow-2xl">
            <div className="md:rounded-[32px] md:overflow-hidden bg-surface-raised text-ink rounded-2xl overflow-hidden">
              {/* Notch (desktop only) */}
              <div className="hidden md:block relative">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-ink rounded-full z-10" />
              </div>

              {/* Page content */}
              <div className="h-[calc(100dvh-137px)] 2xl:h-[calc(100vh-180px)] overflow-auto hide-scrollbar" key={page.id}>
                {page.blocks.length === 0 ? (
                  <div className="px-6 py-20 text-center text-ink-muted">
                    <BookOpen size={28} className="mx-auto mb-3 text-ink-faint" />
                    <p>This page is empty.</p>
                  </div>
                ) : (
                  <div>
                {page?.blocks?.map((b) => (
                      <ReaderBlock key={b.id} block={b} programme={programme} page={page} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page indicator dots */}
          {totalPages > 1 && (
            <div className="hidden 2xl:flex items-center justify-center gap-2 mt-2">
              {programme.pages.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setPageIndex(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === pageIndex ? 'w-6 bg-accent' : 'w-1.5 bg-white/30 hover:bg-white/50'
                  )}
                  aria-label={`Go to ${p.title}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating page nav */}
      {totalPages > 1 && (
        <nav className="fixed bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 p-1 2xl:p-1.5 rounded-full bg-ink-inverse text-ink shadow-2xl border border-white/10">
          <button
            onClick={goPrev}
            disabled={pageIndex === 0}
            className="w-6 h-6 2xl:w-9 2xl:h-9 rounded-full hover:bg-surface-sunken disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="px-3 text-[12px] font-semibold tabular text-ink whitespace-nowrap">
            {pageIndex + 1} / {totalPages}
          </div>
          <button
            onClick={goNext}
            disabled={pageIndex === totalPages - 1}
            className="w-6 h-6 2xl:w-9 2xl:h-9 rounded-full hover:bg-surface-sunken disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}

function ReaderBlock({
  block,
  programme,
  page,
}: {
  block: Block;
  programme: ProgrammeDoc;
  page: ProgrammePage;
}) {
  const reveal = useReveal(block.animation);

  const resolvedBg =
    block.layout.background === 'custom'
      ? (block.layout.background_custom || 'transparent')
      : block.layout.background === 'sunken'
        ? '#F2EFE9'
        : block.layout.background === 'surface'
          ? '#FBFAF7'
          : block.layout.background === 'primary'
            ? '#014B52'
            : block.layout.background === 'accent'
              ? '#F5A800'
              : block.layout.background === 'dark'
                ? '#000000'
                : 'transparent';

  const style = {

    paddingTop: block.layout.padding_top,
    paddingBottom: block.layout.padding_bottom,
    paddingLeft: block.layout.padding_x,
    paddingRight: block.layout.padding_x,
    background: resolvedBg,
    ...(block.layout.text_color
      ? { '--btext': block.layout.text_color }
      : {}),
    ...(block.layout.text_color
      ? { '--bborder': block.layout.text_color }
      : {}),
    ...(block.layout.title_color
      ? { '--btitle': block.layout.title_color }
      : {}),
    ...(block.layout.eyebrow_color
      ? { '--beyebrow': block.layout.eyebrow_color }
      : {}),
    ...(block.layout.card_background
      ? { '--bcardbg': block.layout.card_background }
      : {}),
    ...(block.layout.card_text_color
      ? { '--bcardtext': block.layout.card_text_color }
      : {}),
  } as React.CSSProperties;

  return (
    <div
      style={style}
      className={cn(
        block.layout.text_color && 'block-textcolor',
        block.layout.title_color && 'block-titlecolor',
        block.layout.eyebrow_color && 'block-eyebrowcolor',
        block.layout.card_background && 'block-cardbg',
        block.layout.card_text_color && 'block-cardtext'
      )}
    >
      <div ref={reveal.ref} style={reveal.style}>
        {renderBlockPreview(block, { programme, page })}
      </div>
    </div>
  );
}
