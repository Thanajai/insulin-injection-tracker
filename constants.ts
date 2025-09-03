
import { InsulinType, GlucoseType, InjectionSite } from './types';

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

interface GlucoseTypeDetail {
    nameKey: string;
}

export const GLUCOSE_TYPE_DETAILS: Record<GlucoseType, GlucoseTypeDetail> = {
    [GlucoseType.PRE_MEAL]: { nameKey: 'preMeal' },
    [GlucoseType.POST_MEAL]: { nameKey: 'postMeal' },
    [GlucoseType.FASTING]: { nameKey: 'fasting' },
    [GlucoseType.OTHER]: { nameKey: 'other' },
};

export const GLUCOSE_THRESHOLDS = {
  HYPO: 70,  // Lower bound for normal
  HYPER: 180, // Upper bound for normal
};

interface InjectionSiteDetail {
    nameKey: string;
    coords: { cx: string; cy: string };
    area: { x: string; y: string; width: string; height: string; }
}

export const INJECTION_SITE_DETAILS: Record<InjectionSite, InjectionSiteDetail> = {
    [InjectionSite.LEFT_ABDOMEN_UPPER]: { nameKey: 'leftAbdomenUpper', coords: { cx: '35%', cy: '35%' }, area: { x: '0', y: '0', width: '50%', height: '50%' } },
    [InjectionSite.RIGHT_ABDOMEN_UPPER]: { nameKey: 'rightAbdomenUpper', coords: { cx: '65%', cy: '35%' }, area: { x: '50%', y: '0', width: '50%', height: '50%' } },
    [InjectionSite.LEFT_ABDOMEN_LOWER]: { nameKey: 'leftAbdomenLower', coords: { cx: '35%', cy: '65%' }, area: { x: '0', y: '50%', width: '50%', height: '50%' } },
    [InjectionSite.RIGHT_ABDOMEN_LOWER]: { nameKey: 'rightAbdomenLower', coords: { cx: '65%', cy: '65%' }, area: { x: '50%', y: '50%', width: '50%', height: '50%' } },
};
