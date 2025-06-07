import { db } from "../db";
import { customFields, customFieldValues, type CustomField, type NewCustomField, type CustomFieldValue, type NewCustomFieldValue } from "../db/schema";
import { eq, and, isNull, desc, asc } from "drizzle-orm";

export interface CreateCustomFieldData {
  tenantId: number;
  fieldName: string;
  fieldType: "text" | "number" | "boolean" | "date" | "dropdown";
  entityType: "user" | "post" | "board" | "comment";
  config: {
    required?: boolean;
    defaultValue?: any;
    options?: string[]; // For dropdown type
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
    description?: string;
    placeholder?: string;
  };
}

export interface UpdateCustomFieldData {
  fieldName?: string;
  fieldType?: "text" | "number" | "boolean" | "date" | "dropdown";
  config?: {
    required?: boolean;
    defaultValue?: any;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
    description?: string;
    placeholder?: string;
  };
}

export interface CreateCustomFieldValueData {
  fieldId: number;
  entityId: number;
  value: any;
}

export interface CustomFieldFilters {
  tenantId: number;
  entityType?: "user" | "post" | "board" | "comment";
  fieldType?: "text" | "number" | "boolean" | "date" | "dropdown";
  limit?: number;
  offset?: number;
}

export interface CustomFieldValueFilters {
  fieldId?: number;
  entityId?: number;
  limit?: number;
  offset?: number;
}

