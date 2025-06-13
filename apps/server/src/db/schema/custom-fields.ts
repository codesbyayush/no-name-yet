// import {
//   pgTable,
//   serial,
//   integer,
//   text,
//   timestamp,
//   jsonb,
//   pgEnum,
//   unique,
//   index,
// } from "drizzle-orm/pg-core";

// // Enum for field types
// export const fieldTypeEnum = pgEnum("field_type", [
//   "text",
//   "number",
//   "boolean",
//   "date",
//   "dropdown",
// ]);

// // Enum for entity types
// export const entityTypeEnum = pgEnum("entity_type", [
//   "user",
//   "post",
//   "board",
//   "comment",
// ]);

// // Custom fields table for field definitions
// export const customFields = pgTable(
//   "custom_fields",
//   {
//     id: text("id").primaryKey(),
//     tenantId: text("tenant_id")
//       .notNull()
//       .references(() => tenants.id, { onDelete: "cascade" }),
//     fieldName: text("field_name").notNull(),
//     fieldType: fieldTypeEnum("field_type").notNull(),
//     entityType: entityTypeEnum("entity_type").notNull(),
//     config: jsonb("config").notNull().$type<{
//       required?: boolean;
//       defaultValue?: any;
//       options?: string[]; // For dropdown type
//       validation?: {
//         min?: number;
//         max?: number;
//         pattern?: string;
//       };
//       description?: string;
//       placeholder?: string;
//     }>(),
//     createdAt: timestamp("created_at").defaultNow().notNull(),
//     updatedAt: timestamp("updated_at").defaultNow().notNull(),
//   },
//   (table) => ({
//     uniqueTenantEntityField: unique().on(
//       table.tenantId,
//       table.entityType,
//       table.fieldName,
//     ),
//   }),
// );

// // Custom field values table for storing actual values
// export const customFieldValues = pgTable(
//   "custom_field_values",
//   {
//     id: text("id").primaryKey(),
//     fieldId: text("field_id")
//       .notNull()
//       .references(() => customFields.id, { onDelete: "cascade" }),
//     entityId: text("entity_id").notNull(),
//     value: jsonb("value").notNull(),
//     createdAt: timestamp("created_at").defaultNow().notNull(),
//     updatedAt: timestamp("updated_at").defaultNow().notNull(),
//   },
//   (table) => ({
//     entityIdx: index("idx_cfv_entity").on(table.entityId),
//   }),
// );

// // Export types for TypeScript
// export type CustomField = typeof customFields.$inferSelect;
// export type NewCustomField = typeof customFields.$inferInsert;
// export type CustomFieldValue = typeof customFieldValues.$inferSelect;
// export type NewCustomFieldValue = typeof customFieldValues.$inferInsert;
