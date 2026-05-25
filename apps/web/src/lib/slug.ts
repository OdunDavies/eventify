export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "event";
}

export async function uniqueSlug(db: any, title: string): Promise<string> {
  let slug = generateSlug(title);
  let counter = 1;
  while (await db.event.findUnique({ where: { slug } })) {
    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }
  return slug;
}
