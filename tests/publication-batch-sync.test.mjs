import assert from "node:assert/strict";
import test from "node:test";
import { syncMergedSubmissions } from "../functions/_lib/publication.js";

test("an open batch publication PR updates every linked CMS submission", async () => {
  const updates = [];
  const db = {
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async run() {
              updates.push({ sql, values });
              return { meta: { changes: 1 } };
            }
          };
        }
      };
    }
  };
  const submissions = [
    { submission_id: "submission-en", pr_state: "open" },
    { submission_id: "submission-zh", pr_state: "open" },
    { submission_id: "submission-es", pr_state: "open" }
  ];

  const result = await syncMergedSubmissions(db, submissions, { merged: false, state: "open" });

  assert.equal(result.state, "open");
  assert.equal(result.databaseSync, null);
  assert.equal(updates.length, 3);
  assert.ok(updates.every((update) => update.sql.includes("SET pr_state = 'open'")));
});

test("already-synchronized variants are skipped on a batch retry", async () => {
  const updates = [];
  const db = {
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async run() {
              updates.push({ sql, values });
              return { meta: { changes: 1 } };
            }
          };
        }
      };
    }
  };
  const submissions = [
    { submission_id: "already-merged", pr_state: "merged" },
    { submission_id: "still-open", pr_state: "open" }
  ];

  const result = await syncMergedSubmissions(db, submissions, { merged: false, state: "open" });

  assert.equal(result.state, "open");
  assert.equal(updates.length, 1);
  assert.equal(updates[0].values.at(-1), "still-open");
});
