const HEADING_PATTERN = /<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
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

/**
 * Adds stable fragment IDs to rendered README headings that do not already have one.
 * @param html - The rendered README HTML returned by GitHub's markdown renderer.
 * @returns The README HTML with GitHub-style heading IDs for hash navigation.
 */
export function addReadmeHeadingIds(html: string): string {
  const usedSlugs = new Set<string>();

  return html.replace(
    HEADING_PATTERN,
    (heading: string, level: string, attributes = "", content: string) => {
      if (ID_ATTRIBUTE_PATTERN.test(attributes)) {
        const existingId = extractIdAttribute(attributes);
        if (existingId) {
          usedSlugs.add(existingId);
        }
        return heading;
      }

      const baseSlug = slugifyHeadingText(content);
      if (!baseSlug) {
        return heading;
      }

      const slug = dedupeSlug(baseSlug, usedSlugs);
      usedSlugs.add(slug);

      return `<h${level}${attributes} id="${slug}">${content}</h${level}>`;
    },
  );
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
