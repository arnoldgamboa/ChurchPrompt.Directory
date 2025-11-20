import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import promptsData from '../src/data/prompts.json';
import { computeApprovedPrompts, getPromptByIdLocal } from '../convex/prompts';
import type { LocalPromptDoc } from '../convex/prompts';

// Cast JSON to LocalPromptDoc[] adding missing _id (dataset uses id)
const data: LocalPromptDoc[] = (promptsData as any[]).map(p => ({
  _id: p.id,
  title: p.title,
  content: p.content,
  excerpt: p.excerpt,
  category: p.category,
  tags: p.tags,
  authorId: p.authorId,
  authorName: p.authorName,
  status: p.status,
  usageCount: p.usageCount,
  executionCount: p.executionCount,
  featured: p.featured,
  createdAt: Date.parse(p.createdAt),
  updatedAt: Date.parse(p.updatedAt)
}));

// Property 19: Approved prompts query filtering
describe('Property 19: approved prompts filtering', () => {
  it('all returned prompts have status approved', () => {
    const result = computeApprovedPrompts(data, {});
    expect(result.every(r => r.id && data.find(d => d._id === r.id)?.status === 'approved')).toBe(true);
  });
});

// Property 20: Category filtering accuracy
describe('Property 20: category filtering accuracy', () => {
  const categories = Array.from(new Set(data.map(d => d.category)));
  it('all prompts match category when category arg provided', () => {
    categories.forEach(cat => {
      const result = computeApprovedPrompts(data, { category: cat });
      expect(result.every(r => data.find(d => d._id === r.id)?.category === cat || (data.find(d => d._id === r.id)?.status !== 'approved'))).toBe(true);
    });
  });
});

// Property 21: Search term matching (vacuous if empty set)
describe('Property 21: search term matching', () => {
  it('returned prompts contain search term in fields', () => {
    fc.assert(fc.property(fc.string(), (term) => {
      const trimmed = term.trim();
      const result = computeApprovedPrompts(data, { search: trimmed });
      return result.every(r => {
        const doc = data.find(d => d._id === r.id)!;
        const lowered = trimmed.toLowerCase();
        return lowered === '' ||
          doc.title.toLowerCase().includes(lowered) ||
          doc.content.toLowerCase().includes(lowered) ||
          doc.excerpt.toLowerCase().includes(lowered) ||
          doc.tags.some(t => t.toLowerCase().includes(lowered));
      });
    }), { numRuns: 100 });
  });
});

// Property 22: Prompt ID query accuracy
describe('Property 22: prompt id query accuracy', () => {
  it('getPromptByIdLocal returns matching _id', () => {
    data.forEach(d => {
      const found = getPromptByIdLocal(data, d._id);
      expect(found?._id).toBe(d._id);
    });
  });
});

// Property 23: Prompt display field completeness
describe('Property 23: display field completeness', () => {
  it('computeApprovedPrompts maps required fields', () => {
    const result = computeApprovedPrompts(data, {});
    result.forEach(r => {
      expect(r).toHaveProperty('id');
      expect(r).toHaveProperty('title');
      expect(r).toHaveProperty('excerpt');
      expect(r).toHaveProperty('category');
      expect(r).toHaveProperty('authorName');
      expect(r).toHaveProperty('usageCount');
      expect(r).toHaveProperty('createdAt');
    });
  });
});
