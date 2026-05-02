const ID_ATTRIBUTE_PATTERN = /\sid=(['"])[^'"]*\1|\sid=[^\s>]*/i;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const HTML_ENTITY_PATTERN = /&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/gi;
const SLUG_INVALID_CHARACTER_PATTERN = /[^\p{Letter}\p{Number}\s_-]/gu;
const SLUG_WHITESPACE_PATTERN = /\s+/g;
const SLUG_DASH_PATTERN = /-+/g;

const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"',
};

/** A complete heading element discovered by the linear README HTML scanner. */
interface HeadingMatch {
  attributes: string;
  closeEnd: number;
  closeStart: number;
  content: string;
  level: string;
  openStart: number;
  openTagEnd: number;
  source: string;
}

/**
 * Adds stable fragment IDs to rendered README headings that do not already have one.
 * @param html - The rendered README HTML returned by GitHub's markdown renderer.
 * @returns The README HTML with GitHub-style heading IDs for hash navigation.
 */
export function addReadmeHeadingIds(html: string): string {
  const usedSlugs = new Set<string>();
  let cursor = 0;
  let rewrittenHtml = "";

  while (cursor < html.length) {
    const heading = findNextHeading(html, cursor);
    if (!heading) {
      rewrittenHtml += html.slice(cursor);
      break;
    }

    rewrittenHtml += html.slice(cursor, heading.openStart);
    rewrittenHtml += renderHeadingWithId(heading, usedSlugs);
    cursor = heading.closeEnd;
  }

  return rewrittenHtml;
}

/**
 * Converts heading HTML content into a GitHub-like fragment slug.
 * @param headingHtml - The inner HTML of a heading element.
 * @returns A lowercase fragment slug suitable for an HTML id attribute.
 */
export function slugifyHeadingText(headingHtml: string): string {
  return decodeHtmlEntities(headingHtml.replace(HTML_TAG_PATTERN, ""))
    .trim()
    .toLowerCase()
    .replace(SLUG_INVALID_CHARACTER_PATTERN, "")
    .replace(SLUG_WHITESPACE_PATTERN, "-")
    .replace(SLUG_DASH_PATTERN, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Converts a numeric HTML entity body into the represented character.
 * @param value - The numeric part of the entity.
 * @param radix - The radix used by the entity.
 * @returns The decoded character, or the original entity body when invalid.
 */
function decodeCodePoint(value: string, radix: number): string {
  const codePoint = Number.parseInt(value, radix);
  if (!Number.isFinite(codePoint)) {
    return `&#${value};`;
  }

  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return `&#${value};`;
  }
}

/**
 * Decodes the small entity set needed for heading text slug generation.
 * @param value - Text that may contain HTML entities.
 * @returns The text with known named and numeric entities decoded.
 */
function decodeHtmlEntities(value: string): string {
  return value.replace(HTML_ENTITY_PATTERN, (_entity, entityBody: string) => {
    const normalizedEntity = entityBody.toLowerCase();

    if (normalizedEntity.startsWith("#x")) {
      return decodeCodePoint(normalizedEntity.slice(2), 16);
    }

    if (normalizedEntity.startsWith("#")) {
      return decodeCodePoint(normalizedEntity.slice(1), 10);
    }

    return NAMED_HTML_ENTITIES[normalizedEntity] ?? _entity;
  });
}

/**
 * Picks the next available slug by appending GitHub-style numeric suffixes.
 * @param baseSlug - The preferred slug for the current heading.
 * @param usedSlugs - Slugs already assigned earlier in the document.
 * @returns A slug that has not already been assigned.
 */
function dedupeSlug(baseSlug: string, usedSlugs: Set<string>): string {
  if (!usedSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 1;
  let candidate = `${baseSlug}-${String(suffix)}`;

  while (usedSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${String(suffix)}`;
  }

  return candidate;
}

/**
 * Reads an existing id attribute from a heading attributes string.
 * @param attributes - The raw heading attribute text.
 * @returns The current id value, when present.
 */
function extractIdAttribute(attributes: string): null | string {
  const match = /\sid=(?:['"]([^'"]*)['"]|([^\s>]*))/i.exec(attributes);
  return match?.[1] ?? match?.[2] ?? null;
}

/**
 * Finds the next complete h1-h6 element without using a backtracking HTML regex.
 * @param html - The rendered README HTML to scan.
 * @param startIndex - The index where scanning should begin.
 * @returns The next complete heading match, or `null` when no heading remains.
 */
function findNextHeading(
  html: string,
  startIndex: number,
): HeadingMatch | null {
  const lowerHtml = html.toLowerCase();
  let openStart = lowerHtml.indexOf("<h", startIndex);

  while (openStart !== -1) {
    const level = html[openStart + 2];
    const afterLevel = html[openStart + 3];

    if (
      /[1-6]/u.test(level) &&
      (afterLevel === ">" || /\s/u.test(afterLevel))
    ) {
      const openTagEnd = html.indexOf(">", openStart + 3);
      if (openTagEnd === -1) return null;

      const closeTag = `</h${level}>`;
      const closeStart = lowerHtml.indexOf(closeTag, openTagEnd + 1);
      if (closeStart === -1) return null;

      const closeEnd = closeStart + closeTag.length;

      return {
        attributes: html.slice(openStart + 3, openTagEnd),
        closeEnd,
        closeStart,
        content: html.slice(openTagEnd + 1, closeStart),
        level,
        openStart,
        openTagEnd,
        source: html.slice(openStart, closeEnd),
      };
    }

    openStart = lowerHtml.indexOf("<h", openStart + 2);
  }

  return null;
}

/**
 * Preserves headings that already have IDs and assigns de-duplicated IDs to plain headings.
 * @param heading - The scanned heading element to render.
 * @param usedSlugs - Heading IDs already observed earlier in the document.
 * @returns The original or rewritten heading HTML.
 */
function renderHeadingWithId(
  heading: HeadingMatch,
  usedSlugs: Set<string>,
): string {
  if (ID_ATTRIBUTE_PATTERN.test(heading.attributes)) {
    const existingId = extractIdAttribute(heading.attributes);
    if (existingId) {
      usedSlugs.add(existingId);
    }
    return heading.source;
  }

  const baseSlug = slugifyHeadingText(heading.content);
  if (!baseSlug) {
    return heading.source;
  }

  const slug = dedupeSlug(baseSlug, usedSlugs);
  usedSlugs.add(slug);

  return `<h${heading.level}${heading.attributes} id="${slug}">${heading.content}</h${heading.level}>`;
}
