// Compile-time guard for Post.criteria typing.
//
// The criteria filters (see src/lib/filterPosts.ts and the two feed components)
// rely on `Post.criteria` being typed as a union of the single-object and array
// shapes that legitimately exist in stored posts. If this type ever regresses to
// only the single-object form `{ value, label }`, the `Array.isArray` branch in
// the filter and the `[p.criteria.value]` fallback both become dead/incorrect,
// and the original multi-criteria filter bug (commit bd57754) can silently
// reappear. This file fails the build (`tsc --noEmit`) in that case.
//
// The directive on the line below asserts that unguarded singular access to a
// union-typed `criteria` is a compile error. If the type regresses to only the
// single-object form, that access becomes valid, the directive goes unused, and
// the compiler reports an unused-directive error, failing the build.

import type { Post } from "@/atoms/postsAtom";
import type { CriteriaField } from "@/lib/filterPosts";

// @ts-expect-error unguarded singular criteria access must not compile
const _guardUnguardedAccessFails: string = ({} as Post).criteria.value;

// The helper accepts exactly the union shape `Post.criteria` can take. If the
// `CriteriaField` type and `Post.criteria` drift apart, this assignment fails.
type _GuardHelperAcceptsPostCriteria = CriteriaField extends Post["criteria"]
  ? Post["criteria"] extends CriteriaField
    ? true
    : false
  : false;
const _guardHelperMatches: _GuardHelperAcceptsPostCriteria = true;

export type _CompileTimeCriteriaTypeGuard = typeof _guardUnguardedAccessFails &
  typeof _guardHelperMatches;
