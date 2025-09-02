
import { InsulinType } from './types';

interface InsulinTypeDetail {
  name: string;
  colorClass: string;
}

export const INSULIN_TYPE_DETAILS: Record<InsulinType, InsulinTypeDetail> = {
  [InsulinType.RAPID_ACTING]: {
    name: 'Rapid-acting',
    colorClass: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  },
  [InsulinType.SHORT_ACTING]: {
    name: 'Short-acting',
    colorClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  },
  [InsulinType.INTERMEDIATE_ACTING]: {
    name: 'Intermediate-acting',
    colorClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  },
  [InsulinType.LONG_ACTING]: {
    name: 'Long-acting',
    colorClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  },
};