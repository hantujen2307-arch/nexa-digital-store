import { Product, CinemaPromo } from '@/types/database';

/**
 * Returns the realistic sold count ("sudah terjual") for a given product.
 * - If product explicitly has `sold_count`, use it (strictly capped at 60).
 * - For CapCut (or capcut-pro), returns 33 as explicitly requested by user.
 * - For other products, provides realistic, natural-looking numbers <= 60 (never exceeding 60).
 * - Uses deterministic hashing when not explicitly defined, so numbers are consistent across renders.
 */
export function getProductSoldCount(product: Partial<Product> | null | undefined): number {
  if (!product) return 25;

  if (typeof product.sold_count === 'number' && product.sold_count > 0) {
    return Math.min(Math.round(product.sold_count), 60);
  }

  const nameLower = (product.name || '').toLowerCase();
  const slugLower = (product.slug || '').toLowerCase();

  // Explicit user requirement: CapCut sold count is 33
  if (nameLower.includes('capcut') || slugLower.includes('capcut')) {
    return 33;
  }

  // Pre-configured realistic sales counts for catalogue apps (all <= 60, authentic)
  if (nameLower.includes('canva') || slugLower.includes('canva')) return 48;
  if (nameLower.includes('chatgpt') || slugLower.includes('chatgpt') || slugLower.includes('gpt')) return 56;
  if (nameLower.includes('spotify') || slugLower.includes('spotify')) return 58;
  if (nameLower.includes('youtube') || slugLower.includes('youtube')) return 53;
  if (nameLower.includes('netflix') || slugLower.includes('netflix')) return 59;
  if (nameLower.includes('microsoft') || slugLower.includes('office') || slugLower.includes('365')) return 32;
  if (nameLower.includes('grammarly') || slugLower.includes('grammarly')) return 24;
  if (nameLower.includes('adobe') || slugLower.includes('adobe')) return 39;
  if (nameLower.includes('google') || slugLower.includes('google')) return 27;
  if (nameLower.includes('zoom') || slugLower.includes('zoom')) return 35;
  if (nameLower.includes('telegram') || slugLower.includes('tele')) return 41;
  if (nameLower.includes('duolingo') || slugLower.includes('duolingo')) return 22;
  if (nameLower.includes('picsart') || slugLower.includes('picsart')) return 29;
  if (slugLower.includes('lainnya') || nameLower.includes('lainnya')) return 17;

  // Fallback: deterministic pseudo-random hash between 18 and 58 (never exceeding 60)
  const key = product.slug || product.id || product.name || 'default-product';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const min = 18;
  const max = 58;
  return min + (Math.abs(hash) % (max - min + 1));
}

/**
 * Returns the realistic sold count ("sudah terjual") for a cinema promo ticket.
 * - If promo explicitly has `sold_count`, use it (strictly capped at 60).
 * - Pre-configured realistic sales counts (all <= 60).
 * - Fallback: deterministic hash between 28 and 56 (never exceeding 60).
 */
export function getCinemaPromoSoldCount(promo: Partial<CinemaPromo> | null | undefined): number {
  if (!promo) return 38;

  if (typeof promo.sold_count === 'number' && promo.sold_count > 0) {
    return Math.min(Math.round(promo.sold_count), 60);
  }

  const nameLower = (promo.name || '').toLowerCase();
  const cinemaLower = (promo.cinema || '').toLowerCase();

  // XXI is the most popular cinema chain
  if (nameLower.includes('xxi') || cinemaLower.includes('xxi')) return 52;
  // CGV is second most popular
  if (nameLower.includes('cgv') || cinemaLower.includes('cgv')) return 45;
  // Cinépolis
  if (nameLower.includes('cine') || cinemaLower.includes('cine')) return 38;

  const key = promo.id || promo.name || promo.cinema || 'promo';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const min = 28;
  const max = 56;
  return min + (Math.abs(hash) % (max - min + 1));
}
