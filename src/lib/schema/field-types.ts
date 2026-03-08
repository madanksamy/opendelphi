import type { FieldType } from "./survey";

export type FieldCategory = "basic" | "choice" | "advanced" | "layout";

export interface FieldTypeConfig {
  label: string;
  icon: string; // lucide-react icon name
  category: FieldCategory;
  defaultConfig: {
    required: boolean;
    properties?: Record<string, unknown>;
    validation?: Record<string, unknown>;
    options?: { id: string; label: string; value: string }[];
  };
}

export const FIELD_TYPES: Record<FieldType, FieldTypeConfig> = {
  text: {
    label: "Text",
    icon: "Type",
    category: "basic",
    defaultConfig: {
      required: false,
      properties: { placeholder: "", multiline: false },
      validation: { maxLength: 1000 },
    },
  },
  number: {
    label: "Number",
    icon: "Hash",
    category: "basic",
    defaultConfig: {
      required: false,
      properties: { placeholder: "", allowDecimals: true },
    },
  },
  email: {
    label: "Email",
    icon: "Mail",
    category: "basic",
    defaultConfig: {
      required: false,
      properties: { placeholder: "you@example.com" },
    },
  },
  phone: {
    label: "Phone",
    icon: "Phone",
    category: "basic",
    defaultConfig: {
      required: false,
      properties: { placeholder: "", defaultCountry: "US" },
    },
  },
  select: {
    label: "Dropdown",
    icon: "ChevronDown",
    category: "choice",
    defaultConfig: {
      required: false,
      options: [
        { id: "opt-1", label: "Option 1", value: "option_1" },
        { id: "opt-2", label: "Option 2", value: "option_2" },
      ],
      properties: { searchable: false },
    },
  },
  multi_select: {
    label: "Multi Select",
    icon: "ListChecks",
    category: "choice",
    defaultConfig: {
      required: false,
      options: [
        { id: "opt-1", label: "Option 1", value: "option_1" },
        { id: "opt-2", label: "Option 2", value: "option_2" },
      ],
      properties: { minSelections: 0, maxSelections: 0 },
    },
  },
  rating: {
    label: "Rating",
    icon: "Star",
    category: "choice",
    defaultConfig: {
      required: false,
      properties: { maxRating: 5, icon: "star" },
    },
  },
  scale: {
    label: "Scale",
    icon: "SlidersHorizontal",
    category: "choice",
    defaultConfig: {
      required: false,
      properties: {
        min: 1,
        max: 10,
        step: 1,
        minLabel: "Not at all",
        maxLabel: "Extremely",
      },
    },
  },
  matrix: {
    label: "Matrix",
    icon: "Grid3X3",
    category: "advanced",
    defaultConfig: {
      required: false,
      properties: {
        rows: ["Row 1", "Row 2"],
        columns: ["Column 1", "Column 2", "Column 3"],
        allowMultiple: false,
      },
    },
  },
  ranking: {
    label: "Ranking",
    icon: "ArrowUpDown",
    category: "advanced",
    defaultConfig: {
      required: false,
      options: [
        { id: "opt-1", label: "Item 1", value: "item_1" },
        { id: "opt-2", label: "Item 2", value: "item_2" },
        { id: "opt-3", label: "Item 3", value: "item_3" },
      ],
    },
  },
  file_upload: {
    label: "File Upload",
    icon: "Upload",
    category: "advanced",
    defaultConfig: {
      required: false,
      properties: { maxFiles: 1 },
      validation: {
        allowedFileTypes: ["image/*", "application/pdf"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
      },
    },
  },
  date: {
    label: "Date",
    icon: "Calendar",
    category: "advanced",
    defaultConfig: {
      required: false,
      properties: { includeTime: false, dateFormat: "yyyy-MM-dd" },
    },
  },
  time: {
    label: "Time",
    icon: "Clock",
    category: "advanced",
    defaultConfig: {
      required: false,
      properties: { format: "HH:mm", use24Hour: true },
    },
  },
  signature: {
    label: "Signature",
    icon: "PenLine",
    category: "advanced",
    defaultConfig: {
      required: false,
      properties: { penColor: "#000000", backgroundColor: "#ffffff" },
    },
  },
  nps: {
    label: "NPS",
    icon: "Gauge",
    category: "advanced",
    defaultConfig: {
      required: false,
      properties: {
        lowLabel: "Not at all likely",
        highLabel: "Extremely likely",
      },
    },
  },
  section_break: {
    label: "Section Break",
    icon: "Minus",
    category: "layout",
    defaultConfig: {
      required: false,
      properties: { showDivider: true },
    },
  },
  statement: {
    label: "Statement",
    icon: "MessageSquare",
    category: "layout",
    defaultConfig: {
      required: false,
      properties: { buttonText: "Continue" },
    },
  },
  payment: {
    label: "Payment",
    icon: "CreditCard",
    category: "advanced",
    defaultConfig: {
      required: false,
      properties: {
        currency: "USD",
        amount: 0,
        provider: "stripe",
      },
    },
  },
} as const;

export const FIELD_CATEGORIES: { key: FieldCategory; label: string }[] = [
  { key: "basic", label: "Basic Fields" },
  { key: "choice", label: "Choice Fields" },
  { key: "advanced", label: "Advanced Fields" },
  { key: "layout", label: "Layout Elements" },
];