export class CustomFieldFunctions {
  static async createCustomField(fieldData: CreateCustomFieldData): Promise<CustomField> {
    try {
      // Check if field with same name already exists for this tenant and entity type
      const existingField = await db.query.customFields.findFirst({
        where: and(
          eq(customFields.tenantId, fieldData.tenantId),
          eq(customFields.entityType, fieldData.entityType),
          eq(customFields.fieldName, fieldData.fieldName)
        ),
      });

      if (existingField) {
        throw new Error(`Custom field '${fieldData.fieldName}' already exists for ${fieldData.entityType} in this tenant`);
      }

      // Validate dropdown options
      if (fieldData.fieldType === "dropdown" && (!fieldData.config.options || fieldData.config.options.length === 0)) {
        throw new Error("Dropdown fields must have at least one option");
      }

      const [newField] = await db
        .insert(customFields)
        .values({
          tenantId: fieldData.tenantId,
          fieldName: fieldData.fieldName,
          fieldType: fieldData.fieldType,
          entityType: fieldData.entityType,
          config: fieldData.config,
        })
        .returning();

      return newField;
    } catch (error) {
      throw new Error(`Failed to create custom field: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCustomFieldById(fieldId: number, tenantId: number): Promise<CustomField | null> {
    try {
      const field = await db.query.customFields.findFirst({
        where: and(
          eq(customFields.id, fieldId),
          eq(customFields.tenantId, tenantId)
        ),
      });

      return field || null;
    } catch (error) {
      throw new Error(`Failed to get custom field: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCustomFieldsByTenant(filters: CustomFieldFilters): Promise<CustomField[]> {
    try {
      const conditions = [eq(customFields.tenantId, filters.tenantId)];

      if (filters.entityType) {
        conditions.push(eq(customFields.entityType, filters.entityType));
      }

      if (filters.fieldType) {
        conditions.push(eq(customFields.fieldType, filters.fieldType));
      }

      const fields = await db.query.customFields.findMany({
        where: and(...conditions),
        orderBy: [asc(customFields.fieldName)],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      return fields;
    } catch (error) {
      throw new Error(`Failed to get custom fields by tenant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCustomFieldsByEntity(tenantId: number, entityType: "user" | "post" | "board" | "comment"): Promise<CustomField[]> {
    try {
      const fields = await db.query.customFields.findMany({
        where: and(
          eq(customFields.tenantId, tenantId),
          eq(customFields.entityType, entityType)
        ),
        orderBy: [asc(customFields.fieldName)],
      });

      return fields;
    } catch (error) {
      throw new Error(`Failed to get custom fields by entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateCustomField(fieldId: number, tenantId: number, updateData: UpdateCustomFieldData): Promise<CustomField> {
    try {
      // If updating field name, check for conflicts
      if (updateData.fieldName) {
        const currentField = await this.getCustomFieldById(fieldId, tenantId);
        if (!currentField) {
          throw new Error("Custom field not found");
        }

        const existingField = await db.query.customFields.findFirst({
          where: and(
            eq(customFields.tenantId, tenantId),
            eq(customFields.entityType, currentField.entityType),
            eq(customFields.fieldName, updateData.fieldName)
          ),
        });

        if (existingField && existingField.id !== fieldId) {
          throw new Error(`Custom field '${updateData.fieldName}' already exists for ${currentField.entityType} in this tenant`);
        }
      }

      // Validate dropdown options if updating field type or config
      if (updateData.fieldType === "dropdown" || updateData.config?.options) {
        const config = updateData.config || {};
        if (!config.options || config.options.length === 0) {
          throw new Error("Dropdown fields must have at least one option");
        }
      }

      const [updatedField] = await db
        .update(customFields)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(customFields.id, fieldId),
          eq(customFields.tenantId, tenantId)
        ))
        .returning();

      if (!updatedField) {
        throw new Error("Custom field not found");
      }

      return updatedField;
    } catch (error) {
      throw new Error(`Failed to update custom field: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteCustomField(fieldId: number, tenantId: number): Promise<void> {
    try {
      // First delete all values for this field
      await db
        .delete(customFieldValues)
        .where(eq(customFieldValues.fieldId, fieldId));

      // Then delete the field definition
      const deletedRows = await db
        .delete(customFields)
        .where(and(
          eq(customFields.id, fieldId),
          eq(customFields.tenantId, tenantId)
        ));

      if (deletedRows.rowCount === 0) {
        throw new Error("Custom field not found");
      }
    } catch (error) {
      throw new Error(`Failed to delete custom field: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Custom Field Values
  static async setCustomFieldValue(valueData: CreateCustomFieldValueData): Promise<CustomFieldValue> {
    try {
      // Get the field to validate
      const field = await db.query.customFields.findFirst({
        where: eq(customFields.id, valueData.fieldId),
      });

      if (!field) {
        throw new Error("Custom field not found");
      }

      // Validate the value based on field type and config
      const validationResult = this.validateFieldValue(valueData.value, field);
      if (!validationResult.isValid) {
        throw new Error(`Invalid value: ${validationResult.error}`);
      }

      // Check if value already exists for this field and entity
      const existingValue = await db.query.customFieldValues.findFirst({
        where: and(
          eq(customFieldValues.fieldId, valueData.fieldId),
          eq(customFieldValues.entityId, valueData.entityId)
        ),
      });

      if (existingValue) {
        // Update existing value
        const [updatedValue] = await db
          .update(customFieldValues)
          .set({
            value: valueData.value,
            updatedAt: new Date(),
          })
          .where(eq(customFieldValues.id, existingValue.id))
          .returning();

        return updatedValue;
      } else {
        // Create new value
        const [newValue] = await db
          .insert(customFieldValues)
          .values({
            fieldId: valueData.fieldId,
            entityId: valueData.entityId,
            value: valueData.value,
          })
          .returning();

        return newValue;
      }
    } catch (error) {
      throw new Error(`Failed to set custom field value: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCustomFieldValue(fieldId: number, entityId: number): Promise<CustomFieldValue | null> {
    try {
      const value = await db.query.customFieldValues.findFirst({
        where: and(
          eq(customFieldValues.fieldId, fieldId),
          eq(customFieldValues.entityId, entityId)
        ),
      });

      return value || null;
    } catch (error) {
      throw new Error(`Failed to get custom field value: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCustomFieldValuesByEntity(entityId: number, tenantId: number, entityType: "user" | "post" | "board" | "comment"): Promise<Array<CustomFieldValue & { field: CustomField }>> {
    try {
      const values = await db
        .select({
          value: customFieldValues,
          field: customFields,
        })
        .from(customFieldValues)
        .innerJoin(customFields, eq(customFieldValues.fieldId, customFields.id))
        .where(and(
          eq(customFieldValues.entityId, entityId),
          eq(customFields.tenantId, tenantId),
          eq(customFields.entityType, entityType)
        ))
        .orderBy(asc(customFields.fieldName));

      return values.map(v => ({ ...v.value, field: v.field }));
    } catch (error) {
      throw new Error(`Failed to get custom field values by entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCustomFieldValuesByField(fieldId: number, filters: CustomFieldValueFilters = {}): Promise<CustomFieldValue[]> {
    try {
      const conditions = [eq(customFieldValues.fieldId, fieldId)];

      if (filters.entityId) {
        conditions.push(eq(customFieldValues.entityId, filters.entityId));
      }

      const values = await db.query.customFieldValues.findMany({
        where: and(...conditions),
        orderBy: [desc(customFieldValues.createdAt)],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      });

      return values;
    } catch (error) {
      throw new Error(`Failed to get custom field values by field: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteCustomFieldValue(fieldId: number, entityId: number): Promise<void> {
    try {
      await db
        .delete(customFieldValues)
        .where(and(
          eq(customFieldValues.fieldId, fieldId),
          eq(customFieldValues.entityId, entityId)
        ));
    } catch (error) {
      throw new Error(`Failed to delete custom field value: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteCustomFieldValuesByEntity(entityId: number): Promise<void> {
    try {
      await db
        .delete(customFieldValues)
        .where(eq(customFieldValues.entityId, entityId));
    } catch (error) {
      throw new Error(`Failed to delete custom field values by entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validation
  static validateFieldValue(value: any, field: CustomField): { isValid: boolean; error?: string } {
    const config = field.config;

    // Required field validation
    if (config.required && (value === null || value === undefined || value === "")) {
      return { isValid: false, error: "Field is required" };
    }

    // Type-specific validation
    switch (field.fieldType) {
      case "text":
        if (value !== null && value !== undefined && typeof value !== "string") {
          return { isValid: false, error: "Value must be a string" };
        }
        if (config.validation?.min && value.length < config.validation.min) {
          return { isValid: false, error: `Minimum length is ${config.validation.min}` };
        }
        if (config.validation?.max && value.length > config.validation.max) {
          return { isValid: false, error: `Maximum length is ${config.validation.max}` };
        }
        if (config.validation?.pattern) {
          const regex = new RegExp(config.validation.pattern);
          if (!regex.test(value)) {
            return { isValid: false, error: "Value does not match required pattern" };
          }
        }
        break;

      case "number":
        if (value !== null && value !== undefined && typeof value !== "number") {
          return { isValid: false, error: "Value must be a number" };
        }
        if (config.validation?.min && value < config.validation.min) {
          return { isValid: false, error: `Minimum value is ${config.validation.min}` };
        }
        if (config.validation?.max && value > config.validation.max) {
          return { isValid: false, error: `Maximum value is ${config.validation.max}` };
        }
        break;

      case "boolean":
        if (value !== null && value !== undefined && typeof value !== "boolean") {
          return { isValid: false, error: "Value must be a boolean" };
        }
        break;

      case "date":
        if (value !== null && value !== undefined) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return { isValid: false, error: "Value must be a valid date" };
          }
        }
        break;

      case "dropdown":
        if (value !== null && value !== undefined) {
          if (!config.options || !config.options.includes(value)) {
            return { isValid: false, error: "Value must be one of the allowed options" };
          }
        }
        break;

      default:
        return { isValid: false, error: "Unknown field type" };
    }

    return { isValid: true };
  }

  static async getCustomFieldStats(tenantId: number, entityType?: "user" | "post" | "board" | "comment") {
    try {
      const conditions = [eq(customFields.tenantId, tenantId)];

      if (entityType) {
        conditions.push(eq(customFields.entityType, entityType));
      }

      const fields = await db.query.customFields.findMany({
        where: and(...conditions),
        columns: {
          id: true,
          fieldType: true,
          entityType: true,
          createdAt: true,
        },
      });

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return {
        total: fields.length,
        byType: fields.reduce((acc, field) => {
          acc[field.fieldType] = (acc[field.fieldType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byEntity: fields.reduce((acc, field) => {
          acc[field.entityType] = (acc[field.entityType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        newThisWeek: fields.filter(f => f.createdAt > oneWeekAgo).length,
        newThisMonth: fields.filter(f => f.createdAt > oneMonthAgo).length,
      };
    } catch (error) {
      throw new Error(`Failed to get custom field stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async searchCustomFields(query: string, tenantId: number, entityType?: "user" | "post" | "board" | "comment", limit = 20): Promise<CustomField[]> {
    try {
      const conditions = [eq(customFields.tenantId, tenantId)];

      if (entityType) {
        conditions.push(eq(customFields.entityType, entityType));
      }

      const fields = await db.query.customFields.findMany({
        where: and(...conditions),
        orderBy: [asc(customFields.fieldName)],
        limit,
      });

      // Filter by query (basic string matching)
      const searchTerm = query.toLowerCase();
      return fields.filter(field =>
        field.fieldName.toLowerCase().includes(searchTerm) ||
        (field.config.description && field.config.description.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      throw new Error(`Failed to search custom fields: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
