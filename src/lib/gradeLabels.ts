import { Locale } from './i18n/translations'

export const GRADE_LABELS: Record<string, Record<Locale, string>> = {
  K:      { ko: '유치원',         en: 'Kindergarten',  es: 'Preescolar'       },
  '1':    { ko: '1학년',          en: 'Grade 1',        es: '1° grado'         },
  '2':    { ko: '2학년',          en: 'Grade 2',        es: '2° grado'         },
  '3':    { ko: '3학년',          en: 'Grade 3',        es: '3° grado'         },
  '4':    { ko: '4학년',          en: 'Grade 4',        es: '4° grado'         },
  '5':    { ko: '5학년',          en: 'Grade 5',        es: '5° grado'         },
  '6':    { ko: '6학년',          en: 'Grade 6',        es: '6° grado'         },
  '7':    { ko: '중학교 1학년',   en: 'Grade 7',        es: '7° grado'         },
  '8':    { ko: '중학교 2학년',   en: 'Grade 8',        es: '8° grado'         },
  '9':    { ko: '중학교 3학년',   en: 'Grade 9',        es: '9° grado'         },
  '10':   { ko: '고등학교 1학년', en: 'Grade 10',       es: '10° grado'        },
  '11':   { ko: '고등학교 2학년', en: 'Grade 11',       es: '11° grado'        },
  '12':   { ko: '고등학교 3학년', en: 'Grade 12',       es: '12° grado'        },
  adult:  { ko: '성인',           en: 'Adult',          es: 'Adulto'           },
}

export function gradeLabel(key: string, locale: Locale): string {
  return GRADE_LABELS[key]?.[locale] ?? key
}
