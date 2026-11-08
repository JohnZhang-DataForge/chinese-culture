import { getVariant } from "./cms.js";

async function finalizeMediaSubmission(db, submission) {
  const current = await getVariant(db, submission.content_id, submission.locale);
  if (!current) return { synced: false, reason: "content_variant_missing" };
  if (Number(current.revision) !== Number(submission.revision)) return { synced: false, reason: "revision_changed_after_submission" };
  let snapshotData;
  try { snapshotData = JSON.parse(submission.snapshot_json || "{}"); } catch { snapshotData = {}; }
  const media = snapshotData.media;
  if (!media || typeof media.src !== "string") return { synced: false, reason: "media_snapshot_missing" };
  const existing = current.media || [];
  if (existing.some((item) => item.src === media.src)) return { synced: true, status: current.status, alreadyAttached: true };
  const nextMedia = [...existing, media];
  const now = new Date().toISOString();
  const nextRevision = Number(current.revision) + 1;
  const mutationId = crypto.randomUUID();
  const snapshot = {
    contentId: current.contentId, locale: current.locale, collection: current.collection,
    slug: current.slug, title: current.title, description: current.description,
    category: current.category, status: current.status, featured: Boolean(current.featured),
    updatedAt: now, revision: String(nextRevision), readingMinutes: current.readingMinutes,
    bodyMarkdown: current.bodyMarkdown, tags: current.tags || [],
    sources: current.sources || [], media: nextMedia
  };
  if (current.seoTitle) snapshot.seoTitle = current.seoTitle;
  if (current.seoDescription) snapshot.seoDescription = current.seoDescription;
  if (current.publishedAt) snapshot.publishedAt = current.publishedAt;
  if (current.order !== undefined) snapshot.order = current.order;
  if (current.level) snapshot.level = current.level;
  if (current.chinese) snapshot.chinese = current.chinese;
  if (current.pinyin) snapshot.pinyin = current.pinyin;
  if (current.imageUrl) snapshot.imageUrl = current.imageUrl;
  if (current.imageAlt) snapshot.imageAlt = current.imageAlt;

  const results = await db.batch([
    db.prepare("UPDATE content_variants SET media_json = ?, updated_at = ?, revision = revision + 1, last_mutation_id = ? WHERE content_id = ? AND locale = ? AND revision = ?")
      .bind(JSON.stringify(nextMedia), now, mutationId, current.contentId, current.locale, Number(current.revision)),
    db.prepare("INSERT INTO content_revisions (revision_id, content_id, locale, revision, actor_email, snapshot_json, created_at) SELECT ?, content_id, locale, revision, ?, ?, ? FROM content_variants WHERE content_id = ? AND locale = ? AND revision = ? AND last_mutation_id = ?")
      .bind(crypto.randomUUID(), "cms-media-bot@system.local", JSON.stringify(snapshot), now, current.contentId, current.locale, nextRevision, mutationId)
  ]);
  if (!results[0]?.meta?.changes || results[1]?.meta?.changes !== 1) return { synced: false, reason: "media_revision_sync_failed" };
  return { synced: true, status: current.status };
}

async function finalizeMergedSubmission(db, submission) {
  if (submission.intent === "review") return { synced: true, status: "draft" };
  if (submission.intent === "media") return finalizeMediaSubmission(db, submission);
  const current = await getVariant(db, submission.content_id, submission.locale);
  if (!current) return { synced: false, reason: "content_variant_missing" };
  if (Number(current.revision) !== Number(submission.revision)) {
    return { synced: false, reason: "revision_changed_after_submission" };
  }
  const status = submission.intent === "unpublish" ? "unpublished" : "published";
  const now = new Date().toISOString();
  const nextRevision = Number(current.revision) + 1;
  const mutationId = crypto.randomUUID();
  const publishedAt = status === "published" ? (current.publishedAt || now) : (current.publishedAt || null);
  const snapshot = {
    contentId: current.contentId, locale: current.locale, collection: current.collection,
    slug: current.slug, title: current.title, description: current.description,
    category: current.category, status, featured: Boolean(current.featured),
    updatedAt: now, revision: String(nextRevision), readingMinutes: current.readingMinutes,
    bodyMarkdown: current.bodyMarkdown, tags: current.tags || [],
    sources: current.sources || [], media: current.media || []
  };
  if (current.seoTitle) snapshot.seoTitle = current.seoTitle;
  if (current.seoDescription) snapshot.seoDescription = current.seoDescription;
  if (publishedAt) snapshot.publishedAt = publishedAt;
  if (current.order !== undefined) snapshot.order = current.order;
  if (current.level) snapshot.level = current.level;
  if (current.chinese) snapshot.chinese = current.chinese;
  if (current.pinyin) snapshot.pinyin = current.pinyin;
  if (current.imageUrl) snapshot.imageUrl = current.imageUrl;
  if (current.imageAlt) snapshot.imageAlt = current.imageAlt;

  const results = await db.batch([
    db.prepare("UPDATE content_variants SET status = ?, published_at = ?, updated_at = ?, revision = revision + 1, last_mutation_id = ? WHERE content_id = ? AND locale = ? AND revision = ?")
      .bind(status, publishedAt, now, mutationId, current.contentId, current.locale, Number(current.revision)),
    db.prepare("INSERT INTO content_revisions (revision_id, content_id, locale, revision, actor_email, snapshot_json, created_at) SELECT ?, content_id, locale, revision, ?, ?, ? FROM content_variants WHERE content_id = ? AND locale = ? AND revision = ? AND last_mutation_id = ?")
      .bind(crypto.randomUUID(), "cms-publication-bot@system.local", JSON.stringify(snapshot), now, current.contentId, current.locale, nextRevision, mutationId)
  ]);
  if (!results[0]?.meta?.changes || results[1]?.meta?.changes !== 1) {
    return { synced: false, reason: "database_revision_sync_failed" };
  }
  return { synced: true, status };
}

export async function syncMergedSubmission(db, submission, pull) {
  if (!pull.merged && pull.state !== "closed") {
    await db.prepare("UPDATE cms_submissions SET pr_state = 'open', updated_at = ? WHERE submission_id = ?")
      .bind(new Date().toISOString(), submission.submission_id).run();
    return { state: "open", databaseSync: null };
  }
  if (pull.merged) {
    const databaseSync = await finalizeMergedSubmission(db, submission);
    if (!databaseSync.synced) return { state: "merged", databaseSync };
    await db.prepare("UPDATE cms_submissions SET pr_state = 'merged', merged_at = ?, updated_at = ? WHERE submission_id = ?")
      .bind(pull.merged_at || new Date().toISOString(), new Date().toISOString(), submission.submission_id).run();
    return { state: "merged", databaseSync };
  }
  await db.prepare("UPDATE cms_submissions SET pr_state = 'closed', updated_at = ? WHERE submission_id = ?")
    .bind(new Date().toISOString(), submission.submission_id).run();
  return { state: "closed", databaseSync: null };
}
