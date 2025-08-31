import { integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { organization } from './organization';

export const issueSequences = pgTable(
  'issue_sequences',
  {
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    lastNumber: integer('last_number').notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({
      name: 'issue_sequences_pk',
      columns: [table.organizationId],
    }),
  })
);
