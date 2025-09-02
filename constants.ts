
import { InsulinType } from './types';

interface InsulinTypeDetail {
  name: string;
  colorClass: string;
}

export const INSULIN_TYPE_DETAILS: Record<InsulinType, InsulinTypeDetail> = {
  [InsulinType.RAPID_ACTING]: {
    name: 'Rapid-acting',
    colorClass: 'bg-sky-100 text-sky-800',
  },
  [InsulinType.SHORT_ACTING]: {
    name: 'Short-acting',
    colorClass: 'bg-emerald-100 text-emerald-800',
  },
  [InsulinType.INTERMEDIATE_ACTING]: {
    name: 'Intermediate-acting',
    colorClass: 'bg-amber-100 text-amber-800',
  },
  [InsulinType.LONG_ACTING]: {
    name: 'Long-acting',
    colorClass: 'bg-rose-100 text-rose-800',
  },
};