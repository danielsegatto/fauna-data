export interface RecordFormState {
  species: string;
  identification: string;
  environment: string;
  stratum: string;
  activity: string;
  quantity: string;
  distance: string;
  side: string;
  observations: string;
}

export type RecordFormErrors = Partial<Record<keyof RecordFormState, string>>;

export const emptyRecordForm: RecordFormState = {
  species: "",
  identification: "",
  environment: "",
  stratum: "",
  activity: "",
  quantity: "",
  distance: "",
  side: "",
  observations: "",
};

export function validateRecordForm(form: RecordFormState): RecordFormErrors {
  const errors: RecordFormErrors = {};

  if (!form.species.trim()) errors.species = "Espécie é obrigatória";
  if (!form.identification) errors.identification = "Identificação é obrigatória";
  if (!form.environment) errors.environment = "Ambiente é obrigatório";

  if (!form.quantity) {
    errors.quantity = "Quantidade é obrigatória";
  } else if (isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
    errors.quantity = "Deve ser um número positivo";
  }

  if (form.distance && (isNaN(Number(form.distance)) || Number(form.distance) < 0)) {
    errors.distance = "Deve ser um número ≥ 0";
  }

  return errors;
}

export function hasRecordFormChanges(
  form: RecordFormState,
  original: RecordFormState
): boolean {
  return (
    form.species !== original.species ||
    form.identification !== original.identification ||
    form.environment !== original.environment ||
    form.stratum !== original.stratum ||
    form.activity !== original.activity ||
    form.quantity !== original.quantity ||
    form.distance !== original.distance ||
    form.side !== original.side ||
    form.observations !== original.observations
  );
}