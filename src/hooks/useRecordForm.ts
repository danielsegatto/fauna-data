import { useState } from "react";
import {
  emptyRecordForm,
  observationDataToRecordForm,
  validateRecordForm,
  type RecordFormErrors,
  type RecordFormState,
} from "@/lib/recordForm";
import type { ObservationData } from "@/lib/types";

export function useRecordForm(initialForm: RecordFormState = emptyRecordForm) {
  const [form, setForm] = useState<RecordFormState>(initialForm);
  const [errors, setErrors] = useState<RecordFormErrors>({});

  const setField = <K extends keyof RecordFormState>(field: K, value: RecordFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const resetForm = (nextForm: RecordFormState = initialForm) => {
    setForm(nextForm);
    setErrors({});
  };

  const loadObservationData = (data: ObservationData) => {
    resetForm(observationDataToRecordForm(data));
  };

  const validate = () => {
    const nextErrors = validateRecordForm(form);
    setErrors(nextErrors);
    return {
      errors: nextErrors,
      isValid: Object.keys(nextErrors).length === 0,
    };
  };

  return {
    form,
    errors,
    setField,
    resetForm,
    loadObservationData,
    validate,
  };
}