/**
 * Albanian word data - Words with exactly 5 characters
 * Used for 5-letter word game with API validation
 */

// All words here have exactly 5 CHARACTERS (character-based counting, not tokens)
export const ANSWER_WORDS = [
    'AKULL', 'ANIJA', 'ARDHI', 'BANJO', 'BARKA', 'BASHA', 'BATON',
    'BEBJA', 'BESON', 'BIBLE', 'BILBI', 'BISHT', 'BIZON', 'BLERA', 'BLOKU',
    'BOLLA', 'BORIA', 'BOTËR', 'BRAVA', 'BREZI', 'BRIRI', 'BUJAR', 'BUNAR',
    'BURIM', 'BUZËQ', 'ÇANTA', 'ÇARJA', 'ÇELËS', 'ÇIKLA', 'ÇIZME', 'ÇMIMI',
    'ÇORBA', 'ÇUPËR', 'DALLA', 'DARDH', 'DETYR', 'DIELL', 'DIMRI',
    'DRITA', 'DRUJT', 'DUART', 'DYQET', 'ENDËR', 'ERMAL', 'ETHET',
    'FAMIL', 'FARAT', 'FJOKA', 'FLAKA', 'FLORI', 'FOKUS', 'FONDI', 'FORUM',
    'FRATI', 'FRONI', 'FSHAT', 'FTOHT', 'FUÇIA', 'GATIM', 'GJUHA', 'GJUMI',
    'GJYSH', 'GOJËT', 'GRADA', 'GRARI', 'GRIPI', 'GROPA', 'GURRA', 'HAKIM',
    'HALLI', 'HARTA', 'HECJE', 'HELMI', 'HEROI', 'HESHT', 'HIDRA', 'HIJET',
    'HORRI', 'HUDHË', 'HUNDI', 'IDRIZ', 'IKONA', 'ILIRI', 'IMAZH', 'INATI',
    'ISHIN', 'JAKUP', 'JAMBI', 'JARAN', 'JETON', 'JONËT', 'KACHA', 'KAFSH',
    'KALLA', 'KAMER', 'KANËT', 'KAPAK', 'KAPEL', 'KARRO', 'KASHT', 'KATIN',
    'KAZAN', 'KËMIS', 'KËRRI', 'KËSUL', 'KISHA', 'KLASA', 'KODRA', 'KOMOD',
    'KONAK', 'KOPJA', 'KORBI', 'KOSHI', 'KRAHI', 'KREMI', 'KRIFA', 'KRIMI',
    'KRIPA', 'KROJI', 'KRYQI', 'KULLË', 'KUMTI', 'KUNOR', 'KUROR',
    'LAGJA', 'LAMPA', 'LAPSI', 'LARGA', 'LARTA', 'LEPUR', 'LIDHI',
    'LIMON', 'LINJA', 'LIRIA', 'LISAT', 'LIVAD', 'LLOJI', 'LOJRA', 'LUGAT',
    'LULET', 'LUMEN', 'LUTJA', 'MAÇKA', 'MADHI', 'MAGJI', 'MALLI', 'MANGO',
    'MARAK', 'MASHT', 'MATJA', 'MBESA', 'MBRET', 'MEDAL', 'MENDI',
    'MERAK', 'METRI', 'MIKJA', 'MINAR', 'MIRAT', 'MJALT', 'MODRA', 'MOLLA',
    'MOTRA', 'MURAT', 'MUSLI', 'MUZIK', 'NATAJ', 'NDEJA', 'NDRIT', 'NEPËR',
    'NGRIR', 'NISMA', 'NJOHA', 'NUSJA', 'OBORR', 'ODAJA', 'OFERT', 'ORIZI',
    'PAGAT', 'PAKTI', 'PALLA', 'PANDA', 'PAPIR', 'PARJA', 'PARKU',
    'PATAK', 'PENAT', 'PERJA', 'PESHA', 'PETAK', 'PIJET', 'PILOT',
    'PIRUN', 'PISHA', 'PLAKA', 'PLANI', 'PLISI', 'POEMA', 'PORTA'
  
];

// For now, just use answer words as allowed words
export const ALLOWED_WORDS = ANSWER_WORDS;

// Export with correct character length (5 characters)
export const VALID_ANSWER_WORDS = ANSWER_WORDS;
export const VALID_ALLOWED_WORDS = ALLOWED_WORDS;

// Quick lookup sets
export const ANSWER_WORDS_SET = new Set(VALID_ANSWER_WORDS);
export const ALLOWED_WORDS_SET = new Set(VALID_ALLOWED_WORDS);
