import { Post } from "@/atoms/postsAtom";

export type CriterionTag = { value: string; label: string };

export type CriteriaField = CriterionTag | CriterionTag[];

export function applyCriteriaFilter(
  posts: Post[],
  criteriaFilters: string[]
): Post[] {
  if (!criteriaFilters.length) return [...posts];
  return posts.filter((p) => {
    if (!p.criteria) return false;
    const vals: string[] = Array.isArray(p.criteria)
      ? p.criteria.map((c) => c?.value)
      : [p.criteria.value];
    return vals.some((v) => criteriaFilters.includes(v));
  });
}
