import { TextField } from "./TextField";
import { SelectField } from "./SelectField";
import { RatingField } from "./RatingField";
import { ScaleField } from "./ScaleField";
import { MatrixField } from "./MatrixField";
import { NPSField } from "./NPSField";
import { FileUploadField } from "./FileUploadField";
import { DateField } from "./DateField";
import { SignatureField } from "./SignatureField";
import type { Field } from "@/lib/schema/survey";
import type { ComponentType } from "react";

interface FieldComponentProps {
  field: Field;
  disabled?: boolean;
}

interface FieldRegistryEntry {
  BuilderComponent: ComponentType<FieldComponentProps>;
  RendererComponent: ComponentType<FieldComponentProps>;
}

export const FIELD_REGISTRY: Record<string, FieldRegistryEntry> = {
  text: { BuilderComponent: TextField, RendererComponent: TextField },
  number: { BuilderComponent: TextField, RendererComponent: TextField },
  email: { BuilderComponent: TextField, RendererComponent: TextField },
  phone: { BuilderComponent: TextField, RendererComponent: TextField },
  select: { BuilderComponent: SelectField, RendererComponent: SelectField },
  multi_select: { BuilderComponent: SelectField, RendererComponent: SelectField },
  rating: { BuilderComponent: RatingField, RendererComponent: RatingField },
  scale: { BuilderComponent: ScaleField, RendererComponent: ScaleField },
  matrix: { BuilderComponent: MatrixField, RendererComponent: MatrixField },
  ranking: { BuilderComponent: SelectField, RendererComponent: SelectField },
  file_upload: { BuilderComponent: FileUploadField, RendererComponent: FileUploadField },
  date: { BuilderComponent: DateField, RendererComponent: DateField },
  time: { BuilderComponent: DateField, RendererComponent: DateField },
  signature: { BuilderComponent: SignatureField, RendererComponent: SignatureField },
  nps: { BuilderComponent: NPSField, RendererComponent: NPSField },
};
