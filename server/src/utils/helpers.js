const fs = require('fs');
const path = require('path');
const Category = require('../models/Category');

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Returns a slug not used by another category
async function uniqueCategorySlug(name, excludeId) {
  const base = slugify(name) || 'category';
  let slug = base;
  let n = 2;
  while (await Category.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

// Deletes a file previously saved under /uploads (ignores anything else)
function removeUpload(urlPath) {
  if (!urlPath || !urlPath.startsWith('/uploads/')) return;
  const file = path.join(__dirname, '..', '..', urlPath);
  fs.promises.unlink(file).catch(() => {});
}

module.exports = { slugify, uniqueCategorySlug, removeUpload };
